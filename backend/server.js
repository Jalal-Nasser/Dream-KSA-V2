require('dotenv').config();
const express = require('express');
const path = require('path');

// Try to load PayTabs router, but don't fail if it can't load
let paytabsRouter;
try {
  paytabsRouter = require('./routes/paytabs');
  console.log('✅ PayTabs router loaded');
} catch (error) {
  console.warn('❌ PayTabs router failed to load:', error.message);
  paytabsRouter = null;
}


// Try to require other dependencies with error handling
let fetch, supabase, cors, jwt, uuidv4, parsePhoneNumberFromString, twilioClient;

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
  cors = require('cors');
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

const app = express();
app.use(express.json());

if (cors) {
  app.use(cors());
}

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


// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dreams KSA Voice Chat Backend - Full Version',
    timestamp: new Date().toISOString(),
    dependencies: {
      fetch: !!fetch,
      supabase: !!supabase,
      cors: !!cors,
      jwt: !!jwt,
      uuid: !!uuidv4,
      phone: !!parsePhoneNumberFromString,
      twilio: !!twilioClient
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
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
      'GET /api/payments/paytabs/verify-callback'
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
