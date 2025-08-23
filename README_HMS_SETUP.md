# HMS Setup (Replace placeholders, then run)

## Supabase Edge Function Secrets (in Dashboard → Project Settings → Functions → Secrets)
- HMS_SUBDOMAIN = <YOUR_100MS_SUBDOMAIN>
- HMS_ACCESS_KEY = <YOUR_100MS_ACCESS_KEY>
- HMS_SECRET     = <YOUR_100MS_SECRET>
- HMS_REGION     = prod-in  (or prod-us / prod-eu)

## Optional: CLI deploy (Terminal)
1) npm run supabase:login        # paste your Supabase access token
2) npm run supabase:link         # REPLACE project ref in package.json first
3) npm run functions:deploy
4) npm run functions:logs

## Test (curl)
curl -s -X POST "https://<YOUR_PROJECT_REF>.functions.supabase.co/hms-token" \
  -H "content-type: application/json" \
  -d '{"room_id":"<24_CHAR_HMS_ROOM_ID>","user_id":"smoke","role":"listener"}'

Expected: {"token":"<JWT>"}



