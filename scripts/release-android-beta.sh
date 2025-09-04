#!/usr/bin/env bash
set -euo pipefail

TRACK="${1:-internal}" # internal | closed | open | production
SKIP_BUILD="${SKIP_BUILD:-false}"

echo "=== DreamKSA Android Release ==="
echo "Track: ${TRACK}"

if ! command -v npx >/dev/null; then
  echo "npx is not available in PATH"; exit 1
fi

echo "→ Checking CLIs..."
npx --yes expo --version >/dev/null
npx --yes eas --version >/dev/null

git status -s

if [ "${SKIP_BUILD}" != "true" ]; then
  echo "→ Building AAB (profile: beta)..."
  npx eas build -p android --profile beta --non-interactive
else
  echo "→ Skipping build (SKIP_BUILD=true)."
fi

if [ ! -f "./play-service-account.json" ]; then
  echo "⚠️  play-service-account.json not found. Submit may fail (service account required)."
fi

echo "→ Submitting to Google Play (${TRACK})..."
# Map track to submit profile
case "${TRACK}" in
  "internal") SUBMIT_PROFILE="beta" ;;
  "closed") SUBMIT_PROFILE="closed" ;;
  "open") SUBMIT_PROFILE="open" ;;
  "production") SUBMIT_PROFILE="production" ;;
  *) SUBMIT_PROFILE="beta" ;;
esac
npx eas submit -p android --profile "${SUBMIT_PROFILE}" --non-interactive --latest

echo "✅ Done. Check Google Play Console → Testing → ${TRACK}."
