# Android Beta Release Guide for DreamKSA

## 🎯 Overview
This guide will help you ship the Android Beta to Google Play Store using EAS Build and Submit.

## 📋 Prerequisites Checklist

### 1. Brand Assets (Required)
- [ ] **App Icon**: `./assets/images/icon.png` (1024x1024px) - Cherry Blossom theme
- [ ] **Feature Graphic**: `./assets/feature-graphic.png` (1024x500px) - For Play Store
- [ ] **Splash Screen**: Aligned with Cherry Blossom theme

### 2. Google Cloud Console Setup
- [ ] **Create Android OAuth Client**:
  - Package: `app.dreamksa`
  - Get SHA-1 fingerprints:
    - Upload key: `npx eas credentials -p android --display`
    - App signing key: (after first upload from Play Console)
  - Copy `androidClientId` to your environment

### 3. EAS Project Setup
- [ ] **Configure EAS**: `npx eas build:configure`
- [ ] **Let EAS manage Android Keystore** (recommended)
- [ ] **Set EAS_PROJECT_ID** in environment variables

## 🚀 Release Process

### Option A: Automated (Recommended)

1. **Setup Service Account**:
   ```bash
   # Create service account in Google Cloud Console
   # Download JSON key and save as play-service-account.json
   cp play-service-account.json.template play-service-account.json
   # Edit with your actual credentials
   ```

2. **Run Release Script**:
   ```powershell
   .\scripts\release-android-beta.ps1
   ```

### Option B: Manual Upload

1. **Build AAB**:
   ```bash
   npx expo doctor
   npx eas build -p android --profile beta
   ```

2. **Download & Upload**:
   - Download `.aab` from EAS build page
   - Upload to Google Play Console → Internal Testing

## 📱 Google Play Console Setup

### 1. Create App
- **App Name**: DreamKSA (Arabic & English)
- **Default Language**: ar-SA
- **Package Name**: app.dreamksa

### 2. App Content
- **App Access**: Public
- **Ads**: Select if showing ads
- **Content Rating**: Complete questionnaire
- **Target Audience**: Set appropriately
- **Data Safety**: 
  - Declare Supabase networking as "transmitted but not shared"
  - Mark data as encrypted in transit
  - No precise location if not used

### 3. Store Listing
- **App Name**: DreamKSA (Arabic & English)
- **Short Description**: Voice chat app for Saudi Arabia
- **Full Description**: Detailed description in Arabic and English
- **Screenshots**: Minimum 2 phone screenshots
- **Hi-res Icon**: 512×512px
- **Feature Graphic**: 1024×500px

### 4. Internal Testing
- **Create Release**: Upload AAB file
- **Add Testers**: Email addresses or Google Groups
- **Roll Out**: Make available to testers

## 🔧 Troubleshooting

### Google Login Fails in Release
- **Cause**: Missing SHA-1 on OAuth client
- **Fix**: Add both "Upload" and "App signing" SHA-1 to Google OAuth client

### Data Safety Rejection
- **Cause**: Incorrect data safety declarations
- **Fix**: Declare Supabase as "transmitted but not shared", mark as encrypted

### Install Blocked
- **Cause**: Testers not in Internal Testing program
- **Fix**: Testers must join Internal Testing program via opt-in link

## 📈 Roll Forward Process

### Promote to Production
1. **Internal → Closed Testing**: Add more testers
2. **Closed → Open Testing**: Public beta
3. **Open → Production**: Full release

### Next Release
- **Update Version**: `0.5.1-beta` in app.config.js
- **Increment versionCode**: 6, 7, 8, etc.
- **Tag Release**: `git tag v0.5.0-beta && git push --tags`

## 🔑 Environment Variables

Required in your `.env` file:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
EAS_PROJECT_ID=your_eas_project_id
```

## 📞 Support

If you encounter issues:
1. Check EAS build logs
2. Verify Google OAuth configuration
3. Ensure all required assets are present
4. Check Play Console for specific error messages

---

**Ready to ship?** Run `.\scripts\release-android-beta.ps1` to start the automated process!
