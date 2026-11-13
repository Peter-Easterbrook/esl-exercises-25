#!/usr/bin/env node
// Uploads the letter-group irregular verb exercises built by ./build.js and
// retires the two old 100+ item blocks.
//
//   node scripts/irregular-verbs/upload.js              CHECK: read-only report
//   node scripts/irregular-verbs/upload.js --create     create the new exercises
//   node scripts/irregular-verbs/upload.js --delete-old delete the two old blocks
//
// Needs a Firebase service-account key (Admin SDK, bypasses Security Rules):
//   GOOGLE_APPLICATION_CREDENTIALS=<path to key .json>
// firebase-admin is deliberately NOT a project dependency (it would move the
// OTA fingerprint for a one-off script). Install it anywhere and point
// NODE_PATH at that node_modules folder.
//
// Run order: check -> --create -> verify in the app -> --delete-old.
// --create refuses to run if any new title already exists (no duplicates on a
// re-run). --delete-old refuses unless every new exercise exists, and mirrors
// the app's deleteExercise(): it also deletes the old blocks' userProgress.

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { buildExercises } = require('./build');

const OLD_TITLES = [
  'Irregular Verbs - Past Simple',
  'Irregular Verbs - Past Participle',
];

const mode = process.argv.includes('--create')
  ? 'create'
  : process.argv.includes('--delete-old')
    ? 'delete-old'
    : 'check';

const fail = (msg) => {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
};

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  fail('Set GOOGLE_APPLICATION_CREDENTIALS to the service-account key path.');
}

initializeApp({ credential: applicationDefault() });
const db = getFirestore();

const findByTitles = async (titles) => {
  const found = new Map();
  // Firestore 'in' takes up to 30 values.
  for (let i = 0; i < titles.length; i += 30) {
    const snap = await db
      .collection('exercises')
      .where('title', 'in', titles.slice(i, i + 30))
      .get();
    for (const d of snap.docs) {
      const t = d.get('title');
      if (!found.has(t)) found.set(t, []);
      found.get(t).push(d);
    }
  }
  return found;
};

const main = async () => {
  const { exercises, errors } = buildExercises();
  if (errors.length) {
    fail(`build.js reports problems:\n  - ${errors.join('\n  - ')}`);
  }
  const newTitles = exercises.map((e) => e.title);

  // ---- Old blocks ----
  const oldFound = await findByTitles(OLD_TITLES);
  const oldDocs = [];
  console.log('Old blocks:');
  for (const title of OLD_TITLES) {
    const docs = oldFound.get(title) ?? [];
    if (docs.length === 0) console.log(`  "${title}": not found`);
    for (const d of docs) {
      oldDocs.push(d);
      const progress = await db
        .collection('userProgress')
        .where('exerciseId', '==', d.id)
        .count()
        .get();
      const files = await db
        .collection('downloadableFiles')
        .where('exerciseId', '==', d.id)
        .get();
      const data = d.data();
      console.log(`  "${title}"  id=${d.id}`);
      console.log(
        `    category=${data.category}  difficulty=${data.difficulty}  ` +
          `pages=${data.content?.questions?.length ?? '?'}`,
      );
      console.log(
        `    userProgress records: ${progress.data().count}  ` +
          `linked files: ${files.size}` +
          (data.downloadableFiles?.length
            ? `  downloadableFiles field: ${data.downloadableFiles.length}`
            : ''),
      );
      for (const f of files.docs) console.log(`      file: ${f.get('name')}`);
      const standard = new Set([
        'title',
        'description',
        'instructions',
        'content',
        'category',
        'difficulty',
        'createdAt',
        'updatedAt',
        'downloadableFiles',
      ]);
      const extra = Object.keys(data).filter((k) => !standard.has(k));
      if (extra.length) console.log(`    extra fields: ${extra.join(', ')}`);
    }
  }

  // ---- New exercises ----
  const newFound = await findByTitles(newTitles);
  const existing = newTitles.filter((t) => newFound.has(t));
  console.log(
    `\nNew exercises: ${exercises.length} to create, ${existing.length} already exist.`,
  );
  for (const t of existing) console.log(`  exists: "${t}"`);

  if (mode === 'check') {
    console.log('\nCheck only. Nothing was written.');
    return;
  }

  if (mode === 'create') {
    if (oldDocs.length !== OLD_TITLES.length) {
      fail('Expected exactly one of each old block to copy category from.');
    }
    if (existing.length) fail('Some new titles already exist; not creating.');

    const categories = new Set(oldDocs.map((d) => d.get('category')));
    if (categories.size !== 1) {
      fail(`Old blocks are in different categories: ${[...categories]}`);
    }
    const category = [...categories][0];
    // Prefer the Past Simple block's difficulty if the two differ.
    const difficulty = oldDocs[0].get('difficulty');

    const now = Timestamp.now();
    const batch = db.batch();
    for (const ex of exercises) {
      batch.set(db.collection('exercises').doc(), {
        ...ex,
        category,
        difficulty,
        createdAt: now,
        updatedAt: now,
      });
    }
    await batch.commit();
    console.log(
      `\n✓ Created ${exercises.length} exercises in category ${category} (${difficulty}).`,
    );
    return;
  }

  if (mode === 'delete-old') {
    if (existing.length !== newTitles.length) {
      fail('Not every new exercise exists yet; run --create first.');
    }
    if (oldDocs.length === 0) {
      console.log('\nNothing to delete.');
      return;
    }
    for (const d of oldDocs) {
      const linked = await db
        .collection('downloadableFiles')
        .where('exerciseId', '==', d.id)
        .get();
      if (!linked.empty) {
        fail(`"${d.get('title')}" has linked files; relink them first.`);
      }
    }
    for (const d of oldDocs) {
      const progress = await db
        .collection('userProgress')
        .where('exerciseId', '==', d.id)
        .get();
      // Batches cap at 500 writes.
      for (let i = 0; i < progress.docs.length; i += 450) {
        const batch = db.batch();
        progress.docs.slice(i, i + 450).forEach((p) => batch.delete(p.ref));
        await batch.commit();
      }
      await d.ref.delete();
      console.log(
        `✓ Deleted "${d.get('title')}" and ${progress.size} progress records.`,
      );
    }
  }
};

main().catch((err) => fail(err?.stack || String(err)));
