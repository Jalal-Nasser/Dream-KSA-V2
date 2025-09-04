Param(
  [string]$Track = "internal",          # internal | closed | open | production
  [switch]$SkipBuild                    # only submit the last build
)

Write-Host "=== DreamKSA Android Beta Release ==="
Write-Host "Track: $Track"

if (-Not (Test-Path "./play-service-account.json")) {
  Write-Warning "play-service-account.json not found. Create it from play-service-account.json.template (DO NOT COMMIT THE REAL FILE)."
  Write-Warning "You can still build, but submit will fail."
}

Write-Host "`n→ Checking tools..."
npx --yes expo --version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Expo CLI not found" }
npx --yes eas --version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "EAS CLI not found" }

git status -s

if (-Not $SkipBuild) {
  Write-Host "`n→ Building AAB with EAS (profile: beta)..."
  npx eas build -p android --profile beta --non-interactive
  if ($LASTEXITCODE -ne 0) { throw "EAS build failed" }
}
else {
  Write-Host "`n→ Skipping build (per --SkipBuild)."
}

if (Test-Path "./play-service-account.json") {
  Write-Host "`n→ Submitting to Google Play ($Track)..."
  npx eas submit -p android --profile beta --non-interactive --path policy:latest --track $Track
  if ($LASTEXITCODE -ne 0) { throw "EAS submit failed" }
}
else {
  Write-Warning "Skipping submit because play-service-account.json is missing."
}

Write-Host "`n✅ Done. Check Google Play Console → Testing → $Track."
