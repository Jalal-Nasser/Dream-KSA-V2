// routes/rooms.js
const express = require("express");
const router = express.Router();

/**
 * Helper: safe Supabase getter
 */
function getSB(req) {
  return req.app?.locals?.supabase || null;
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
    // prefer table "room_members"; if your table name is different, change here
    const { data: members, error: mErr } = await supabase
      .from("room_members")
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

  if (!supabase) {
    console.warn("[rooms] join: Supabase not configured, returning stub ok");
    return res.json({ ok: true, data: { room_id, user_id, role: role || "listener" }, stub: true });
  }

  try {
    const payload = {
      room_id,
      user_id,
      role: role || "listener",
      joined_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("room_members").upsert(payload, { onConflict: "room_id,user_id" });
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

  if (!supabase) {
    console.warn("[rooms] role: Supabase not configured, returning stub ok");
    return res.json({ ok: true, data: { room_id, user_id, role }, stub: true });
  }

  try {
    const { error } = await supabase.from("room_members").upsert({ room_id, user_id, role }, { onConflict: "room_id,user_id" });
    if (error) throw error;
    return res.json({ ok: true, data: { room_id, user_id, role } });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "role update failed", details: { message: String(e?.message || e) } });
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
    // Try insert into a generic table if present; otherwise ignore errors
    const payload = { room_id, user_id, raised, at: new Date().toISOString() };
    await supabase.from("hand_raises").insert(payload).throwOnError(); // if table missing, it will throw
    return res.json({ ok: true });
  } catch (_e) {
    // swallow to avoid breaking client
    return res.json({ ok: true, soft: true });
  }
}
router.post("/handraise", (req, res) => handChange(req, res, true));
router.post("/handlower", (req, res) => handChange(req, res, false));

module.exports = router;
