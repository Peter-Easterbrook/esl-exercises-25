# Google Play Store Compliance Checklist

This document outlines all requirements for submitting the ESL Exercises app to the Google Play Store. Complete each item before submission to ensure compliance with Google Developer Program Policies.

---

## 📱 App Information & Metadata

### Store Listing Requirements

- [x] **App Title**: Max 30 characters (Current: "ESL Exercises")
- [x] **Short Description**: Max 80 characters, compelling summary
- [ ] **Full Description**: Max 4000 characters, detailed features and benefits
- [ ] **App Icon**: 512x512 PNG, follows Material Design guidelines
- [ ] **Feature Graphic**: 1024x500 PNG for store listing header
- [ ] **Screenshots**: Minimum 2, maximum 8 (phone and tablet)
  - Phone: 16:9 or 9:16 aspect ratio
  - Tablet: Recommended for better visibility
- [ ] **App Category**: Education > Language Learning
- [ ] **Content Rating**: Completed questionnaire (likely PEGI 3 / ESRB Everyone)
- [ ] **Target Age Group**: 18+ recommended (or "Everyone" if appropriate)

---

## 🔐 Privacy & Data Protection

### Privacy Policy Requirements

- [x] **Privacy Policy Created**: Located at `app/privacy-policy.tsx`
- [x] **In-App Access**: Accessible from Profile > Privacy Policy
- [x] **Store Listing Link**: Must provide URL to hosted privacy policy
  - **Action Required**: Host privacy policy at a publicly accessible URL
  - Options:
    - Company website (e.g., https://easterbrook.at/privacy)
    - GitHub Pages
    - Privacy policy hosting service
  - **Current Status**: Only accessible in-app (NOT sufficient for Play Store)

### Data Safety Form (Play Console)

Complete this section accurately based on actual data practices:

#### Data Collection

- [x] **User Identifiers**

  - Email address (Collected, Required)
  - User ID (Collected, Required)

- [x] **Account Info**

  - Display name (Collected, Optional)
  - Password (Collected, Required)

- [x] **App Activity**

  - Exercise completion history (Collected, Optional)
  - Quiz scores (Collected, Optional)
  - Progress data (Collected, Optional)

- [x] **Device Information**
  - Device type (Not collected directly, but Firebase may collect)
  - Operating system (Not collected directly, but Firebase may collect)

#### Data NOT Collected

- [ ] Location data
- [ ] Financial information
- [ ] Health & fitness data
- [ ] Photos or videos
- [ ] Audio files
- [ ] Calendar events
- [ ] Contacts
- [ ] SMS or call logs
- [ ] Microphone access
- [ ] Camera access
- [ ] Biometric data

#### Data Usage

- [x] **Account Management**: Email, password for authentication
- [x] **App Functionality**: Progress tracking, exercise completion
- [x] **Analytics**: Aggregate usage statistics (admin dashboard)

#### Data Sharing

- [ ] **Third-party Sharing**: None (all data stays within Firebase)
- [ ] **No data sold to third parties**
- [ ] **No data shared for advertising purposes**

#### Security Practices

- [x] **Data Encrypted in Transit**: Firebase uses HTTPS/TLS
- [x] **Data Encrypted at Rest**: Firestore encryption
- [x] **User Can Request Data Deletion**: Yes (in-app + email)
- [x] **User Can Export Data**: Yes (Account Settings > Export My Data)

### Data Deletion Instructions

- [x] **In-App Deletion**: Profile > Account Settings > Danger Zone
  - Delete Progress Data Only
  - Delete Account Completely
- [x] **Email Deletion**: support@onestepweb.dev
- [x] **Documented in Privacy Policy**: Step-by-step instructions included
- [x] **Response Time**: 30 days maximum

---

## 🔒 Security Requirements

### Credentials & Sensitive Data

- [x] **No Hardcoded Credentials**: admin.txt excluded from git
- [x] **Firebase API Key Security**: Properly secured via Firestore Rules
- [x] **Environment Variables**: .env files in .gitignore
- [ ] **Production Firebase Project**: Use separate project from development
- [ ] **Firebase App Check**: Optional but recommended for additional security

### Firestore Security Rules

- [ ] **Rules Configured**: Verify all rules are deployed to Firebase
- [ ] **Admin Verification**: isAdmin() function checks Firestore, not client claims
- [ ] **User Data Isolation**: Users can only access their own data
- [ ] **Content Protection**: Exercises/categories read-only for regular users
- [ ] **Settings Protection**: appSettings accessible only to admins

**Test Security Rules:**

```bash
# Test as regular user
firebase emulators:start --only firestore

# Verify non-admin cannot access admin features
# Verify users cannot modify other users' data
# Verify exercises cannot be modified by regular users
```

### Authentication Security

- [x] **Password Minimum Length**: 6 characters (Firebase default)
- [x] **Email Verification**: Optional (configured in app settings)
- [x] **Re-authentication**: Required for password changes and account deletion
- [ ] **Account Enumeration Prevention**: Firebase handles automatically

---

## 📋 Permissions & Features

### Required Permissions

Document all permissions in Play Console with justifications:

- [ ] **Internet Access** (INTERNET)

  - Justification: Required for Firebase authentication and data sync

- [ ] **Network State** (ACCESS_NETWORK_STATE)

  - Justification: Check connectivity before Firebase operations

- [ ] **Storage Access** (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)
  - Justification: File downloads (PDFs, DOCs) and data export
  - **Important**: Must request at runtime on Android 6.0+

### Optional Features

- [ ] File sharing capabilities clearly documented
- [ ] No background location tracking
- [ ] No camera or microphone access
- [ ] No SMS or phone access

---

## 👥 User Experience & Content

### Target Audience

- [ ] **Age Rating**: 18+ or Everyone (based on content)
- [ ] **Content Rating Questionnaire**: Completed in Play Console
  - Violence: None
  - Sexual Content: None
  - Profanity: None
  - Controlled Substances: None
  - User-Generated Content: None (exercises are admin-controlled)

### Accessibility

- [ ] **Screen Reader Support**: Test with TalkBack
- [ ] **Color Contrast**: WCAG AA compliance (light/dark themes)
- [ ] **Touch Targets**: Minimum 48x48dp
- [ ] **Text Scaling**: Support Android system font sizes

### User Support

- [x] **Help & Support Page**: In-app (Profile > Help & Support)
- [x] **FAQ Section**: Comprehensive Q&A with troubleshooting
- [ ] **Developer Email**: support@onestepweb.dev (verify matches Play Console)
- [ ] **Developer Website**: https://easterbrook.at (verify accessible)
- [ ] **Developer Address**: Verify matches Play Console
  - Current: Hornbostelgasse 5, Wien 1060, Austria (OneStepWeb)
  - **Action Required**: Confirm this matches Play Console account

---

## 🧪 Testing Requirements

### Pre-Submission Testing

- [ ] **Test on Multiple Devices**: Phone and tablet
- [ ] **Test Android Versions**: Minimum API level to latest
- [ ] **Test Network Conditions**: Offline, slow connection, no connection
- [ ] **Test Data Deletion**: Verify progress and account deletion work
- [ ] **Test Data Export**: Verify export functionality works
- [ ] **Test Admin Features**: Verify non-admins cannot access
- [ ] **Test User Flows**: Registration, login, exercises, progress

### Test Account Credentials

Provide to Google for app review:

```
REGULAR USER ACCOUNT:
Email: test@test.com
Password: [See admin.txt for current password]
Note: This account has exercise progress and normal user permissions

ADMIN ACCOUNT:
Email: admin@easterbrook.at
Password: [See admin.txt for current password]
Note: This account has admin privileges for content management
```

**Action Required**:

- Create a dedicated test account for Google reviewers
- Ensure test accounts have realistic data
- Document any special features or admin access

---

## 🚀 Build Configuration

### App Signing

- [ ] **App Signed with Release Key**: Use EAS Build or generate keystore
- [ ] **Key Management**: Securely store keystore and passwords
- [ ] **Play App Signing**: Recommended (Google manages key)

### Build Variants

- [ ] **Production Build**: `eas build --platform android --profile production`
- [ ] **ProGuard/R8 Enabled**: Optimize and obfuscate code
- [ ] **Remove Debug Code**: No console.logs or debug flags
- [ ] **Version Code**: Increment for each release (versionCode in app.json)
- [ ] **Version Name**: Semantic versioning (e.g., 1.0.0)

### App Bundle (AAB)

- [ ] **Android App Bundle**: Required by Play Store (not APK)
- [ ] **Dynamic Delivery**: Configure feature modules if needed
- [ ] **Asset Packs**: Configure for large files if needed

---

## 📄 Legal & Compliance

### Required Documents

- [x] **Privacy Policy**: Created and accessible in-app
- [ ] **Privacy Policy URL**: Must be hosted publicly
- [ ] **Terms of Service**: Optional but recommended
- [ ] **Developer Contact**: Email verified in Play Console
- [ ] **Developer Identity**: Verified with Google

### GDPR/CCPA Compliance

- [x] **Right to Access**: Users can export data (Account Settings)
- [x] **Right to Erasure**: Users can delete data (Account Settings)
- [x] **Right to Rectification**: Users can update display name
- [x] **Data Portability**: Export feature provides JSON/TXT
- [x] **Consent Management**: Privacy policy covers data collection
- [x] **Data Retention**: Documented (12 months inactivity policy)

### Children's Privacy (COPPA)

- [ ] **Not Directed at Children**: If targeting 18+, clearly state
- [ ] **No Child Data Collection**: Privacy policy confirms
- [ ] **Age Verification**: App confirms users are 18+ at registration

---

## 🔍 Pre-Launch Checklist

### Final Review Before Submission

- [ ] **All Checklists Complete**: Review all sections above
- [ ] **Privacy Policy Hosted**: URL accessible without app
- [ ] **Test Accounts Provided**: Include credentials in review notes
- [ ] **Screenshots Updated**: Show latest UI and features
- [ ] **Store Listing Complete**: All fields filled accurately
- [ ] **Data Safety Form Accurate**: Matches actual data practices
- [ ] **Security Audit Complete**: Firebase rules tested
- [ ] **No Hardcoded Secrets**: Review codebase for credentials
- [ ] **Production Firebase Project**: Not using development database
- [ ] **Error Handling Tested**: App doesn't crash on common errors
- [ ] **Analytics Reviewed**: No PII in analytics events

### Play Console Pre-Launch Report

- [ ] **Run Pre-Launch Report**: Automatic testing on various devices
- [ ] **Review Crash Reports**: Fix any crashes found
- [ ] **Review Warnings**: Address security or compatibility issues
- [ ] **Performance Testing**: Check app size, load times, memory usage

---

## 📊 Data Safety Disclosure Summary

Copy this into Play Console Data Safety section:

**Data Collection Summary:**

- Account email and password for authentication
- Display name for user profile
- Exercise completion history for progress tracking
- Quiz scores for learning analytics
- Device type and OS version (via Firebase)

**Data Usage:**

- All data used solely for app functionality
- No data shared with third parties
- No data used for advertising
- No data sold to any third party

**Data Security:**

- All data encrypted in transit (HTTPS/TLS)
- All data encrypted at rest (Firebase Firestore)
- Users can delete data anytime via in-app settings or email request
- Users can export all data via in-app Account Settings

**Data Retention:**

- Data retained as long as account is active
- Inactive accounts (12+ months) may be deleted with email notice
- Deleted data removed from active systems within 30 days
- Some data may be retained for legal/security purposes

---

## 🎯 Post-Submission Actions

### After Approval

- [ ] **Monitor Reviews**: Respond to user feedback
- [ ] **Monitor Crash Reports**: Fix issues promptly (Firebase Crashlytics)
- [ ] **Monitor Analytics**: Track user engagement
- [ ] **Update Privacy Policy**: If data practices change
- [ ] **Update Data Safety**: If data collection changes

### Ongoing Compliance

- [ ] **Privacy Policy Updates**: Notify users of material changes
- [ ] **Security Updates**: Regular Firebase SDK updates
- [ ] **Dependency Updates**: Keep npm packages current
- [ ] **Policy Compliance**: Review Google Play Policies quarterly

---

## 📞 Support Contacts

**Developer Support:**

- Email: support@onestepweb.dev
- Website: https://easterbrook.at
- Address: Hornbostelgasse 5, Wien 1060, Austria

**Firebase Project:**

- Project ID: esl-exercises
- Project URL: https://console.firebase.google.com/project/esl-exercises

**Google Play Console:**

- Account: [Your Google Play Developer Account]
- App ID: [Will be assigned after initial submission]

---

## ⚠️ Common Rejection Reasons

Avoid these common issues:

1. **Privacy Policy Not Publicly Accessible**

   - ❌ Only accessible in-app
   - ✅ Hosted at public URL (website, GitHub Pages, etc.)

2. **Data Safety Form Incomplete**

   - ❌ Vague or inaccurate data collection disclosure
   - ✅ Detailed, accurate disclosure matching actual practices

3. **Permissions Not Justified**

   - ❌ Requesting permissions without clear justification
   - ✅ Every permission has documented use case in store listing

4. **Data Deletion Not Clear**

   - ❌ No clear instructions for data deletion
   - ✅ Step-by-step instructions in privacy policy and in-app

5. **Hardcoded Credentials**

   - ❌ API keys, passwords visible in code
   - ✅ All credentials secured, test accounts provided separately

6. **Misleading Store Listing**

   - ❌ Screenshots or descriptions not matching actual app
   - ✅ Accurate representation of app features

7. **Target Audience Issues**

   - ❌ App content doesn't match declared age rating
   - ✅ Content rating questionnaire completed accurately

8. **Test Account Issues**
   - ❌ No test account provided, or credentials don't work
   - ✅ Working test accounts with realistic data

---

## ✅ Final Checklist Summary

**Critical Items (Must Complete):**

- [ ] Privacy policy hosted at public URL
- [ ] Data Safety form completed accurately
- [ ] Test accounts provided with working credentials
- [ ] All hardcoded credentials removed
- [ ] Firebase Security Rules deployed and tested
- [ ] App signed with release key
- [ ] Screenshots and store listing complete

**High Priority (Strongly Recommended):**

- [ ] Pre-launch report run and issues resolved
- [ ] Multiple device testing completed
- [ ] Security audit completed
- [ ] Data deletion tested end-to-end
- [ ] User support channels verified

**Medium Priority (Good to Have):**

- [ ] Firebase App Check configured
- [ ] Terms of Service created
- [ ] Crashlytics integrated
- [ ] Analytics reviewed for PII
- [ ] Accessibility tested with TalkBack

---

## 📚 Additional Resources

- [Google Play Console](https://play.google.com/console)
- [Google Play Developer Policies](https://play.google.com/about/developer-content-policy/)
- [Data Safety Section Guidelines](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Expo EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Android App Bundle Documentation](https://developer.android.com/guide/app-bundle)

---

**Last Updated**: January 2025
**App Version**: 1.0.0
**Compliance Status**: In Progress
