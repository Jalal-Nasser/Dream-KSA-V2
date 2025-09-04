# Android Beta Release Script for DreamKSA
# Run this from the project root directory

Write-Host "🚀 Starting Android Beta Release Process..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "app.config.js")) {
    Write-Host "❌ Error: app.config.js not found. Please run from project root." -ForegroundColor Red
    exit 1
}

# Check if EAS CLI is installed
try {
    $easVersion = npx eas --version
    Write-Host "✅ EAS CLI version: $easVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g @expo/eas-cli
}

# Check if play-service-account.json exists
if (-not (Test-Path "play-service-account.json")) {
    Write-Host "⚠️  Warning: play-service-account.json not found." -ForegroundColor Yellow
    Write-Host "   Please create it from play-service-account.json.template" -ForegroundColor Yellow
    Write-Host "   Or use manual upload method." -ForegroundColor Yellow
}

# Run expo doctor
Write-Host "🔍 Running expo doctor..." -ForegroundColor Blue
npx expo doctor

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Expo doctor found issues. Please fix them before continuing." -ForegroundColor Red
    exit 1
}

# Build the AAB
Write-Host "🔨 Building Android AAB for beta..." -ForegroundColor Blue
Write-Host "   This may take 10-15 minutes..." -ForegroundColor Yellow

npx eas build -p android --profile beta

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed. Check the logs above." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Check if service account exists for automatic submit
if (Test-Path "play-service-account.json") {
    Write-Host "📤 Submitting to Google Play Internal Testing..." -ForegroundColor Blue
    npx eas submit -p android --profile beta
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Successfully submitted to Google Play!" -ForegroundColor Green
        Write-Host "   Check Play Console for the release status." -ForegroundColor Yellow
    } else {
        Write-Host "❌ Submit failed. You can manually upload the AAB from the build page." -ForegroundColor Red
    }
} else {
    Write-Host "📋 Manual Upload Required:" -ForegroundColor Yellow
    Write-Host "   1. Go to the EAS build page and download the .aab file" -ForegroundColor White
    Write-Host "   2. Upload it to Google Play Console → Internal Testing" -ForegroundColor White
    Write-Host "   3. Add testers and roll out the release" -ForegroundColor White
}

Write-Host "🎉 Android Beta Release Process Complete!" -ForegroundColor Green
