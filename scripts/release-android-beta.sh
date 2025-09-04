#!/usr/bin/env bash
set -euo pipefail

TRACK="${1:-internal}"  # internal | closed | open | production
SKIP_BUILD="${SKIP_BUILD:-false}"

echo "=== DreamKSA Android Beta Release ==="
echo "Track: ${TRACK}"

if [ ! -f "./play-service-account.json" ]; then
  echo "⚠️  play-service-account.json not found. Create it from play-service-account.json.template (DO NOT COMMIT THE REAL FILE)."
  echo "You can still build, but submit will fail."
fi

echo "→ Checking tools..."
npx --yes expo --version >/dev/null
npx --yes eas --version >/dev/null

git status -s

if [ "${SKIP_BUILD}" != "true" ]; then
  echo "→ Building AAB with EAS (profile: beta)..."
  npx eas build -p android --profile beta --non-interactive
else
  echo "→ Skipping build (SKIP_BUILD=true)."
fi

if [ -f "./play-service-account.json" ]; then
  echo "→ Submitting to Google Play (${TRACK})..."
  npx eas submit -p android --profile beta --non-interactive --track "${TRACK}"
else
  echo "⚠️  Skipping submit because play-service-account.json is missing."
fi

echo "✅ Done. Check Google Play Console → Testing → ${TRACK}."
