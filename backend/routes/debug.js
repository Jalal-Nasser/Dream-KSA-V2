const express = require('express');
const router = express.Router();

function getSB(req) {
  return req.app?.locals?.supabase || null;
}

router.get('/debug/hms-room/:roomId', async (req, res) => {
  const supabase = getSB(req);
  const roomId = req.params.roomId;
  if (!roomId) return res.status(400).json({ ok: false, message: 'roomId required' });
  const env = {
    has_mgmt_token: !!(process.env.HMS_MANAGEMENT_TOKEN || process.env.HMS_APP_ID),
    has_template: !!process.env.HMS_ROOM_TEMPLATE_ID,
  };
  let hms_room_id = null;
  if (supabase) {
    const { data } = await supabase.from('rooms').select('hms_room_id').eq('id', roomId).maybeSingle();
    hms_room_id = data?.hms_room_id || null;
  }
  res.json({ ok: true, room_id: roomId, hms_room_id, env });
});

module.exports = router;
