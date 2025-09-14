// routes/rooms.js
const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

function normalizeBearer(token) {
  if (!token) return '';
  const t = token.trim();
  if (t.toLowerCase().startsWith('bearer ')) return t.slice(7).trim();
  return t;
}

function resolveTokenRole(dbRole) {
  const publishRole = (process.env.HMS_PUBLISH_ROLE || 'speaker').trim();
  if (['host','speaker','owner'].includes((dbRole || '').toLowerCase())) return publishRole;
  return 'listener';
}

async function ensureHMSRoomForAppRoom(supabase, appRoomId) {
  // read existing
  const { data: r, error: rErr } = await supabase
    .from('rooms')
    .select('id,hms_room_id')
    .eq('id', appRoomId)
    .maybeSingle();
  if (rErr) throw rErr;
  if (r?.hms_room_id) return r.hms_room_id;

  const rawToken = process.env.HMS_MANAGEMENT_TOKEN || '';
  const mgmtToken = normalizeBearer(rawToken);
  const template = process.env.HMS_ROOM_TEMPLATE_ID || '';
  if (!mgmtToken || !template) {
    console.warn('[rooms] ensureHMSRoom: mgmt token or template missing');
    return null;
  }

  // Try with template_id first
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${mgmtToken}`,
  };
  const bodyId = JSON.stringify({ name: appRoomId, template_id: template });
  let resp = await fetch('https://api.100ms.live/v2/rooms', { method: 'POST', headers, body: bodyId });
  if (!resp.ok) {
    const txt = await resp.text();
    console.warn('[rooms] create room with template_id failed:', txt);
    // Fallback: assume env holds a template NAME and try "template"
    const bodyName = JSON.stringify({ name: appRoomId, template });
    resp = await fetch('https://api.100ms.live/v2/rooms', { method: 'POST', headers, body: bodyName });
  }
  if (!resp.ok) {
    const txt2 = await resp.text();
    console.error('[rooms] 100ms room create failed (both attempts):', txt2);
    return null;
  }
  const js = await resp.json();
  const hms_room_id = js?.id || null;
  if (hms_room_id) {
    await supabase.from('rooms').update({ hms_room_id }).eq('id', appRoomId);
    console.log('[rooms] mapped app room', appRoomId, '-> HMS room', hms_room_id);
  }
  return hms_room_id;
}

/**
 * Helper: safe Supabase getter
 */
function getSB(req) {
  return req.app?.locals?.supabase || null;
}

const PUBLISHER_ROLES = ['host','speaker','moderator','owner'];

async function hasActivePublisher(supabase, roomId) {
  // consider someone "active" if role is host/speaker and not left
  // fall back to "no left_at set" or recent join within 4 hours
  const { data, error } = await supabase
    .from('room_participants')
    .select('role,joined_at,left_at')
    .eq('room_id', roomId);
  if (error) throw error;
  const fourHoursAgo = Date.now() - 4 * 60 * 60 * 1000;
  return (data || []).some(r => 
    (PUBLISHER_ROLES.includes(String(r.role || '').toLowerCase())) &&
    (!r.left_at) &&
    (new Date(r.joined_at).getTime() > fourHoursAgo)
  );
}

/**
 * Helper: get authenticated user from Supabase JWT in Authorization header
 */
async function getAuthUser(req) {
  const supabase = getSB(req);
  if (!supabase) return null;
  const hdr = String(req.headers?.authorization || '');
  const m = hdr.match(/^Bearer\s+(.+)$/i);
  if (!m) return null;
  const token = m[1];
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) return null;
    return data?.user || null;
  } catch {
    return null;
  }
}

/**
 * GET /rooms/:roomId/participants
 * Returns role & basic profile display. If Supabase missing, returns empty list (non-fatal).
 */
router.get("/:roomId/participants", async (req, res) => {
  const supabase = getSB(req);
  const { roomId } = req.params;

  if (!supabase) {
    console.warn("[rooms] participants: Supabase not configured, returning empty list");
    return res.json({ ok: true, data: [] });
  }

  try {
    // table name aligned with app usage
    const { data: members, error: mErr } = await supabase
      .from("room_participants")
      .select("user_id, role, joined_at")
      .eq("room_id", roomId);

    if (mErr) throw mErr;

    const ids = [...new Set((members || []).map(m => m.user_id))];
    let profilesMap = {};
    if (ids.length) {
      const { data: profiles, error: pErr } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url, email")
        .in("id", ids);
      if (pErr) throw pErr;
      profilesMap = Object.fromEntries(
        (profiles || []).map(p => [
          p.id,
          {
            id: p.id,
            username: p.username ?? null,
            display_name: p.display_name ?? null,
            avatar_url: p.avatar_url ?? null,
            email: p.email ?? null,
            display: p.display_name || p.username || null,
          },
        ])
      );
    }

    const out = (members || []).map(m => ({
      user_id: m.user_id,
      role: m.role,
      joined_at: m.joined_at,
      profile: profilesMap[m.user_id] || { id: m.user_id, display: null },
    }));

    return res.json({ ok: true, data: out });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "participants fetch failed", details: { message: String(e?.message || e) } });
  }
});

/**
 * POST /rooms/join
 * body: { room_id, user_id, role }
 * Upserts into room_members. If Supabase missing, returns ok:true (stub) to not break the app.
 */
router.post("/join", async (req, res) => {
  const supabase = getSB(req);
  const { room_id, user_id, role } = req.body || {};
  if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id, user_id required" });

  // Validate identity if Authorization header present
  try {
    const au = await getAuthUser(req);
    if (au && au.id !== user_id) {
      return res.status(401).json({ ok: false, message: "user_id mismatch" });
    }
  } catch {}

  if (!supabase) {
    console.warn("[rooms] join: Supabase not configured, returning stub ok");
    return res.json({ ok: true, data: { room_id, user_id, role: role || "listener" }, stub: true });
  }

  try {
    // 1) ensure HMS room exists (create+store if missing)
    await ensureHMSRoomForAppRoom(supabase, room_id);

    // 2) decide final role (do NOT trust client role):
    //    - keep existing publisher role if user already has one and hasn't left
    //    - else if no active publisher in room -> promote to 'speaker' (matches template)
    //    - else listener
    let finalRole = 'listener';
    const { data: meRow } = await supabase
      .from('room_participants')
      .select('role,left_at')
      .eq('room_id', room_id)
      .eq('user_id', user_id)
      .maybeSingle();
    if (meRow && PUBLISHER_ROLES.includes(String(meRow.role || '').toLowerCase()) && !meRow.left_at) {
      finalRole = meRow.role;
    } else {
      const someonePublishes = await hasActivePublisher(supabase, room_id);
      finalRole = someonePublishes ? 'listener' : 'speaker';
    }

    const payload = {
      room_id,
      user_id,
      role: finalRole,
      joined_at: new Date().toISOString(),
      left_at: null,
    };
    const { error } = await supabase.from("room_participants").upsert(payload, { onConflict: "room_id,user_id" });
    if (error) throw error;

    // 3) set rooms.host_id if empty
    try {
      await supabase.from("rooms").update({ host_id: user_id }).eq("id", room_id).is("host_id", null);
    } catch (_) {}

    return res.json({ ok: true, data: { room_id, user_id, role: payload.role } });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "join failed", details: { message: String(e?.message || e) } });
  }
});

// ensure we mark left_at to keep host assignment logic sane
router.post("/leave", async (req, res) => {
  const supabase = getSB(req);
  const { room_id, user_id } = req.body || {};
  if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id, user_id required" });
  if (!supabase) return res.json({ ok: true, stub: true });
  try {
    const { error } = await supabase
      .from("room_participants")
      .update({ left_at: new Date().toISOString() })
      .eq("room_id", room_id)
      .eq("user_id", user_id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ ok: false, message: "leave failed", details: String(e?.message || e) });
  }
});

// Debug: ensure HMS room mapping exists for a given app room
router.post('/debug/ensure-hms', async (req, res) => {
  try {
    const supabase = getSB(req);
    const { room_id } = req.body || {};
    if (!room_id) return res.status(400).json({ ok:false, message:'room_id required' });
    if (!supabase) return res.status(500).json({ ok:false, message:'Supabase not configured' });
    const hmsId = await ensureHMSRoomForAppRoom(supabase, room_id);
    return res.json({ ok:true, room_id, hms_room_id:hmsId || null });
  } catch (e) {
    return res.status(500).json({ ok:false, message:'ensure-hms failed', details:String(e?.message || e) });
  }
});

/**
 * POST /rooms/role
 * body: { room_id, user_id, enable: boolean }  => speaker when true, listener when false
 */
router.post("/role", async (req, res) => {
  const supabase = getSB(req);
  const { room_id, user_id, enable } = req.body || {};
  if (!room_id || !user_id || typeof enable !== "boolean") {
    return res.status(400).json({ ok: false, message: "room_id, user_id, enable required" });
  }

  const role = enable ? "speaker" : "listener";

  // Validate identity if Authorization header present
  try {
    const au = await getAuthUser(req);
    if (au && au.id !== user_id) {
      return res.status(401).json({ ok: false, message: "user_id mismatch" });
    }
  } catch {}

  if (!supabase) {
    console.warn("[rooms] role: Supabase not configured, returning stub ok");
    return res.json({ ok: true, data: { room_id, user_id, role }, stub: true });
  }

  try {
    const { error } = await supabase.from("room_participants").upsert({ room_id, user_id, role }, { onConflict: "room_id,user_id" });
    if (error) throw error;
    return res.json({ ok: true, data: { room_id, user_id, role } });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "role update failed", details: { message: String(e?.message || e) } });
  }
});

/**
 * POST /rooms/leave
 * body: { room_id, user_id }
 */
router.post("/leave", async (req, res) => {
  const supabase = getSB(req);
  const { room_id, user_id } = req.body || {};
  if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id, user_id required" });

  // Validate identity if Authorization header present
  try {
    const au = await getAuthUser(req);
    if (au && au.id !== user_id) {
      return res.status(401).json({ ok: false, message: "user_id mismatch" });
    }
  } catch {}

  if (!supabase) {
    console.warn("[rooms] leave: Supabase not configured, returning stub ok");
    return res.json({ ok: true, stub: true });
  }

  try {
    const { error } = await supabase
      .from("room_participants")
      .delete()
      .eq("room_id", room_id)
      .eq("user_id", user_id);
    if (error) throw error;
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "leave failed", details: { message: String(e?.message || e) } });
  }
});

/**
 * POST /rooms/handraise
 * POST /rooms/handlower
 * If the DB/table doesn't exist, still return ok:true to avoid breaking the client.
 */
async function handChange(req, res, raised) {
  const supabase = getSB(req);
  const { room_id, user_id } = req.body || {};
  if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id, user_id required" });

  if (!supabase) {
    console.warn("[rooms] handChange: Supabase not configured, returning stub ok");
    return res.json({ ok: true, stub: true });
  }

  try {
    // Persist to existing mic_requests table
    const payload = {
      room_id,
      user_id,
      state: raised ? 'raised' : 'lowered',
      at: new Date().toISOString(),
    };
    const { error } = await supabase.from('mic_requests').insert(payload);
    if (error) throw error;
    return res.json({ ok: true, data: { room_id, user_id, state: payload.state } });
  } catch (e) {
    console.warn('[rooms] handChange insert failed:', String(e?.message || e));
    // Soft-ok so the UI isn't blocked if the auxiliary table isn't ready
    return res.json({ ok: true, soft: true });
  }
}
router.post("/handraise", (req, res) => handChange(req, res, true));
router.post("/handlower", (req, res) => handChange(req, res, false));

// ---- DEBUG: what token role + room will be used
router.post('/debug/hms-inspect', async (req, res) => {
  try {
    const supabase = getSB(req);
    const { room_id, user_id } = req.body || {};
    if (!room_id || !user_id) return res.status(400).json({ ok:false, message:'room_id and user_id required' });
    let hms_room_id = null, dbRole = 'listener';
    if (supabase) {
      const [{ data: r }, { data: rp }] = await Promise.all([
        supabase.from('rooms').select('hms_room_id').eq('id', room_id).maybeSingle(),
        supabase.from('room_participants').select('role').eq('room_id', room_id).eq('user_id', user_id).maybeSingle(),
      ]);
      hms_room_id = r?.hms_room_id || null;
      dbRole = rp?.role || 'listener';
    }
    const tokenRole = resolveTokenRole(dbRole);
    res.json({ ok:true, room_id, user_id, hms_room_id, dbRole, tokenRole, publishRoleEnv: process.env.HMS_PUBLISH_ROLE || 'speaker' });
  } catch (e) {
    res.status(500).json({ ok:false, message:'inspect failed', details:String(e?.message || e) });
  }
});

// ---- DEBUG: list roles available in your 100ms template (so we pick a valid publish role)
router.get('/debug/template-roles', async (_req, res) => {
  try {
    const raw = process.env.HMS_MANAGEMENT_TOKEN || '';
    const token = normalizeBearer(raw);
    const template = process.env.HMS_ROOM_TEMPLATE_ID || '';
    if (!token || !template) return res.status(400).json({ ok:false, message:'missing HMS_MANAGEMENT_TOKEN or HMS_ROOM_TEMPLATE_ID' });
    const headers = { 'Authorization': `Bearer ${token}` };
    // Try /templates/:id
    let resp = await fetch(`https://api.100ms.live/v2/templates/${template}`, { headers });
    if (!resp.ok) {
      // Fallback: search by name
      const list = await (await fetch('https://api.100ms.live/v2/templates', { headers })).json();
      const found = (list?.data || []).find((t) => t?.id === template || t?.name === template);
      if (!found) return res.status(404).json({ ok:false, message:'template not found', got:(list?.data || []).map(t => ({id:t.id,name:t.name})) });
      return res.json({ ok:true, roles:Object.keys(found?.roles || {}), template:{ id:found.id, name:found.name } });
    }
    const tpl = await resp.json();
    res.json({ ok:true, roles:Object.keys(tpl?.roles || {}), template:{ id:tpl?.id, name:tpl?.name } });
  } catch (e) {
    res.status(500).json({ ok:false, message:'template roles fetch failed', details:String(e?.message || e) });
  }
});

module.exports = router;
