Write-Host "=== DreamKSA First Upload Guide ===" -ForegroundColor Green
Write-Host ""
Write-Host "Since this is your first app submission, Google requires manual upload." -ForegroundColor Yellow
Write-Host "This is a one-time requirement - future releases will be automated!" -ForegroundColor Cyan
Write-Host ""

# Get the latest build
Write-Host "→ Getting latest build info..." -ForegroundColor Blue
$buildInfo = npx eas build:list -p android --limit 1 --json | ConvertFrom-Json
$buildUrl = $buildInfo[0].artifacts.buildUrl
$versionCode = $buildInfo[0].versionCode

Write-Host "Build URL: $buildUrl" -ForegroundColor White
Write-Host "Version Code: $versionCode" -ForegroundColor White
Write-Host ""

Write-Host "→ Quick Upload Steps:" -ForegroundColor Green
Write-Host "1. Download AAB: $buildUrl" -ForegroundColor White
Write-Host "2. Go to: https://play.google.com/console" -ForegroundColor White
Write-Host "3. Select app: DreamKSA (app.dreamksa)" -ForegroundColor White
Write-Host "4. Production → Releases → Create new release" -ForegroundColor White
Write-Host "5. Upload AAB file" -ForegroundColor White
Write-Host "6. Add release notes: 'Initial beta release'" -ForegroundColor White
Write-Host "7. Save → Review → Start rollout" -ForegroundColor White
Write-Host ""

Write-Host "→ OAuth Setup (for Google Sign-In):" -ForegroundColor Yellow
Write-Host "Add this SHA-1 to your Android OAuth client:" -ForegroundColor White
Write-Host "E5:EC:FB:76:B5:0A:F8:94:95:E2:68:C9:B4:B6:45:B1:D6:1E:22:3F" -ForegroundColor Cyan
Write-Host ""

Write-Host "→ After first upload, use automated script:" -ForegroundColor Green
Write-Host "npm run release:android:beta:ps" -ForegroundColor White
Write-Host ""

# Open the build URL in browser
Write-Host "→ Opening build URL in browser..." -ForegroundColor Blue
Start-Process $buildUrl
