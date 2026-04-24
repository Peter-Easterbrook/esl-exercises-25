# Expo & EAS CLI Cheat Sheet

> **Targets:** Android (Google Play) and Web only. No iOS builds.

## Expo CLI Basics

| Command | Description |
| ------- | ----------- |
| `npx expo start` | Start the Expo development server |
| `npx expo start -c` | Clear Metro Bundler cache and start the server |
| `npx expo start --web` | Start the app in a web browser (dev mode, hot reload) |
| `npx expo start --android` | Open the app on a connected Android device/emulator |
| `npx expo start --web --no-dev --minify` | Start web app in production-like mode |
| `npx expo start --dev-client` | Start server for custom development client builds |
| `npx expo-doctor` | Check project health before building |
| `npx expo install --fix` | Fix incorrect dependencies for your Expo SDK version |
| `npx expo install --check` | Review and list outdated/incompatible dependencies |

## EAS Build Commands

| Command | Description |
| ------- | ----------- |
| `eas login` | Log in to your Expo/EAS account |
| `eas build:configure` | Configure EAS build without starting a build |
| `npx eas build --profile development --platform android` | Build a development client APK for Android |
| `npx eas build -p android --profile preview` | Build a preview APK for Android testing |
| `npx eas build -p android --profile production` | Build production AAB for Google Play Store |
| `eas build:list` | List all EAS builds |
| `eas submit -p android` | Submit Android AAB to Google Play Store |

## EAS Update Commands

| Command | Description |
| ------- | ----------- |
| `eas update --branch production --message "..."` | Push OTA update to production |
| `eas update --branch preview --message "..."` | Push OTA update to preview channel |
| `eas update:list --branch production` | List recent updates on the production branch |

## EAS Update vs New Build: When Do You Need to Rebuild?

### Use EAS Update (No Rebuild Needed):

Push over-the-air (OTA) updates for:
- JavaScript/TypeScript code changes
- UI/component updates and bug fixes
- New screens/features in pure JS/TS
- Firebase queries and business logic changes
- Content updates

```bash
eas update --branch production --message "Fixed validation logic"
```

Users get updates automatically when they reopen the app.

### New Build Required:

You **must rebuild** when changing:
- Native dependencies (adding/removing packages with native code)
- `app.json` configuration (permissions, plugins, scheme, icons)
- Assets bundled at build time (app icon, splash screen)
- Expo SDK version upgrades
- OAuth/authentication configuration in native modules

```bash
npx eas build -p android --profile production
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

| Command | Description |
| ------- | ----------- |
| `eas env:create --name "VAR" --value "VALUE"` | Push an environment variable to EAS |
| `eas env:list` | List all environment variables |
| `eas secret:create` | Create a new secret for your project |
| `eas secret:list` | List all secrets for your project |

## Running Your App on a Device

### Expo Go (no custom native code):
1. Start dev server: `npx expo start`
2. Scan QR code with Expo Go app
3. Watch for real-time updates as you code

> **Note:** IAP (react-native-iap) is silently disabled in Expo Go — the app works normally without it.

### Development Build (custom native code / IAP testing):
1. Build dev client: `npx eas build --profile development --platform android`
2. Install APK on device
3. Start dev server: `npx expo start --dev-client`
4. Open app on device

### Direct install (Android only):
1. Connect device via USB or same WiFi
2. Run: `npx expo run:android`

## Troubleshooting

- **Metro bundler stuck?** Run `npx expo start -c` to clear cache
- **Dependency issues?** Try `npx expo install --fix`
- **Build failing?** Check EAS build logs with `eas build:list`
- **App crashing?** Test with `--no-dev --minify` flags to simulate production

## Production Build Workflow (Google Play Store AAB)

```bash
# 1. Check project health
npx expo-doctor

# 2. Verify dependencies are in sync
npx expo install --check

# 3. Build production AAB
npx eas build -p android --profile production

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

## Fixing npm ci Errors in EAS Build

EAS Build uses `npm ci` which requires exact sync between `package.json` and `package-lock.json`. If they're out of sync, builds fail.

### Quick Fix:

```bash
# 1. Delete lock file and node_modules
rm -rf node_modules package-lock.json

# 2. Clear npm cache
npm cache clean --force

# 3. Reinstall dependencies (generates fresh package-lock.json)
npm install

# 4. Verify no issues
npx expo-doctor

# 5. Commit the synchronized files
git add package.json package-lock.json
git commit -m "Sync package-lock.json with package.json"
git push

# 6. Clear EAS cache and rebuild
eas build --clear-cache -p android --profile production
```

**Best practices:**
- Always commit `package-lock.json` to version control
- Use `npm install` (not manual edits) to update dependencies
- Use `npx expo install <package>` for Expo-specific packages
- Run `npm ci` locally before pushing to catch sync issues early

## Full Update / Rebuild Workflow

```bash
# Bump version (managed automatically via appVersionSource: remote)
# Manual bump if needed: edit version in app.json

# Clean and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npx expo-doctor

# Commit
git add .
git commit -m "Update npm packages"
git push

# If native packages changed (react-native-iap, Expo SDK, anything with android/ folder):
npx eas build -p android --profile production

# If only pure JS/TS packages changed (Firebase, UI libraries, utilities):
eas update --branch production --message "Updated dependencies"
eas update:list --branch production
```
