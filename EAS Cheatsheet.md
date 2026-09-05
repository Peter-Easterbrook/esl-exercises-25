# Expo & EAS CLI Cheat Sheet

> **Targets:** Android (Google Play) and Web only. No iOS builds.

## Expo CLI Basics

| Command                                  | Description                                           |
| ---------------------------------------- | ----------------------------------------------------- |
| `npx expo start`                         | Start the Expo development server                     |
| `npx expo start -c`                      | Clear Metro Bundler cache and start the server        |
| `npx expo start --web`                   | Start the app in a web browser (dev mode, hot reload) |
| `npx expo start --android`               | Open the app on a connected Android device/emulator   |
| `npx expo start --web --no-dev --minify` | Start web app in production-like mode                 |
| `npx expo start --dev-client`            | Start server for custom development client builds     |
| `npx expo-doctor`                        | Check project health before building                  |
| `npx expo install --fix`                 | Fix incorrect dependencies for your Expo SDK version  |
| `npx expo install --check`               | Review and list outdated/incompatible dependencies    |
| `npx expo install`                       | Auto-checks compatible dependencies                   |

## EAS Build Commands

| Command                                              | Description                                  |
| ---------------------------------------------------- | -------------------------------------------- |
| `eas login`                                          | Log in to your Expo/EAS account              |
| `eas build:configure`                                | Configure EAS build without starting a build |
| `eas build --profile development --platform android` | Build a development client APK for Android   |
| `eas build -p android --profile preview`             | Build a preview APK for Android testing      |
| `eas build -p android --profile production`          | Build production AAB for Google Play Store   |
| `eas build:list`                                     | List all EAS builds                          |
| `eas submit -p android`                              | Submit Android AAB to Google Play Store      |

## EAS Update Commands

> OTA updates are delivered to **standalone builds** (Play Store / sideloaded APK) only. They do not update Expo Go.

| Command                                                     | Description                                  |
| ----------------------------------------------------------- | -------------------------------------------- |
| `eas update -p android --branch production --message "..."` | Push OTA update to production                |
| `eas update -p android --branch preview --message "..."`    | Push OTA update to preview channel           |
| `eas update:list --branch production`                       | List recent updates on the production branch |

## EAS Update vs New Build: When Do You Need to Rebuild?

### Use EAS Update (No Rebuild Needed):

Push over-the-air (OTA) updates for:

- JavaScript/TypeScript code changes
- UI/component updates and bug fixes
- New screens/features in pure JS/TS
- Firebase queries and business logic changes
- Content updates

```bash
eas update -p android --branch production --message "Fixed validation logic"
```

Users receive the update on the next app relaunch after it downloads in the background.

### New Build Required:

You **must rebuild** when changing:

- Native dependencies (adding/removing packages with native code)
- `app.json` configuration (permissions, plugins, scheme, icons)
- Assets bundled at build time (app icon, splash screen)
- Expo SDK version upgrades
- OAuth/authentication configuration in native modules

```bash
eas build -p android --profile production
eas submit -p android
```

### Recommended Workflow:

1. Make changes in your code
2. Ask: "Did I change native code or `app.json`?"
   - **No** → Use `eas update --branch production`
   - **Yes** → Use `eas build` then `eas submit`
3. Most feature updates only need `eas update`.

## Google OAuth Configuration for Android

### Get Your Production SHA-1 Certificate:

After building with EAS, configure Google Cloud Console with your production signing certificate:

```bash
eas credentials -p android
```

Look for the `SHA1 Fingerprint` in the Android Keystore section.

### Configure Google Cloud Console:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to: **APIs & Services** → **Credentials**
3. Find your **Android OAuth 2.0 Client ID**
4. Edit and set:
   - **Package name**: `com.petereasterbro1.eslexercises25`
   - **SHA-1 certificate fingerprint**: paste your SHA-1
5. Save changes

**Notes:**

- No redirect URI field for Android clients — Google constructs it automatically from your package name
- The redirect URI is: `com.petereasterbro1.eslexercises25:/oauth2redirect`
- Each build profile (development/preview/production) may have different SHA-1 fingerprints

## Environment & Configuration

| Command                                       | Description                          |
| --------------------------------------------- | ------------------------------------ |
| `eas env:create --name "VAR" --value "VALUE"` | Push an environment variable to EAS  |
| `eas env:list`                                | List all environment variables       |
| `eas secret:create`                           | Create a new secret for your project |
| `eas secret:list`                             | List all secrets for your project    |

## Running Your App on a Device

### Expo Go (development only — no custom native code):

