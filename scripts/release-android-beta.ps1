Param(
  [string]$Track = "internal",   # internal | closed | open | production
  [switch]$SkipBuild
)

Write-Host "=== DreamKSA Android Release ==="
Write-Host "Track: $Track"

if (-Not (Get-Command npx -ErrorAction SilentlyContinue)) {
  throw "npx is not available in PATH"
}

Write-Host "→ Checking CLIs..."
npx --yes expo --version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Expo CLI not found" }
npx --yes eas --version | Out-Null
if ($LASTEXITCODE -ne 0) { throw "EAS CLI not found" }

git status -s

if (-Not $SkipBuild) {
  Write-Host "`n→ Building AAB (profile: beta)..."
  npx eas build -p android --profile beta --non-interactive
  if ($LASTEXITCODE -ne 0) { throw "EAS build failed" }
} else {
  Write-Host "`n→ Skipping build (--SkipBuild)."
}

if (-Not (Test-Path "./play-service-account.json")) {
  Write-Warning "play-service-account.json not found. Submit may fail (service account required)."
}

Write-Host "`n→ Submitting to Google Play ($Track)..."
# Map track to submit profile
$SubmitProfile = switch ($Track) {
  "internal" { "beta" }
  "closed" { "closed" }
  "open" { "open" }
  "production" { "production" }
  default { "beta" }
}
npx eas submit -p android --profile $SubmitProfile --non-interactive --latest
if ($LASTEXITCODE -ne 0) { throw "EAS submit failed" }

Write-Host "`n✅ Done. Check Google Play Console → Testing → $Track."
