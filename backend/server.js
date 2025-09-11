require('dotenv').config();
const express = require('express');
const path = require('path');

// --- PATCH: Mount rooms routes at /rooms/* and /api/rooms/* on the actual app ---
const bodyParser = require("body-parser");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Reuse the same Express app instance Plesk runs
const app =
  module.exports.app ||
  global.app ||
  (function () {
    const a = express();
    a.use(bodyParser.json());
    a.use(
      cors({
        origin: true,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
      })
    );
    module.exports.app = a;
    global.app = a;
    return a;
  })();

if (!global.supabaseService) {
  global.supabaseService = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
const sb = global.supabaseService;

// Health route (idempotent)
if (!app._healthMounted) {
  app.get("/health", (_req, res) => res.status(200).json({ ok: true, ts: new Date().toISOString() }));
  app._healthMounted = true;
}

// Build a router that we can mount at multiple prefixes
function buildRoomsRouter() {
  const r = express.Router();

  async function upsertParticipant(room_id, user_id, role) {
    const ins = await sb.from("room_participants").insert({
      room_id,
      user_id,
      role,
      joined_at: new Date().toISOString(),
    });
    if (ins.error) {
      const upd = await sb
        .from("room_participants")
        .update({ role })
        .eq("room_id", room_id)
        .eq("user_id", user_id);
      if (upd.error) throw upd.error;
    }
  }

  r.post("/join", async (req, res) => {
    try {
      const { room_id, user_id, role } = req.body || {};
      if (!room_id || !user_id || !role)
        return res.status(400).json({ ok: false, message: "room_id, user_id, role required" });
      await upsertParticipant(room_id, user_id, role);
      res.json({ ok: true, data: { room_id, user_id, role } });
    } catch (e) {
      res.status(500).json({ ok: false, message: "join failed", details: e });
    }
  });

  r.post("/role", async (req, res) => {
    try {
      const { room_id, user_id, enable } = req.body || {};
      if (!room_id || !user_id || typeof enable !== "boolean")
        return res.status(400).json({ ok: false, message: "room_id, user_id, enable required" });
      const role = enable ? "speaker" : "listener";
      const { error } = await sb
        .from("room_participants")
        .update({ role })
        .eq("room_id", room_id)
        .eq("user_id", user_id);
      if (error) throw error;
      res.json({ ok: true, data: { room_id, user_id, role } });
    } catch (e) {
      res.status(500).json({ ok: false, message: "role update failed", details: e });
    }
  });

  // Return 200 with ok:true even if room has no members; never 404 (route exists)
  r.get("/:id/participants", async (req, res) => {
    try {
      const room_id = req.params.id;
      const { data: members, error: memErr } = await sb
        .from("room_participants")
        .select("user_id, role, joined_at")
        .eq("room_id", room_id);
      if (memErr) return res.status(500).json({ ok: false, message: "participants fetch failed", details: memErr });

      const userIds = (members || []).map((m) => m.user_id);
      let profiles = [];
      if (userIds.length) {
        const { data: profs, error: profErr } = await sb
          .from("profiles")
          .select("id, username, display_name, nickname, avatar_url, email")
          .in("id", userIds);
        if (profErr) return res.status(500).json({ ok: false, message: "profiles fetch failed", details: profErr });
        profiles = profs || [];
      }

      const result = (members || []).map((m) => ({
        ...m,
        profile: profiles.find((p) => p.id === m.user_id) || null,
      }));
      res.json({ ok: true, data: result });
    } catch (e) {
      res.status(500).json({ ok: false, message: "unexpected error", details: e });
    }
  });

  return r;
}

// Mount at BOTH /rooms/* and /api/rooms/* to cover proxy setups
if (!app._roomsMounted) {
  const router = buildRoomsRouter();
  app.use("/rooms", router);
  app.use("/api/rooms", router);
  app._roomsMounted = true;
  console.log("[server] Rooms routes mounted at: /rooms/* and /api/rooms/*");
}

// Optional: landing route that lists what's mounted (quick 200 check)
if (!app._indexMounted) {
  app.get("/", (_req, res) => {
    res.json({
      ok: true,
      routes: [
        "GET  /health",
        "GET  /rooms/:id/participants",
        "POST /rooms/join",
        "POST /rooms/role",
        "GET  /api/rooms/:id/participants",
        "POST /api/rooms/join",
        "POST /api/rooms/role",
      ],
    });
  });
  app._indexMounted = true;
}

module.exports = app;
// --- END PATCH ---

// Try to load PayTabs router, but don't fail if it can't load
let paytabsRouter;
try {
  paytabsRouter = require('./routes/paytabs');
  console.log('✅ PayTabs router loaded');
} catch (error) {
  console.warn('❌ PayTabs router failed to load:', error.message);
  paytabsRouter = null;
}

// Try to load STC Pay router, but don't fail if it can't load
let stcpayRouter;
try {
  stcpayRouter = require('./routes/stcpay');
  console.log('✅ STC Pay router loaded');
} catch (error) {
  console.warn('❌ STC Pay router failed to load:', error.message);
  stcpayRouter = null;
}


// Try to require other dependencies with error handling
let fetch, supabase, _cors_noop, jwt, uuidv4, parsePhoneNumberFromString, twilioClient;

try {
  fetch = require('node-fetch');
  console.log('✅ node-fetch loaded');
} catch (e) {
  console.warn('❌ node-fetch failed:', e.message);
}

try {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  console.log('✅ Supabase loaded');
} catch (e) {
  console.warn('❌ Supabase failed:', e.message);
}

try {
  _cors_noop = require('cors');
  console.log('✅ CORS loaded');
} catch (e) {
  console.warn('❌ CORS failed:', e.message);
}

try {
  jwt = require('jsonwebtoken');
  console.log('✅ JWT loaded');
} catch (e) {
  console.warn('❌ JWT failed:', e.message);
}

try {
  const { v4 } = require('uuid');
  uuidv4 = v4;
  console.log('✅ UUID loaded');
} catch (e) {
  console.warn('❌ UUID failed:', e.message);
}

try {
  const { parsePhoneNumberFromString: parsePhone } = require('libphonenumber-js');
  parsePhoneNumberFromString = parsePhone;
  console.log('✅ libphonenumber-js loaded');
} catch (e) {
  console.warn('❌ libphonenumber-js failed:', e.message);
}

try {
  const Twilio = require('twilio');
  twilioClient = Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  console.log('✅ Twilio loaded');
} catch (e) {
  console.warn('❌ Twilio failed:', e.message);
}

app.use(express.json());

// --- serve static legal pages (Privacy / Terms) ---
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1h',
}));

