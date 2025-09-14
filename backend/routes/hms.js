// routes/hms.js
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

function getSB(req) {
  return req.app?.locals?.supabase || null;
}

function normalizeBearer(token) {
  if (!token) return '';
  const t = token.trim();
  if (t.toLowerCase().startsWith('bearer ')) return t.slice(7).trim();
  return t;
}

/**
 * POST /hms/token
 * body: { room_id: string, user_id: string, name?: string, role?: "host"|"speaker"|"listener" }
 * env: HMS_ACCESS_KEY, HMS_SECRET
 */
router.post("/token", async (req, res) => {
  try {
    const { room_id, user_id, name, role } = req.body || {};
    if (!room_id || !user_id) {
      return res.status(400).json({ ok: false, message: "room_id and user_id required" });
    }
    // Support both naming conventions (Railway vs local):
    // - HMS_ACCESS_KEY / HMS_SECRET (Railway)
    // - HMS_APP_ID / HMS_APP_SECRET (local dev)
    const accessKey = process.env.HMS_ACCESS_KEY || process.env.HMS_APP_ID;
    const secret    = process.env.HMS_SECRET     || process.env.HMS_APP_SECRET;
    if (!accessKey || !secret) {
      return res.status(500).json({ ok: false, message: "HMS server keys missing" });
    }

    // Prefer mapped 100ms room id from DB if available
    let hms_room_id = null;
    const supabase = getSB(req);
    if (supabase) {
      try {
        const { data: r } = await supabase.from('rooms').select('hms_room_id').eq('id', room_id).maybeSingle();
        hms_room_id = r?.hms_room_id || null;
      } catch {}
    }
    if (!hms_room_id) {
      console.warn('[hms/token] missing hms_room_id for room', room_id, '— falling back, users may not co-locate');
    }

    const payload = {
      access_key: accessKey,
      type: "app",
      version: 2,
      room_id: hms_room_id || room_id,
      user_id,
      role: role || "listener",
      // metadata: { name }, // optional
    };
    const token = jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: "1h" });
    return res.json({ ok: true, token });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "token generation failed", details: String(e?.message || e) });
  }
});

module.exports = router;
