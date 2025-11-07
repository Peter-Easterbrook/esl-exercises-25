# Production Build Security Checklist

**CRITICAL**: Complete this checklist before deploying to production or submitting to Google Play Store.

---

## 🚨 Critical Security Issues (MUST FIX)

### 1. Credential & Sensitive Data Removal
- [ ] **admin.txt removed or secured**
  - File contains plaintext credentials
  - Already in .gitignore (do NOT commit)
  - Delete before production or move outside project directory
  - Create production admin users directly in Firebase Console

- [ ] **No hardcoded credentials in code**
  ```bash
  # Search for potential credentials
  grep -r "password" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
  grep -r "api.key" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
  grep -r "secret" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules
  ```

- [ ] **Environment variables secured**
  - No .env files in git (already in .gitignore)
  - Use Expo Secrets or EAS environment variables for production

### 2. Firebase Configuration

- [ ] **Separate Firebase project for production**
  - Development: esl-exercises (or dev project)
  - Production: esl-exercises-prod (recommended)
  - Update config/firebase.ts with production credentials

- [ ] **Firebase Security Rules deployed**
  - Firestore rules configured and published
  - Storage rules configured and published
  - Test rules with Firebase Console Rules Playground

- [ ] **Firebase Authentication configured**
  - Email/password enabled
  - Email verification optional (configure in app settings)
  - Password policy: minimum 6 characters

### 3. Google Play Requirements

- [ ] **Privacy Policy hosted publicly**
  - Current: Only in-app (app/privacy-policy.tsx)
  - Required: Public URL (website, GitHub Pages, etc.)
  - Action: Host at https://easterbrook.at/privacy or similar

- [ ] **Test account credentials prepared**
  - Regular user account with sample data
  - Admin account with full permissions
  - Document credentials separately (NOT in git)

---

## 🔒 Security Hardening

### Code Review
- [ ] **Remove debug code**
  ```bash
  # Search for console.logs
  grep -r "console.log" --include="*.ts" --include="*.tsx" app/
  grep -r "console.warn" --include="*.ts" --include="*.tsx" app/
  grep -r "console.error" --include="*.ts" --include="*.tsx" app/
  ```

- [ ] **Remove development-only features**
  - No mock data in production
  - No test/debug routes exposed
  - No admin credentials displayed in UI

- [ ] **Verify no PII in logs/analytics**
  - No email addresses logged
  - No passwords logged (should never happen)
  - No user IDs in client-side logs

### Firebase Security
- [ ] **Firestore Rules tested**
  - Regular users CANNOT access other users' data
  - Regular users CANNOT modify exercises/categories
  - Regular users CANNOT access appSettings
  - Admins CAN access admin features
  - Unauthenticated users CANNOT access any data

- [ ] **Storage Rules tested**
  - Authenticated users CAN download files
  - Only admins CAN upload files
  - File size limited to 10MB
  - File types restricted (PDF, DOC, DOCX)

- [ ] **Admin users properly configured**
  - Admin flag (isAdmin: true) set in Firestore users collection
  - Test admin privileges in production environment
  - Document admin email addresses securely

### Network Security
- [ ] **HTTPS enforced**
  - Firebase uses HTTPS by default
  - No HTTP fallbacks in code
  - No mixed content warnings

- [ ] **API rate limiting**
  - Firebase handles automatically
  - Monitor usage in Firebase Console

---

## 📦 Build Configuration

### App Configuration (app.json / app.config.js)
- [ ] **Version numbers updated**
  - `version`: Semantic version (e.g., "1.0.0")
  - `android.versionCode`: Integer, increment each release
  - `ios.buildNumber`: Integer, increment each release

- [ ] **App identifiers correct**
  - `android.package`: Unique package name (e.g., com.easterbrook.eslexercises)
  - `ios.bundleIdentifier`: Unique bundle ID

- [ ] **Permissions documented**
  - android.permissions: Only necessary permissions
  - ios.infoPlist: Permission descriptions (if needed)

### Build Settings
- [ ] **ProGuard/R8 enabled** (Android)
  - Obfuscates code
  - Reduces app size
  - Configure in android/app/build.gradle (if using bare workflow)

- [ ] **App signing configured**
  ```bash
  # Using EAS Build (recommended)
  eas build:configure

  # Create production build
  eas build --platform android --profile production
  ```

- [ ] **Android App Bundle (AAB) generated**
  - Required by Google Play Store
  - EAS Build generates AAB by default

### Code Quality
- [ ] **ESLint checks pass**
  ```bash
  npm run lint
  ```

- [ ] **TypeScript compilation succeeds**
  ```bash
  npx tsc --noEmit
  ```

- [ ] **No TypeScript errors**
  - Fix all type errors before build
  - No `@ts-ignore` or `any` types in critical code

---

## 🧪 Testing

### Functional Testing
- [ ] **Authentication flows**
  - Registration with valid email
  - Login with correct credentials
  - Password reset (if implemented)
  - Logout

- [ ] **User features**
  - Browse categories and exercises
  - Complete exercises and submit answers
  - View progress and statistics
  - Download files (PDFs/DOCs)