// Friendly shortcuts
app.get('/privacy', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'privacy.html'))
);
app.get('/terms', (_req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'terms.html'))
);

// PayTabs payment routes (only if router loaded successfully)
if (paytabsRouter) {
  app.use('/api/payments/paytabs', paytabsRouter);
  console.log('✅ PayTabs routes enabled');
} else {
  console.log('⚠️ PayTabs routes disabled (missing environment variables)');
}

// STC Pay payment routes (only if router loaded successfully)
if (stcpayRouter) {
  app.use('/api/payments/stcpay', stcpayRouter);
  console.log('✅ STC Pay routes enabled');
} else {
  console.log('⚠️ STC Pay routes disabled (missing environment variables)');
}


// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dreams KSA Voice Chat Backend - Full Version',
    timestamp: new Date().toISOString(),
    dependencies: {
      fetch: !!fetch,
      supabase: !!supabase,
      cors: true,
      jwt: !!jwt,
      uuid: !!uuidv4,
      phone: !!parsePhoneNumberFromString,
      twilio: !!twilioClient
    }
  });
});

app.get('/routes', (_req, res) => {
  res.json({
    routes: [
      'GET /',
      'GET /health',
      'GET /routes',
      'GET /privacy',
      'GET /terms',
      'POST /auth/phone/start',
      'POST /auth/phone/verify',
      'GET /auth/phone/diag',
      'POST /create-room',
      'POST /get-token',
      'GET /room/:roomId',
      'GET /rooms',
      'POST /leave-room',
      'POST /admin/mute',
      'POST /admin/kick',
      'GET /api/rooms',
      'POST /api/create-room',
      'POST /api/get-token',
      'GET /api/room/:roomId',
      'POST /api/leave-room',
      'POST /api/admin/mute',
      'POST /api/admin/kick',
      'POST /api/payments/paytabs/create',
      'POST /api/payments/paytabs/verify',
      'GET /api/payments/paytabs/verify-callback',
      'POST /api/payments/stcpay/create',
      'POST /api/payments/stcpay/webhook',
      'GET /api/payments/stcpay/return'
    ]
  });
});

