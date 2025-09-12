// /httpdocs/backend/routes/rooms.js
const express = require("express");
const { createClient } = require("@supabase/supabase-js");

const router = express.Router();

// ---- Supabase admin client ----
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_KEY;

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} else {
  console.warn("[rooms] Supabase admin not configured.");
}

const needAdmin = (res) => {
  if (!supabase) {
    res.status(500).json({ ok: false, message: "Supabase admin not configured" });
    return true;
  }
  return false;
};

const nameFromProfile = (p = {}) =>
  p.display_name || p.username || (p.email ? p.email.split("@")[0] : "");

// Index
router.get("/", (_req, res) => {
  res.json({
    ok: true,
    endpoints: [
      "GET    /:roomId/participants",
      "POST   /join   { room_id, user_id, role }",
      "POST   /leave  { room_id, user_id }",
      "POST   /role   { room_id, user_id, enable }",
      "POST   /handraise { room_id, user_id }",
      "POST   /handlower { room_id, user_id }",
    ],
  });
});

// Participants (uses view room_participants if present, else joins room_members -> profiles)
router.get("/:roomId/participants", async (req, res) => {
  if (needAdmin(res)) return;
  const roomId = req.params.roomId;
  try {
    let { data, error } = await supabase
      .from("room_participants")
      .select(
        "user_id, role, joined_at, profile:id, profile_username:username, profile_display_name:display_name, profile_avatar_url:avatar_url, profile_email:email"
      )
      .eq("room_id", roomId)
      .order("joined_at", { ascending: true });

    if (error || !Array.isArray(data)) {
      const fb = await supabase
        .from("room_members")
        .select(
          `user_id, role, joined_at,
           profiles:profiles ( id, username, display_name, avatar_url, email )`
        )
        .eq("room_id", roomId)
        .order("joined_at", { ascending: true });
      if (fb.error) throw fb.error;
      const mapped = fb.data.map((row) => {
        const p = row.profiles || {};
        return {
          user_id: row.user_id,
          role: row.role,
          joined_at: row.joined_at,
          profile: {
            id: p.id,
            username: p.username,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            email: p.email,
            display: nameFromProfile(p),
          },
        };
      });
      return res.json({ ok: true, data: mapped });
    }

    const mapped = data.map((r) => {
      const p = {
        id: r.profile,
        username: r.profile_username,
        display_name: r.profile_display_name,
        avatar_url: r.profile_avatar_url,
        email: r.profile_email,
      };
      return {
        user_id: r.user_id,
        role: r.role,
        joined_at: r.joined_at,
        profile: { ...p, display: nameFromProfile(p) },
      };
    });
    res.json({ ok: true, data: mapped });
  } catch (e) {
    console.error("[participants] error", e);
    res.status(200).json({
      ok: false,
      message: "participants fetch failed",
      details: { message: String(e.message || e) },
    });
  }
});

// Join
router.post("/join", async (req, res) => {
  if (needAdmin(res)) return;
  const { room_id, user_id, role } = req.body || {};
  if (!room_id || !user_id)
    return res.status(400).json({ ok: false, message: "room_id, user_id, role required" });
  const safeRole = ["host", "speaker", "listener"].includes(role) ? role : "listener";
  try {
    const { error } = await supabase
      .from("room_members")
      .upsert({ room_id, user_id, role: safeRole }, { onConflict: "room_id,user_id" });
    if (error) throw error;
    res.json({ ok: true, data: { room_id, user_id, role: safeRole } });
  } catch (e) {
    console.error("[join] error", e);
    res.status(200).json({ ok: false, message: "join failed" });
  }
});

// Leave
router.post("/leave", async (req, res) => {
  if (needAdmin(res)) return;
  const { room_id, user_id } = req.body || {};
  if (!room_id || !user_id)
    return res.status(400).json({ ok: false, message: "room_id and user_id required" });
  try {
    const { error } = await supabase
      .from("room_members")
      .delete()
      .eq("room_id", room_id)
      .eq("user_id", user_id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    console.error("[leave] error", e);
    res.status(200).json({ ok: false, message: "leave failed" });
  }
});

// Promote/Demote speaker
router.post("/role", async (req, res) => {
  if (needAdmin(res)) return;
  const { room_id, user_id, enable } = req.body || {};
  if (!room_id || !user_id || typeof enable !== "boolean")
    return res.status(400).json({
      ok: false,
      message: "room_id, user_id, enable(boolean) required",
    });
  const nextRole = enable ? "speaker" : "listener";
  try {
    const { error } = await supabase
      .from("room_members")
      .update({ role: nextRole })
      .eq("room_id", room_id)
      .eq("user_id", user_id);
    if (error) throw error;
    res.json({ ok: true, data: { room_id, user_id, role: nextRole } });
  } catch (e) {
    console.error("[role] error", e);
    res.status(200).json({ ok: false, message: "role change failed" });
  }
});

// Hand raise/lower (no-op if column missing)
async function setHand(req, res, raised) {
  if (needAdmin(res)) return;
  const { room_id, user_id } = req.body || {};
  if (!room_id || !user_id)
    return res.status(400).json({ ok: false, message: "room_id and user_id required" });
  try {
    const { error } = await supabase
      .from("room_members")
      .update({ hand_raised: raised })
      .eq("room_id", room_id)
      .eq("user_id", user_id);
    if (error && /column .*hand_raised/i.test(String(error.message))) {
      console.warn("[hand] hand_raised column missing — returning ok:true (no-op)");
      return res.json({ ok: true, no_op: true });
    }
    if (error) throw error;
    res.json({ ok: true });
  } catch (e) {
    console.error("[hand] error", e);
    res.status(200).json({ ok: true, no_op: true });
  }
}
router.post("/handraise", (req, res) => setHand(req, res, true));
router.post("/handlower", (req, res) => setHand(req, res, false));

module.exports = router;
