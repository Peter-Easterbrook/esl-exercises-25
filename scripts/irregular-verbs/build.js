#!/usr/bin/env node
// Builds the letter-group irregular verb exercises from ./verbs.js.
//
//   node scripts/irregular-verbs/build.js                   preview in the terminal
//   node scripts/irregular-verbs/build.js --json out.json   also write the docs
//
// Nothing here talks to Firestore; upload.js does that. The output is the
// `exercises` document shape the app's createExercise() writes, minus
// createdAt/updatedAt and `category`/`difficulty`, which upload.js copies
// from the existing vocab blocks.
//
// Each exercise = simple-past page(s) followed by past-participle page(s).
// A page holds 3–6 pairs; groups over 6 verbs are split evenly across pages.

const fs = require('fs');
const path = require('path');
const { VERBS, GROUPS } = require('./verbs');

const MIN_PAIRS = 3;
const MAX_PAIRS = 6;
const MAX_VERBS_PER_EXERCISE = 10;
const TITLE_PREFIX = 'Irregular Verbs - ';

const FORMS = [
  {
    key: 'past',
    heading: 'Simple past (2nd form): match each verb with its past form',
  },
  {
    key: 'participle',
    heading:
      'Past participle (3rd form): match each verb with its past participle',
  },
];

const INSTRUCTIONS = {
  en: 'Match each verb in Column A with its correct form in Column B, then type the letter next to each number. Each page tells you which form you need: the simple past (e.g. go → went) or the past participle (e.g. go → gone).',
  es: 'Relaciona cada verbo de la columna A con su forma correcta de la columna B y escribe la letra junto a cada número. Cada página indica qué forma necesitas: el pasado simple (p. ej., go → went) o el participio pasado (p. ej., go → gone).',
  fr: 'Associez chaque verbe de la colonne A à sa forme correcte dans la colonne B, puis saisissez la lettre à côté de chaque numéro. Chaque page indique la forme demandée : le prétérit (ex. : go → went) ou le participe passé (ex. : go → gone).',
  de: 'Ordne jedem Verb in Spalte A die richtige Form in Spalte B zu und tippe den Buchstaben neben jede Zahl. Auf jeder Seite steht, welche Form gefragt ist: Simple Past (z. B. go → went) oder Past Participle (z. B. go → gone).',
  it: 'Abbina ogni verbo della colonna A alla forma corretta nella colonna B e scrivi la lettera accanto a ogni numero. Ogni pagina indica quale forma serve: il simple past (es. go → went) o il participio passato (es. go → gone).',
};

const letterFor = (i) => String.fromCharCode(65 + i);

// Split items into the fewest pages of <= MAX_PAIRS, as evenly as possible
// (9 -> 5+4, not 6+3).
const chunkEvenly = (items) => {
  const pages = Math.ceil(items.length / MAX_PAIRS);
  const base = Math.floor(items.length / pages);
  const extra = items.length % pages;
  const out = [];
  let start = 0;
  for (let p = 0; p < pages; p++) {
    const size = base + (p < extra ? 1 : 0);
    out.push(items.slice(start, start + size));
    start += size;
  }
  return out;
};

/** @returns {{ exercises: object[], errors: string[] }} */
const buildExercises = () => {
  const errors = [];
  const verbByBase = new Map(VERBS.map((v) => [v.base, v]));

  // Every verb in exactly one group, and no group referencing a missing verb.
  const seen = new Map();
  for (const group of GROUPS) {
    for (const base of group.verbs) {
      if (!verbByBase.has(base))
        errors.push(`${group.label}: unknown verb "${base}"`);
      if (seen.has(base))
        errors.push(
          `"${base}" is in both ${seen.get(base)} and ${group.label}`,
        );
      seen.set(base, group.label);
    }
  }
  for (const v of VERBS) {
    if (!seen.has(v.base)) errors.push(`"${v.base}" is not in any group`);
    for (const key of ['past', 'participle']) {
      // One answer per form keeps Column B on one line.
      if (key === 'past' && v.base === 'be') continue;
      if (/[/,]/.test(v[key])) {
        errors.push(`${v.base}: ${key} "${v[key]}" has more than one answer`);
      }
    }
  }

  const exercises = GROUPS.map((group) => {
    const verbs = group.verbs.map((b) => verbByBase.get(b)).filter(Boolean);
    if (verbs.length < MIN_PAIRS || verbs.length > MAX_VERBS_PER_EXERCISE) {
      errors.push(
        `${group.label}: ${verbs.length} verbs (want ${MIN_PAIRS}–${MAX_VERBS_PER_EXERCISE})`,
      );
    }

    const questions = [];
    for (const form of FORMS) {
      for (const page of chunkEvenly(verbs)) {
        const right = page.map((v) => v[form.key]);
        if (page.length < MIN_PAIRS || page.length > MAX_PAIRS) {
          errors.push(
            `${group.label} ${form.key}: page of ${page.length} pairs`,
          );
        }
        // Two identical Column B entries would make the answer ambiguous.
        const dupes = right.filter((r, i) => right.indexOf(r) !== i);
        if (dupes.length) {
          errors.push(
            `${group.label} ${form.key}: duplicate Column B "${dupes.join('", "')}"`,
          );
        }
        questions.push({
          id: `q${questions.length + 1}`,
          question: form.heading,
          leftColumn: page.map((v) => v.base),
          // Stored in matching order; the player shuffles Column B at runtime
          // (utils/shuffleMatching.ts) and remaps this key.
          options: right,
          correctAnswer: page.map((_, i) => letterFor(i)),
          explanation: page.map((v) => `${v.base} → ${v[form.key]}`).join(', '),
        });
      }
    }

    const first = verbs[0]?.base;
    const last = verbs[verbs.length - 1]?.base;
    return {
      title: `${TITLE_PREFIX}${group.label}`,
      description: `Simple past and past participle of common irregular verbs (${first} – ${last}).`,
      instructions: INSTRUCTIONS,
      content: { type: 'matching', questions },
    };
  });

  return { exercises, errors };
};

module.exports = { buildExercises };

if (require.main === module) {
  const { exercises, errors } = buildExercises();
  const added = new Set(VERBS.filter((v) => v.added).map((v) => v.base));
  for (const ex of exercises) {
    const pages = ex.content.questions;
    console.log(`\n${ex.title}  (${pages.length} pages)`);
    console.log(`  ${ex.description}`);
    for (const q of pages) {
      const form = q.question.startsWith('Simple past') ? 'past' : 'p.p.';
      const pairs = q.leftColumn
        .map((b, i) => `${b}${added.has(b) ? '*' : ''} → ${q.options[i]}`)
        .join(', ');
      console.log(`  ${q.id} [${form}] ${pairs}`);
    }
  }

  const totalPages = exercises.reduce(
    (n, e) => n + e.content.questions.length,
    0,
  );
  console.log(
    `\n${exercises.length} exercises, ${VERBS.length} verbs, ${totalPages} pages. * = not in the PDF list.`,
  );

  if (errors.length) {
    console.error(`\n${errors.length} problem(s):`);
    for (const e of errors) console.error(`  - ${e}`);
    process.exitCode = 1;
  }

  const jsonFlag = process.argv.indexOf('--json');
  if (jsonFlag !== -1) {
    const out = process.argv[jsonFlag + 1];
    if (!out) {
      console.error('--json needs a file path');
      process.exit(1);
    }
    fs.writeFileSync(path.resolve(out), JSON.stringify(exercises, null, 2));
    console.log(`\nWrote ${path.resolve(out)}`);
  }
}