1. Start dev server: `npx expo start`
2. Scan QR code with Expo Go app
3. Watch for real-time updates as you code

> **Note:** Expo Go is for **development only**. It cannot receive `eas update` OTA updates — those go to your standalone builds (Google Play / sideloaded APK) only. The "Updates are not compatible with this version of Expo Go" message in Expo Go is expected and harmless — your production app is being updated correctly.

> **Note:** IAP (react-native-iap) is silently disabled in Expo Go — the app works normally without it.

### Development Build (custom native code / IAP testing):

1. Build dev client: `eas build --profile development --platform android`
2. Install APK on device
3. Start dev server: `npx expo start --dev-client`
4. Open app on device

### Direct install (Android only):

1. Connect device via USB cable (or enable ADB over WiFi separately)
2. Run: `npx expo run:android`

## Troubleshooting

- **Metro bundler stuck?** Run `npx expo start -c` to clear cache
- **Dependency issues?** Try `npx expo install --fix`
- **Build failing?** Check EAS build logs with `eas build:list`
- **App crashing on web?** Test with `npx expo start --web --no-dev --minify` to simulate production web (Android: check logcat via `adb logcat`)

## Production Build Workflow (Google Play Store AAB)

```bash
# 1. Check project health
npx expo-doctor

# 2. Verify dependencies are in sync
npx expo install --check

# 3. Build production AAB
eas build -p android --profile production

# 4. Check build status
eas build:list

# 5. Submit to Google Play Store
eas submit -p android
```

## Current eas.json Configuration

```json
{
  "cli": {
    "version": ">= 18.0.6",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "channel": "preview",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "android": { "buildType": "app-bundle" }
    }
  },
  "submit": {
    "production": {}
  }
}
```

**Build types:**

- **APK** (`buildType: "apk"`): Development and preview — for testing and sideloading
- **AAB** (`buildType: "app-bundle"`): Production — required for Google Play Store

## Update / Build Workflow

> EAS Build runs `npm ci`, which requires `package.json` and `package-lock.json` to be in exact sync. This workflow ensures they always are, and catches issues locally before the build fails remotely.

### Step 1 — Bump the version _(new Play Store builds only)_

Skip for OTA updates. Bump when submitting a new build to the Play Store:

```powershell
npm run bump-version          # patch: 1.2.3 → 1.2.4  (bug fixes, minor improvements)
npm run bump-version minor    # minor: 1.2.3 → 1.3.0  (new features)
npm run bump-version major    # major: 1.2.3 → 2.0.0  (breaking changes, major redesigns)
```

The bump script keeps `app.json` (`expo.version`) and `package.json` (`version`) in sync automatically. `versionCode` is managed by EAS — never set it manually.

### Step 2 — Install or update dependencies

```powershell
npx expo install <package>   # Expo-specific packages (ensures SDK compatibility)
npm install <package>        # Everything else — never edit package.json manually
```

### Step 3 — Reinstall from the lockfile

Run after any dependency change:

```powershell
# Bash: rm -rf node_modules
Remove-Item -Recurse -Force node_modules
npm ci
```

> **Do not delete `package-lock.json`.** `npm ci` installs strictly from the
> lockfile and **fails loudly** if it has drifted out of sync with
> `package.json` — which is exactly the check this step exists for.
> Deleting the lockfile instead re-resolves every `^` range to its newest
> match, so you ship a dependency tree you never tested. Only regenerate it
> (`npm install`) if `npm ci` reports a genuine sync error.

### Step 4 — Validate locally

```powershell
npx expo-doctor
npx tsc --noEmit
npm run lint
```

A clean run is **21/21**. `react-native-nitro-google-signin` is excluded from
the "React Native Directory" check in `package.json`
(`expo.doctor.reactNativeDirectoryCheck.exclude`) — the catalogue lists it as
"untested on New Architecture", which is a stale entry rather than a defect,
since Nitro modules are New-Arch-only. If that check starts failing again,
read what it names before adding to the exclude list.

Add a fourth command before a **new build** (not needed for OTA). It bundles the
whole app exactly as the build will, so an unresolved import fails here in two
minutes instead of ten minutes into an EAS build:

```powershell
npx expo export --platform android
```

### Step 5 — Commit

```powershell
git add .
git commit -m "fix: short description of what actually changed"
git push
```

Write a real message. A build traced back six months later is only as good as
the commit that produced it.

### Step 6 — Deploy

`runtimeVersion` uses the **`fingerprint`** policy, which hashes everything
affecting the native layer. This decides OTA compatibility for you: if a change
touched native code, the fingerprint changes and old builds simply stop matching
the update. It fails safe instead of crashing users.

