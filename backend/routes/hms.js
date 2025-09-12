// routes/hms.js
const express = require("express");
const jwt = require("jsonwebtoken");

const router = express.Router();

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
    const accessKey = process.env.HMS_ACCESS_KEY;
    const secret = process.env.HMS_SECRET;
    if (!accessKey || !secret) {
      return res.status(500).json({ ok: false, message: "HMS server keys missing" });
    }

    const payload = {
      access_key: accessKey,
      type: "app",
      version: 2,
      room_id,
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