// Phone authentication endpoints (if Twilio is available)
if (twilioClient) {
  app.post('/auth/phone/start', async (req, res) => {
    try {
      if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
        return res.status(500).json({ ok: false, error: 'twilio_not_configured' });
      }
      
      const raw = String(req.body?.phone || '');
      const country = (req.body?.country || 'SA').toUpperCase();
      
      if (!parsePhoneNumberFromString) {
        return res.status(500).json({ ok: false, error: 'phone_parser_not_available' });
      }
      
      const to = parsePhoneNumberFromString(raw, country);
      if (!to || !to.isValid()) {
        return res.status(400).json({ ok: false, error: 'invalid_phone_format' });
      }

      const verification = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verifications.create({ to: to.number, channel: 'sms', locale: 'ar' });

      return res.json({ ok: true, sid: verification.sid });
    } catch (err) {
      console.warn('[phone/start] error', err);
      return res.status(400).json({ ok: false, error: 'twilio_error', message: err.message });
    }
  });

  app.post('/auth/phone/verify', async (req, res) => {
    try {
      if (!process.env.TWILIO_VERIFY_SERVICE_SID) {
        return res.status(500).json({ ok: false, error: 'twilio_not_configured' });
      }
      
      const raw = String(req.body?.phone || '');
      const code = String(req.body?.code || '');
      const country = (req.body?.country || 'SA').toUpperCase();
      
      if (!parsePhoneNumberFromString) {
        return res.status(500).json({ ok: false, error: 'phone_parser_not_available' });
      }
      
      const to = parsePhoneNumberFromString(raw, country);
      if (!to || !to.isValid() || !code) {
        return res.status(400).json({ ok: false, error: 'invalid_params' });
      }

      const check = await twilioClient.verify.v2
        .services(process.env.TWILIO_VERIFY_SERVICE_SID)
        .verificationChecks.create({ to: to.number, code });

      if (check.status === 'approved') {
        return res.json({ ok: true });
      }
      return res.status(401).json({ ok: false, error: 'invalid_code' });
    } catch (err) {
      console.warn('[phone/verify] error', err);
      return res.status(400).json({ ok: false, error: 'twilio_error', message: err.message });
    }
  });
}

app.get('/auth/phone/diag', (_req, res) => {
  res.json({
    ok: true,
    verifyService: Boolean(process.env.TWILIO_VERIFY_SERVICE_SID),
    isTrial: String(process.env.TWILIO_IS_TRIAL || 'false'),
    twilioAvailable: !!twilioClient,
    phoneParserAvailable: !!parsePhoneNumberFromString
  });
});

// Room management (if Supabase is available)
if (supabase) {
  app.post('/create-room', async (req, res) => {
    try {
      const { name, description = 'Voice chat room', type = 'voice', theme = '#4f46e5' } = req.body;

      if (!name || String(name).trim().length === 0) {
        return res.status(400).json({ error: 'Missing required field: name' });
      }

      let createdRoomId = uuidv4 ? uuidv4() : `room_${Date.now()}`;

      // Store in Supabase
      try {
        const { data: dbRoom, error: dbError } = await supabase
          .from('rooms')
          .upsert({
            id: createdRoomId,
            name: name,
            description: description,
            type: type,
            theme: theme,
            created_at: new Date().toISOString(),
            is_active: true,
          })
          .select()
          .single();

        if (dbError && dbError.code !== '23505') {
          console.warn('Database error:', dbError);
        } else {
          console.log('Room stored in database:', dbRoom?.id || createdRoomId);
        }
      } catch (dbCatch) {
        console.warn('Supabase insert failed:', dbCatch?.message || dbCatch);
      }

      return res.json({
        id: createdRoomId,
        name,
        description,
        theme
      });
    } catch (error) {
      console.error('Create room error:', error);
      return res.status(500).json({ error: error.message || 'Unknown error' });
    }
  });

  app.get('/rooms', async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      res.json({ rooms: data ?? [] });
    } catch (err) {
      console.error('List rooms error:', err);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  });

  app.get('/api/rooms', async (_req, res) => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      res.json({ rooms: data ?? [] });
    } catch (err) {
      console.error('List rooms error:', err);
      res.status(500).json({ error: 'Failed to fetch rooms' });
    }
  });
}

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Dreams KSA Backend Server listening on ${HOST}:${PORT}`);
  console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
});

// Final JSON 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});