> This replaced the `sdkVersion` policy, which only changed on SDK upgrades.
> Under that policy 2.0.4 and 2.0.5 shared `exposdk:57.0.0` despite 2.0.5 adding
> a native module — an OTA would have been delivered to 2.0.4 users whose binary
> lacked it, white-screening them at startup.

**JS/TS only** (UI, Firebase logic, content not npm updates) → OTA:

```powershell
eas update -p android --branch production --message "describe the change"
eas update:list --branch production
```

Only reaches builds whose fingerprint matches. Installs on an older fingerprint
keep running their bundled JS until users update from the Play Store.

**Native dep updates, `app.json`, SDK upgrade, icons/splash** → new build:

```powershell
eas build -p android --profile production --auto-submit-with-profile internal
```

**Never `--auto-submit` straight to production.** That submits to the production
track, making the worldwide rollout the first real test of the build. Some bugs
only appear in a Play-signed binary — Google re-signs every distributed install
with the App Signing key, so anything depending on that certificate (Google
Sign-In, for one) cannot be exercised by a local or `preview` build. The internal
track produces the _same_ AAB with the _same_ signing, testable in minutes.

If a build fails with a dependency sync error, add `--clear-cache`.

### Step 7 — Verify, then promote

1. Play Console → **Release → Testing → Internal testing**
2. Confirm the new bundle is listed under **App bundles**, _not_ **Deactivated
   app bundles**. If it is deactivated, the track silently serves the previous
   version and you will test the wrong binary.
3. Install and confirm **Settings → Apps** reports the version you just built
4. Smoke-test the areas the release touched — at minimum Google sign-in and an
   in-app purchase, since both depend on signing and native modules
5. **Release → Testing → Internal testing → Promote release → Production**

Promotion ships the identical artifact. No rebuild, no second review.

---

## Release Checklist

The steps above explain _why_; this is the tickable version. Copy it into the
release commit or an issue and work down it.

### Before building

- [ ] `npm run bump-version` — only for a new Play Store build, not an OTA
- [ ] `npm ci` runs clean (proves `package.json` and the lockfile agree; EAS runs it too)
- [ ] `npx expo-doctor` → 21/21
- [ ] `npx tsc --noEmit` → silent
- [ ] `npm run lint` → silent
- [ ] `npx expo export --platform android` → bundles without error
- [ ] `eas env:list production` matches the keys the app actually reads
- [ ] Everything committed with a message that will still mean something later

### Choosing OTA or build

- [ ] Touched **only** JS/TS? → `eas update`, and skip the rest of this list
- [ ] Touched `app.json`, a native dependency, icons, or the SDK? → new build

> Don't guess. The `fingerprint` runtime version decides for you: if the native
> layer changed, old builds stop matching the update.

### Building

- [ ] `eas build -p android --profile production --auto-submit-with-profile internal`
- [ ] Never `--auto-submit` straight to production

### On the internal build, before promoting

Test on a real device, installed from the internal track — not a local or
`preview` build. Google re-signs distributed installs with the App Signing key,
so anything depending on that certificate behaves differently anywhere else.

- [ ] Play Console lists the bundle under **App bundles**, not **Deactivated app bundles**
- [ ] **Settings → Apps** reports the version you just built
- [ ] **Google Sign-In** completes end to end
- [ ] **In-app purchase** completes (license tester account)
- [ ] Downloads unlock after purchase; admin account bypasses the paywall
- [ ] Category icons render — a **?** means a stored icon name no longer maps
- [ ] Charts and confetti animate
- [ ] Whatever this release actually changed

### After promoting

- [ ] Play Console → **App optimization**: obfuscation above 25%
- [ ] Crash-free rate holds over the first day

---

### One-time, for the next release only

The next production build is the **first with R8 minification enabled**
(`enableMinifyInReleaseBuilds` in `app.json`). R8 rewrites bytecode and can
break reflection-heavy native code in ways no local check catches.

No custom keep rules were added, deliberately: the native modules here ship
their own consumer ProGuard rules, Firebase is the JS SDK (so there are no
native Firebase classes to strip), and blanket `-keep` rules would suppress the
very obfuscation percentage Play is measuring.

So on that build, treat the four native-backed surfaces as the real test:
**Google Sign-In, the IAP paywall, Skia confetti, and charts**. If one breaks,
add a targeted keep for that library via `extraProguardRules` — do not disable
minification, or the Play warning returns.

Delete this section once a minified build has shipped cleanly.
