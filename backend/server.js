// backend/server.js — single-file backend for Plesk/Passenger
// Node-12 safe (no optional chaining), no external deps for HMS token
// Endpoints:
//   GET  /health
//   POST /hms/token        (and /api/hms/token)
//   POST /rooms/handraise  (Supabase admin if available; otherwise 500)
//   POST /rooms/handlower  (Supabase admin if available; otherwise 500)
// Also tries to mount ./routes/rooms if present (won't crash if missing)

const express = require("express");
const crypto = require("crypto");

const app = express();

// ---------- middleware ----------
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ---------- health ----------
app.get("/health", function (_req, res) {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ---------- root endpoint for health checks ----------
app.get("/", function (_req, res) {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// ---------- Supabase admin (optional) ----------
var createClient;
try {
  // if @supabase/supabase-js is installed on the server, we'll use it
  createClient = require("@supabase/supabase-js").createClient;
  console.log("[boot] supabase client available");
} catch (e) {
  console.warn("[boot] supabase client NOT installed; hand endpoints will return 500 if called");
}
var SUPABASE_URL = process.env.SUPABASE_URL;
var SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
var supabaseAdmin =
  createClient && SUPABASE_URL && SUPABASE_SERVICE_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false } })
    : null;

// ---------- tiny JWT (HS256) helpers (no jsonwebtoken) ----------
function b64url(buf) {
  return Buffer.from(buf)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}
function signHS256(payload, secret) {
  var header = { alg: "HS256", typ: "JWT" };
  var encHeader = b64url(JSON.stringify(header));
  var encPayload = b64url(JSON.stringify(payload));
  var data = encHeader + "." + encPayload;
  var sig = crypto.createHmac("sha256", secret).update(data).digest("base64");
  var encSig = sig.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  return data + "." + encSig;
}

// ---------- HMS token ----------
function buildHMSToken(opts) {
  var accessKey = process.env.HMS_ACCESS_KEY;
  var secret = process.env.HMS_SECRET;
  if (!accessKey || !secret) return { error: "HMS server keys missing" };
  var nowSec = Math.floor(Date.now() / 1000);
  var payload = {
    access_key: accessKey,
    type: "app",
    version: 2,
    room_id: opts.room_id,
    user_id: opts.user_id,
    role: opts.role || "listener",
    iat: nowSec,
    exp: nowSec + 3600
    // metadata could go here
  };
  return { token: signHS256(payload, secret) };
}

function hmsTokenHandler(req, res) {
  try {
    var body = req.body || {};
    var room_id = body.room_id;
    var user_id = body.user_id;
    var role = body.role;
    if (!room_id || !user_id) {
      return res.status(400).json({ ok: false, message: "room_id and user_id required" });
    }
    var result = buildHMSToken({ room_id: room_id, user_id: user_id, role: role });
    if (result.error) return res.status(500).json({ ok: false, message: result.error });
    return res.json({ ok: true, token: result.token });
  } catch (e) {
    return res.status(500).json({
      ok: false,
      message: "token generation failed",
      details: String((e && e.message) || e)
    });
  }
}
app.post("/hms/token", hmsTokenHandler);
app.post("/api/hms/token", hmsTokenHandler);

// ---------- Hand raise / lower ----------
app.post("/rooms/handraise", async function (req, res) {
  try {
    var body = req.body || {};
    var room_id = body.room_id;
    var user_id = body.user_id;
    if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id and user_id required" });
    if (!supabaseAdmin) return res.status(500).json({ ok: false, message: "Supabase admin not configured" });

    var result = await supabaseAdmin
      .from("hand_raises")
      .upsert({ room_id: room_id, user_id: user_id, raised_at: new Date().toISOString() }, { onConflict: "room_id,user_id" });
    if (result && result.error) {
      return res.status(500).json({ ok: false, message: "hand raise failed", details: result.error.message });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "hand raise failed", details: String((e && e.message) || e) });
  }
});

app.post("/rooms/handlower", async function (req, res) {
  try {
    var body = req.body || {};
    var room_id = body.room_id;
    var user_id = body.user_id;
    if (!room_id || !user_id) return res.status(400).json({ ok: false, message: "room_id and user_id required" });
    if (!supabaseAdmin) return res.status(500).json({ ok: false, message: "Supabase admin not configured" });

    var result = await supabaseAdmin.from("hand_raises").delete().eq("room_id", room_id).eq("user_id", user_id);
    if (result && result.error) {
      return res.status(500).json({ ok: false, message: "hand lower failed", details: result.error.message });
    }
    return res.json({ ok: true });
  } catch (e) {
    return res.status(500).json({ ok: false, message: "hand lower failed", details: String((e && e.message) || e) });
  }
});

// ---------- export & standalone ----------
module.exports = app;
if (require.main === module) {
  var port = process.env.PORT || 3000;
  app.listen(port, function () {
    console.log("[boot] server listening on", port);
  });
}
