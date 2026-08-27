# iOS Release Checklist

Companion to `EAS Cheatsheet.md`. Android is live on Play; this file covers everything
the App Store additionally needs. Order matters — several steps block the ones below.

## 0. What this repo already has

- `app.json` has an `ios` block: bundle identifier `com.petereasterbro1.eslexercises25`,
  `supportsTablet: false` (iPhone-only, so no iPad screenshots are required),
  camera/photo usage strings, and `ITSAppUsesNonExemptEncryption: false`.
- `eas.json` has `build.development.ios.simulator`, `build.production.ios.distribution`,
  and `submit.*.ios` blocks with placeholder Apple IDs to fill in.
- Restore Purchases already exists in the paywall (`components/PremiumPurchaseModal.tsx`)
  — Apple requires it for non-consumable products.
- In-app account deletion already exists (`app/account-settings.tsx`) — Apple requires it
  for any app that creates accounts (guideline 5.1.1(v)).

## 1. Apple Developer Program — blocks everything

- Enrol at developer.apple.com, $99/year. **Individual** enrolment needs identity
  verification; allow 24–48h, occasionally longer. An **Organization** enrolment needs a
  D-U-N-S number and takes weeks — do not choose it unless the app must be published
  under a company name.
- Note the **Team ID** (App Store Connect → Membership). Goes into `eas.json`.

## 2. Paid Applications Agreement — blocks the paywall

In App Store Connect → Business: sign the Paid Apps agreement and complete **banking and
tax forms**. In-app purchase products cannot be created, tested in sandbox, or submitted
until this is "Active". This is routinely the longest single wait after enrolment.

## 3. App Store Connect app record

- Create the app with bundle ID `com.petereasterbro1.eslexercises25` (register the
  identifier in the Developer portal first, or let `eas submit` create it).
- Copy the numeric **App ID (ascAppId)** from the app's URL / App Information page.
- Fill the three placeholders in `eas.json` (`submit.production.ios` and
  `submit.internal.ios`): `appleId`, `ascAppId`, `appleTeamId`.

## 4. Firebase + Google Sign-In for iOS — blocks login

Google Sign-In will fail on iOS without all of this:

1. Firebase console → add an **iOS app** with the bundle identifier above.
2. Download **`GoogleService-Info.plist`** into the repo root. `app.json` already points
   at `./GoogleService-Info.plist`; the build fails without it.
   Commit it, for the same reasons `google-services.json` is committed — it holds only
   public identifiers, and the config plugin needs it at build time on a fresh clone/CI.
3. Google Cloud Console → create an **iOS OAuth client** for that bundle ID. The native
   module reads `CLIENT_ID` from the plist at `configure()` time; a missing or wrong
   value throws before any sign-in sheet appears.
4. The config plugin adds the `REVERSED_CLIENT_ID` URL scheme automatically from the plist.
5. `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` stays the **Web** client ID on iOS too — it is
   passed as `serverClientID` so Firebase accepts the returned ID token.

## 5. In-app purchase product

- App Store Connect → In-App Purchases → **Non-Consumable**, product ID
  `premium_file_access` (same as Play; `services/premiumService.ts` already sends it).
- Price tier ≈ €2.99. Add a localized display name, description, and a review screenshot —
  the screenshot is mandatory and IAP submissions are rejected without it.
- Create a **Sandbox tester** account (Users and Access → Sandbox) to test the purchase.
- The paywall reads the price from the store at runtime; `DEFAULT_PRICE` is only the
  pre-load fallback.

## 6. Sign in with Apple — decide before submitting

Guideline 4.8 requires an equivalent privacy-preserving login option in apps that offer
*third-party* login. This app also offers first-party email/password, which is the usual
basis for exemption, but reviewers do flag Google-login apps. Two options:

- **Ship without it** and argue the exemption if rejected. Costs a review round if wrong.
- **Add it up front**: `expo-apple-authentication` + Firebase `OAuthProvider('apple.com')`,
  plus enabling Apple as a sign-in provider in Firebase Auth. Roughly a day of work,
  including the "hide my email" relay-address case.

## 7. Store listing assets

- Screenshots for 6.9" and 6.5" iPhone displays. With no Mac, capture them from a real
  iPhone running a TestFlight build, or from an EAS cloud simulator build
  (`eas build -p ios --profile development` produces a simulator build).
- Privacy policy URL (the app already has an in-app policy screen — it also needs to be
  reachable on the public web).
- Complete the **App Privacy** questionnaire: account data, user content, purchases,
  identifiers. Declare Firebase and Google Sign-In data collection honestly.
- Provide **demo account credentials** in App Review notes. Reviewers cannot use Google
  Sign-In, so supply an email/password account — and an admin one if any admin screen is
  reachable.

## 8. Build and ship

```bash
# iOS simulator build for smoke-testing without a device
eas build --platform ios --profile development

# production build + TestFlight
eas build --platform ios --profile production --auto-submit-with-profile internal
```

EAS generates and stores the distribution certificate and provisioning profile; no Mac
and no Xcode are needed. `eas submit` uploads to App Store Connect over the API.

As on Android, ship to **TestFlight first**, verify Google Sign-In and the purchase flow
on the real artifact, then submit that build for App Store review from App Store Connect.

## 9. Known gaps to watch

- **Premium is granted client-side.** `verifyAndSavePurchase` writes `hasPremiumAccess`
  straight to Firestore with no server-side receipt validation. Apple does not require
  server validation, but the flag is only as trustworthy as the Firestore rules.
- `runtimeVersion` is `fingerprint`, so iOS gets its own fingerprint and OTA updates
  cannot cross between platforms. No change needed — just do not switch policies.
- The web bundle must never import `react-native-nitro-google-signin` or
  `react-native-iap` directly; adding iOS does not change that.