- [ ] **Account management**
  - Update display name
  - Change password (requires current password)
  - Export data (JSON/TXT format)
  - Delete progress data
  - Delete account completely

- [ ] **Admin features** (if applicable)
  - Add/edit exercises
  - Upload files
  - Manage users
  - View analytics
  - Configure app settings

### Security Testing
- [ ] **Non-admin cannot access admin features**
  - Test with regular user account
  - Try accessing /admin routes
  - Verify Firestore rules block unauthorized access

- [ ] **User data isolation**
  - User A cannot see User B's progress
  - User A cannot modify User B's data
  - Test with multiple accounts

- [ ] **Data deletion works correctly**
  - Delete progress: Verify data removed from Firestore
  - Delete account: Verify user document deleted
  - Delete account: Verify Firebase Auth account deleted

### Performance Testing
- [ ] **App loads quickly**
  - Cold start under 3 seconds (recommended)
  - Test on low-end devices

- [ ] **No memory leaks**
  - Test extended usage (30+ minutes)
  - Monitor memory usage in development tools

- [ ] **Offline handling**
  - Test with no internet connection
  - Verify graceful error messages
  - Test with slow connection

---

## 📄 Documentation & Compliance

### Legal Documents
- [ ] **Privacy Policy accurate**
  - Matches actual data collection practices
  - Includes data deletion instructions
  - Includes contact information (support@onestepweb.dev)
  - Last updated date is current

- [ ] **Terms of Service** (if applicable)
  - Create if needed for your use case

### Google Play Console
- [ ] **Data Safety form completed**
  - All data collection disclosed
  - Data usage explained
  - Security practices documented
  - Data sharing disclosed (none for this app)

- [ ] **Store listing complete**
  - App title, short description, full description
  - Screenshots (minimum 2, recommended 4-8)
  - Feature graphic (1024x500)
  - App icon (512x512)
  - Content rating completed

- [ ] **Developer contact verified**
  - Email: support@onestepweb.dev
  - Website: https://easterbrook.at
  - Address: Hornbostelgasse 5, Wien 1060, Austria

---

## 🚀 Deployment Process

### Pre-Deployment
1. **Review all checklists above** - Ensure all items completed
2. **Create production Firebase project** - Separate from development
3. **Deploy security rules** - Firestore + Storage
4. **Create test accounts** - Regular user + admin user with data
5. **Test in production environment** - Use production Firebase project

### Build & Release
1. **Create production build**
   ```bash
   eas build --platform android --profile production
   ```

2. **Download AAB file** - From EAS Build dashboard

3. **Test AAB locally** (optional)
   ```bash
   bundletool build-apks --bundle=app.aab --output=app.apks
   ```

4. **Upload to Google Play Console**
   - Create new release
   - Upload AAB file
   - Add release notes
   - Submit for review

### Post-Deployment
- [ ] **Monitor Google Play Console** - Check for crashes
- [ ] **Monitor Firebase Console** - Check for usage spikes
- [ ] **Respond to reviews** - Address user feedback
- [ ] **Monitor support email** - Respond to support requests

---

## 🔍 Final Verification

### Security Audit Checklist
- [ ] No credentials in git history
  ```bash
  git log --all --full-history -- admin.txt
  git log --all --full-history --name-only --pretty=format: -- admin.txt
  ```

- [ ] No sensitive files in repository
  ```bash
  git ls-files | grep -E "\.env|credentials|secret|admin\.txt"
  ```

- [ ] Firebase rules deployed and tested
- [ ] Production Firebase project configured
- [ ] Privacy policy hosted publicly
- [ ] Test accounts prepared for Google review

### Compliance Verification
- [ ] Privacy policy matches data practices
- [ ] Data Safety form accurate
- [ ] All permissions justified
- [ ] Data deletion functional and documented
- [ ] User data exportable
- [ ] Contact information accessible

---

## 📊 Production Readiness Score

Count the completed items above:

- **Critical (Security)**: ___ / 10 items ✅ **MUST BE 100%**
- **Hardening**: ___ / 12 items ✅ Recommended 100%
- **Build Config**: ___ / 9 items ✅ Recommended 100%
- **Testing**: ___ / 15 items ✅ Recommended 90%+
- **Documentation**: ___ / 8 items ✅ Required for Play Store
- **Final Verification**: ___ / 6 items ✅ **MUST BE 100%**

**Minimum Acceptable**: All Critical + Final Verification items must be 100% complete.

---

## 🆘 Emergency Contacts

**If security issue discovered in production:**

1. **Disable affected features** (if possible via app settings maintenance mode)
2. **Deploy security fix** immediately
3. **Notify affected users** (if data breach)
4. **Document incident** for compliance

**Support Contacts:**
- Developer Email: support@onestepweb.dev
- Firebase Project: https://console.firebase.google.com/project/esl-exercises
- Google Play Console: [Your account]

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Google Play Developer Policies](https://play.google.com/about/developer-content-policy/)
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Google Play Data Safety](https://support.google.com/googleplay/android-developer/answer/10787469)

---

**Last Updated**: January 2025
**For App Version**: 1.0.0
**Review Before**: Every production deployment

