# Premium enforcement functions

Two callable functions that move premium from "the client says so" to "the
server checked":

| Function | What it does |
| --- | --- |
| `verifyPurchase` | Validates a Google Play purchase token against the Play Developer API, grants premium, and acknowledges the purchase. Also handles Restore Purchase. |
| `getFileDownloadUrl` | Checks premium (or admin), then returns a 15-minute signed URL for the file. |

**Nothing calls these yet.** Deploying them changes nothing on its own — that
is deliberate, so each step below can be verified before the next one makes it
load-bearing.

## Why this exists

Premium had two independent holes:

1. `hasPremiumAccess` was written by the client straight to the user's own
   document. Any signed-in user could set it.
2. `downloadableFiles.fileUrl` is a tokenized URL from `getDownloadURL()`.
   Those carry their own access token, **bypass Storage rules entirely**, and
   never expire. Anyone who could read the metadata document had the file,
   premium or not — so no Firestore rule could have closed this one.

The first needs the write moved server-side. The second needs the tokenized URL
to stop being handed out at all.

## Before deploying

1. **Blaze plan.** Cloud Functions require a billing account. For this
   workload — one call per purchase, one per download — expect pennies, but the
   plan change is mandatory and is yours to make.
2. **Play Developer API access.** The function authenticates as the runtime
   service account. In Play Console → Users and permissions, invite
   `<project-id>@appspot.gserviceaccount.com` and grant "View financial data,
   orders, and cancellation survey responses". Without it the API returns 401
   and every verification fails.
3. **Signing permission.** `getSignedUrl` signs via the IAM API, so the runtime
   service account needs **Service Account Token Creator** on itself
   (IAM → the appspot service account → Grant access → itself →
   `roles/iam.serviceAccountTokenCreator`). Without it you get
   "Permission 'iam.serviceAccounts.signBlob' denied" at call time.

```bash
cd functions && npm install
cd .. && npx firebase-tools deploy --only functions
```

## Rollout order — this order matters

Doing these out of order breaks purchases for real users.

1. **Deploy the functions.** Nothing calls them; nothing changes.
2. **Switch the client's purchase path.** `services/premiumService.ts` should
   call `verifyPurchase` instead of writing `hasPremiumAccess` itself, and stop
   calling `finishTransaction` for the grant (the function acknowledges with
   Google after verifying). Ship it, and confirm a real purchase and a restore
   both still work.
3. **Only then lock the field.** Add `hasPremiumAccess` to
   `protectedUserFields()` in `firestore.rules` and redeploy:

   ```
   function protectedUserFields() {
     return ['isAdmin', 'hasPremiumAccess'];
   }
   ```

   Doing this before step 2 makes every legitimate purchase fail to record.
4. **Switch the download path.** `services/fileService.ts` should call
   `getFileDownloadUrl(fileId)` and download the returned URL, rather than
   reading `file.fileUrl`. Have `uploadFile` also write a `storagePath` field;
   existing documents keep working because the function falls back to parsing
   the path out of the old URL.
5. **Revoke the old tokens.** Until you do, every previously issued
   `fileUrl` still works forever, for anyone who saved one. In the Firebase
   console each Storage object has a download token that can be revoked, which
   invalidates the old URL and mints a new one.
6. **Then tighten the metadata read** if you want belt and braces — once
   nothing reads `fileUrl` from the client, `downloadableFiles` reads can drop
   to admin-only, with the function (which uses the Admin SDK and ignores
   rules) serving everyone else.

## iOS

`verifyPurchase` throws `unimplemented` for iOS on purpose. iOS 1.0 ships with
the paywall hidden by `utils/downloadsAvailability.ts`, so nothing calls it.
Implementing it needs an App Store Connect API key (`.p8`) and a call to the
App Store Server API to verify the signed JWS transaction — do that in the same
change that raises the version gate to 2.1.0.
