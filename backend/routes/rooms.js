// routes/rooms.js
const express = require("express");
const router = express.Router();
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

/**
 * Helper: safe Supabase getter
 */
function getSB(req) {
  return req.app?.locals?.supabase || null;
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
    // 1) Ensure rooms.hms_room_id exists for this app room
    let hms_room_id = null;
    {
      const { data: r, error: rErr } = await supabase.from('rooms').select('id,hms_room_id').eq('id', room_id).maybeSingle();
      if (rErr) throw rErr;
      hms_room_id = r?.hms_room_id || null;
      if (!hms_room_id) {
        // Create 100ms room via Management API using template id; use app room id as name for traceability
        const mgmtToken = process.env.HMS_MANAGEMENT_TOKEN;
        const templateId = process.env.HMS_ROOM_TEMPLATE_ID;
        if (!mgmtToken || !templateId) {
          console.warn('[rooms] missing HMS_MANAGEMENT_TOKEN/HMS_ROOM_TEMPLATE_ID; tokens may still be signed but users won\'t co-locate.');
        } else {
          const resp = await fetch('https://api.100ms.live/v2/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${mgmtToken}` },
            body: JSON.stringify({ name: room_id, template_id: templateId })
          });
          if (resp.ok) {
            const js = await resp.json();
            hms_room_id = js?.id || null;
            if (hms_room_id) {
              await supabase.from('rooms').update({ hms_room_id }).eq('id', room_id);
            }
          } else {
            const txt = await resp.text();
            console.warn('[rooms] 100ms room create failed:', txt);
          }
        }
      }
    }

    const payload = {
      room_id,
      user_id,
      role: role || "listener",
      joined_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("room_participants").upsert(payload, { onConflict: "room_id,user_id" });
    if (error) throw error;
    return res.json({ ok: true, data: { room_id, user_id, role: payload.role } });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "join failed", details: { message: String(e?.message || e) } });
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
    return res.status(500).json({ ok: false, message: "hand request failed", details: { message: String(e?.message || e) } });
  }
}
router.post("/handraise", (req, res) => handChange(req, res, true));
router.post("/handlower", (req, res) => handChange(req, res, false));

module.exports = router;
