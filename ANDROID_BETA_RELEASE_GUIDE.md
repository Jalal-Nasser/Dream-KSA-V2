# DreamKSA — Android Beta Release Guide

> Target: **Internal testing** (Google Play) using **EAS** with profile `beta`.

## Prerequisites
1. **EAS Project** linked in `app.config.ts` (`extra.eas.projectId`).
2. **Branding ready**: icon (512×512), feature graphic (1024×500), screenshots, Arabic store listing.
3. **OAuth**: Android client created in Google Cloud:
   - **Package**: `app.dreamksa`
   - **SHA-1**: from `eas credentials -p android --display` (Upload key). After first upload, also add **App signing SHA-1** from Play Console → App integrity.
4. **Privacy URLs** hosted on Plesk:
   - Terms: `https://api.dreamsksa.online/terms`
   - Privacy: `https://api.dreamsksa.online/privacy`

## One-time Play API access
1. In **Google Play Console** → **API access** → Link a Google Cloud project.
2. Create a **Service Account** (Release Manager), download JSON → save as `play-service-account.json` (⚠️ ignored by git).
   - A template is at `play-service-account.json.template`.

## Build & Submit
### Windows (PowerShell)
```powershell
npm run release:android:beta:ps
```
### macOS/Linux (Bash)
```bash
npm run release:android:beta
```
This will:
1) Build an **.aab** with EAS (`--profile beta`)  
2) Submit to Play **Internal testing** (requires `play-service-account.json`)

> To submit without rebuilding:  
> PowerShell: `npm run release:android:beta:ps -- -SkipBuild`  
> Bash: `SKIP_BUILD=true npm run release:android:beta`

## Play Console checklist
1. Create app **DreamKSA** (Default language: **Arabic**).  
2. Store presence → set app name, short/long descriptions (AR & EN), upload icon/graphics/screenshots.  
3. App content → App access, Ads, Content rating, Target audience, Data safety.  
4. Testing → **Internal testing** → Create release → (script should have uploaded) → Add testers → Roll out.  
5. Share the opt-in link with testers.

## Common issues
- **Google login fails in release** → Missing SHA-1 on the Android OAuth client. Add both **Upload** and **App signing** SHA-1. Rebuild if needed.
- **Submit fails: no service account** → Ensure `play-service-account.json` exists and has Release Manager permissions.
- **Version code conflict** → Bump `android.versionCode` in `app.config.ts` (must always increase).
- **Twilio trial SMS restriction** → Only verified numbers work; upgrade or add tester numbers in Twilio.

## Next release
1. Update `app.config.ts`:
   - `"version": "0.5.1-beta"`
   - `android.versionCode: 6`
2. Commit and tag:
```bash
git add -A && git commit -m "chore: 0.5.1-beta"
git tag v0.5.1-beta && git push --tags
```
3. Run the release script again.
