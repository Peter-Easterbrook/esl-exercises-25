# Google OAuth Troubleshooting Session - 2025-12-21

## Problem
Google OAuth login was working previously but broke after a new EAS build. Users getting "Error 400: invalid_request" and "Access blocked" errors.

## Root Causes Identified

1. **Firebase API Key Mismatch**
   - Old API key was accidentally uploaded to GitHub
   - New API key was generated but not consistently applied
   - Fixed: Updated `.env` to use correct Firebase API key: `AIzaSyAdo0r0_KoENCwAwzHoCgvihC-KnWoNzU0`

2. **OAuth Configuration Issues**
   - Decided to start fresh with completely new OAuth clients
   - Old clients potentially had corrupted/misconfigured settings

3. **Code Changes (Reverted)**
   - Initially tried adding explicit `redirectUri` to `AuthContext.tsx`
   - This caused "secure-response-handling" errors
   - Successfully reverted to original code

## Changes Made Today

### 1. Updated `.env` File
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAdo0r0_KoENCwAwzHoCgvihC-KnWoNzU0
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=[new-web-client-id]
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=[new-android-client-id]
```

### 2. Google Cloud Console Changes
- ✅ Deleted old OAuth 2.0 Client IDs (both Web and Android)
- ✅ Added yourself as test user in OAuth consent screen
- ✅ Created new Web OAuth Client with redirect URIs:
  - `https://auth.expo.io/@petereasterbro1/esl-exercises-25`
  - `http://localhost:8081`
  - `http://localhost:19006`
- ✅ Created new Android OAuth Client with:
  - Package name: `com.petereasterbro1.eslexercises25`
  - SHA-1 fingerprint from production keystore

### 3. Code Changes (AuthContext.tsx)
- Reverted all explicit redirect URI code
- Back to original working configuration
- Import of `makeRedirectUri` removed

### 4. EAS Environment Variables
- ✅ Updated: `EXPO_PUBLIC_FIREBASE_API_KEY`
- ⏳ Need to update: `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`
- ⏳ Need to update: `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

### 5. Documentation Updated
Added to `EAS Cheatsheet.md`:
- Section on EAS Update vs New Build
- Section on Google OAuth Configuration for Android

## Still To Do Tomorrow

1. **Update EAS Environment Variables:**
   ```bash
   eas env:push --variable=EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID --value=[new-web-client-id] --scope=project
   eas env:push --variable=EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID --value=[new-android-client-id] --scope=project
   ```

2. **Test in Dev Mode:**
   ```bash
   npx expo start -c
   ```
   Try Google sign-in to verify it works locally

3. **If Dev Works, Build for Production:**
   ```bash
   npx eas build -p android --profile production
   ```
   Note: New build required because environment variables changed

4. **Submit to Google Play:**
   ```bash
   eas submit -p android
   ```

## Key Learnings

- **Environment variables require new builds** - Changes to `EXPO_PUBLIC_*` variables need a rebuild, not just an OTA update
- **SHA-1 fingerprints differ by build profile** - Production, preview, and development each have different SHA-1s
- **OAuth consent screen test users are critical** - Must add yourself when app is in testing mode
- **Sometimes starting fresh is best** - Rather than debugging complex OAuth issues, recreating from scratch can be faster
- **Propagation delay** - Google Cloud Console changes can take time to propagate (5-30 minutes)

## Files Modified
- `contexts/AuthContext.tsx` (reverted changes)
- `.env` (updated Firebase API key and OAuth client IDs)
- `EAS Cheatsheet.md` (added OAuth and Update documentation)
- `OAUTH_TROUBLESHOOTING.md` (this file - created for session notes)

---

## Next Session Checklist

- [ ] Wait for Google Cloud Console changes to propagate (overnight)
- [ ] Update EAS environment variables with new client IDs
- [ ] Test Google sign-in in dev mode
- [ ] If successful, build production version
- [ ] Test on device/closed testing
- [ ] If working, update version and submit to Google Play

---

**Status: Changes made, waiting for propagation. Ready to test tomorrow!**
