const express = require('express');
const router = express.Router();

function getSB(req) {
  return req.app?.locals?.supabase || null;
}

router.get('/debug/ping', (_req, res) => {
  res.json({ ok: true, msg: 'pong', mounted: true });
});

router.get('/debug/env', (req, res) => {
  res.json({
    ok: true,
    env: {
      has_SUPABASE_URL: !!process.env.SUPABASE_URL,
      has_SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_SERVICE_KEY,
      has_HMS_ACCESS_KEY: !!(process.env.HMS_ACCESS_KEY || process.env.HMS_APP_ID),
      has_HMS_SECRET: !!(process.env.HMS_SECRET || process.env.HMS_APP_SECRET),
      has_HMS_MANAGEMENT_TOKEN: !!process.env.HMS_MANAGEMENT_TOKEN,
      has_HMS_ROOM_TEMPLATE_ID: !!process.env.HMS_ROOM_TEMPLATE_ID,
    }
  });
});

module.exports = router;
