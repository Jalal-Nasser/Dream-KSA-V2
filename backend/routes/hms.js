// routes/hms.js
const express = require("express");
const jwt = require("jsonwebtoken");
const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const router = express.Router();

function getSB(req) {
  return req.app?.locals?.supabase || null;
}

function resolveTokenRole(dbRole) {
  const publishRole = (process.env.HMS_PUBLISH_ROLE || 'speaker').trim();
  // Treat moderator as publisher too
  if (['host','speaker','owner','moderator'].includes((dbRole || '').toLowerCase())) return publishRole;
  return 'listener';
}

function normalizeBearer(token) {
  if (!token) return '';
  const t = token.trim();
  if (t.toLowerCase().startsWith('bearer ')) return t.slice(7).trim();
  return t;
}

// ----------- DEBUG under /hms/* -----------
router.get('/debug/ping', (_req, res) => {
  res.json({ ok: true, msg: 'hms pong' });
});

router.get('/debug/env', (_req, res) => {
  res.json({
    ok: true,
    env: {
      has_HMS_ACCESS_KEY: !!(process.env.HMS_ACCESS_KEY || process.env.HMS_APP_ID),
      has_HMS_SECRET: !!(process.env.HMS_SECRET || process.env.HMS_APP_SECRET),
      has_HMS_MANAGEMENT_TOKEN: !!process.env.HMS_MANAGEMENT_TOKEN,
      has_HMS_ROOM_TEMPLATE_ID: !!process.env.HMS_ROOM_TEMPLATE_ID,
    }
  });
});

/**
 * POST /hms/token
 * body: { room_id: string, user_id: string, name?: string, role?: "host"|"speaker"|"listener" }
 * env: HMS_ACCESS_KEY, HMS_SECRET
 */
router.post("/token", async (req, res) => {
  try {
    const { room_id, user_id, name } = req.body || {};
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
    let dbRole = 'listener';
    if (supabase) {
      try {
        const [{ data: r }, { data: rp }] = await Promise.all([
          supabase.from('rooms').select('hms_room_id').eq('id', room_id).maybeSingle(),
          supabase.from('room_participants').select('role').eq('room_id', room_id).eq('user_id', user_id).maybeSingle(),
        ]);
        hms_room_id = r?.hms_room_id || null;
        dbRole = (rp?.role || 'listener');
      } catch {}
    }

    // Auto-create mapping if missing (management API)
    if (!hms_room_id && supabase) {
      const rawToken = process.env.HMS_MANAGEMENT_TOKEN || '';
      const mgmtToken = normalizeBearer(rawToken);
      const template = process.env.HMS_ROOM_TEMPLATE_ID || '';
      if (mgmtToken && template) {
        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mgmtToken}`,
        };
        let resp = await fetch('https://api.100ms.live/v2/rooms', {
          method: 'POST',
          headers,
          body: JSON.stringify({ name: room_id, template_id: template }),
        });
        if (!resp.ok) {
          const txt = await resp.text();
          console.warn('[hms/token] create room with template_id failed:', txt);
          resp = await fetch('https://api.100ms.live/v2/rooms', {
            method: 'POST',
            headers,
            body: JSON.stringify({ name: room_id, template }),
          });
        }
        if (resp.ok) {
          const js = await resp.json();
          const newId = js?.id || null;
          if (newId) {
            try { await supabase.from('rooms').update({ hms_room_id: newId }).eq('id', room_id); } catch {}
            hms_room_id = newId;
          }
        } else {
          const txt2 = await resp.text();
          console.warn('[hms/token] 100ms room create failed (both):', txt2);
        }
      } else {
        console.warn('[hms/token] mgmt token or template missing; cannot auto-create');
      }
    }

    const tokenRole = resolveTokenRole(dbRole);
    const payload = {
      access_key: accessKey,
      type: "app",
      version: 2,
      room_id: hms_room_id || room_id,
      user_id,
      role: tokenRole,
      // metadata: { name }, // optional
    };
    const token = jwt.sign(payload, secret, { algorithm: "HS256", expiresIn: "1h" });
    return res.json({ ok: true, token });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "token generation failed", details: String(e?.message || e) });
  }
});

// Debug endpoint: shows how the server will populate the token for a user/room
router.post("/debug/inspect", async (req, res) => {
  try {
    const { room_id, user_id } = req.body || {};
    if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id and user_id required" });
    const supabase = getSB(req);
    let dbRole = 'listener', hms_room_id = null;
    if (supabase) {
      const [{ data: r }, { data: rp }] = await Promise.all([
        supabase.from("rooms").select("hms_room_id").eq("id", room_id).maybeSingle(),
        supabase.from("room_participants").select("role").eq("room_id", room_id).eq("user_id", user_id).maybeSingle(),
      ]);
      hms_room_id = r?.hms_room_id || null;
      dbRole = (rp?.role || 'listener');
    }
    const tokenRole = resolveTokenRole(dbRole);
    return res.json({ ok: true, room_id, user_id, hms_room_id, dbRole, tokenRole });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "inspect failed", details: String(e?.message || e) });
  }
});

module.exports = router;
