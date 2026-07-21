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

### Step 3 — Clean reinstall to sync package-lock.json

Always run this after any dependency change:

```powershell
Remove-Item -Recurse -Force node_modules, package-lock.json
npm cache clean --force
npm install
```

### Step 4 — Validate locally

Catches `npm ci` sync issues before EAS sees them:

```powershell
npm ci
npx expo-doctor
```

### Step 5 — Commit

```powershell
git add .
git commit -m "chore: effect hook restructure updates $(Get-Date -Format 'yyyy-MM-dd')"
git push
```

### Step 6 — Deploy

**Did you change native code or `app.json`?**

**No → OTA update** (JS/TS changes, UI updates, Firebase logic, content):

```powershell
eas update -p android --branch production --message "effect hook restructure"
eas update:list --branch production
```

**Yes → New build** (native dependencies, `app.json`, Expo SDK upgrade, icons/splash):

```powershell
eas build -p android --profile production --auto-submit
eas build -p android --profile production
eas submit -p android
```

> If a build fails with a dependency sync error, add `--clear-cache` to the `eas build` command.
