// backend/server.js — single-file backend for Plesk/Passenger
// - /health (always up)
// - /hms/token with HS256 via Node crypto (no jsonwebtoken)
// - /rooms/handraise + /rooms/handlower (Supabase admin if available)
// - Safe optional mount of ./routes/rooms

const express = require("express");
const crypto = require("crypto");

const app = express();

// ---------- middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ---------- health ----------
app.get("/health", (req, res) => res.json({ ok: true, ts: new Date().toISOString() }));

// ---------- Supabase admin (optional, won’t crash if missing) ----------
let createClient;
try {
  ({ createClient } = require("@supabase/supabase-js"));
  console.log("[boot] supabase client available");
} catch (e) {
  console.warn("[boot] supabase client NOT installed; hand endpoints will return 500 if called");
}
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabaseAdmin =
  createClient && SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
    : null;

// ---------- tiny JWT (HS256) helpers (no external deps) ----------
const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

function signHS256(payload, secret) {
  const header = { alg: "HS256", typ: "JWT" };
  const encHeader = b64url(JSON.stringify(header));
  const encPayload = b64url(JSON.stringify(payload));
  const data = `${encHeader}.${encPayload}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64");
  const encSig = sig.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return `${data}.${encSig}`;
}

// ---------- HMS token ----------
function buildHMSToken({ room_id, user_id, role }) {
  const accessKey = process.env.HMS_ACCESS_KEY;
  const secret = process.env.HMS_SECRET;
  if (!accessKey || !secret) return { error: "HMS server keys missing" };
  const nowSec = Math.floor(Date.now() / 1000);
  const payload = {
    access_key: accessKey,
    type: "app",
    version: 2,
    room_id,
    user_id,
    role: role || "listener",
    iat: nowSec,
    exp: nowSec + 3600,
  };
  return { token: signHS256(payload, secret) };
}

const hmsTokenHandler = (req, res) => {
  try {
    const { room_id, user_id, role } = req.body || {};
    if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id and user_id required" });
    const { token, error } = buildHMSToken({ room_id, user_id, role });
    if (error) return res.status(500).json({ ok: false, message: error });
    return res.json({ ok: true, token });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "token generation failed", details: String(e?.message || e) });
  }
};

// mount at both for proxy setups
app.post("/hms/token", hmsTokenHandler);
app.post("/api/hms/token", hmsTokenHandler);

// ---------- Hand raise / lower ----------
app.post("/rooms/handraise", async (req, res) => {
  try {
    const { room_id, user_id } = req.body || {};
    if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id and user_id required" });
    if (!supabaseAdmin) return res.status(500).json({ ok: false, message: "Supabase admin not configured" });

    const { error } = await supabaseAdmin
      .from("hand_raises")
      .upsert({ room_id, user_id, raised_at: new Date().toISOString() }, { onConflict: "room_id,user_id" });
    if (error) return res.status(500).json({ ok: false, message: "hand raise failed", details: error.message });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "hand raise failed", details: String(e?.message || e) });
  }
});

app.post("/rooms/handlower", async (req, res) => {
  try {
    const { room_id, user_id } = req.body || {};
    if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id and user_id required" });
    if (!supabaseAdmin) return res.status(500).json({ ok: false, message: "Supabase admin not configured" });

    const { error } = await supabaseAdmin.from("hand_raises").delete().eq("room_id", room_id).eq("user_id", user_id);
    if (error) return res.status(500).json({ ok: false, message: "hand lower failed", details: error.message });
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "hand lower failed", details: String(e?.message || e) });
  }
});

// ---------- Optional: mount existing rooms router (won’t crash if missing) ----------
try {
  const roomsRouter = require("./routes/rooms");
  app.use("/rooms", roomsRouter);
  app.use("/api/rooms", roomsRouter);
  console.log("[boot] rooms router mounted");
} catch (e) {
  console.warn("[boot] rooms router not found/failed:", e?.message || e);
}

// ---------- export & standalone ----------
module.exports = app;
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("[boot] server listening on", port));
}
