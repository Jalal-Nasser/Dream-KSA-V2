const express = require('express');
const router = express.Router();

function getSB(req) {
  return req.app?.locals?.supabase || null;
}

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

router.get('/debug/hms-room/:roomId', async (req, res) => {
  const supabase = getSB(req);
  const roomId = req.params.roomId;
  if (!roomId) return res.status(400).json({ ok: false, message: 'roomId required' });

  let hms_room_id = null;
  if (supabase) {
    const { data, error } = await supabase
      .from('rooms')
      .select('hms_room_id')
      .eq('id', roomId)
      .maybeSingle();
    if (!error) hms_room_id = data?.hms_room_id || null;
  }
  res.json({
    ok: true,
    room_id: roomId,
    hms_room_id,
    env: {
      has_mgmt_token: !!process.env.HMS_MANAGEMENT_TOKEN,
      has_template: !!process.env.HMS_ROOM_TEMPLATE_ID,
    }
  });
});

module.exports = router;
