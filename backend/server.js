'use strict';

/**
 * Express app that works under Passenger (Plesk) and locally.
 * - No ESM-only deps (uses Node 18+)
 * - Uses express.json/urlencoded, no body-parser
 * - Exports app for Passenger; listens only in local dev
 */

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// ---------- helpers ----------
const log = (...a) => console.log('[boot]', ...a);
const v4rx = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && v4rx.test(s);

// ---------- env ----------
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_SERVICE_KEY, // local env may use this name
  CORS_ORIGIN,
  HMS_ACCESS_KEY,
  HMS_SECRET,
} = process.env;

// ---------- app ----------
const app = express();
app.use(cors({ origin: CORS_ORIGIN ? CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: false }));

// ---------- supabase (admin) ----------
let supabase = null;
const SB_SERVICE = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_KEY;
if (SUPABASE_URL && SB_SERVICE) {
  try {
    supabase = createClient(SUPABASE_URL, SB_SERVICE, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    log('supabase admin client initialized');
  } catch (e) {
    console.error('[boot] supabase init failed:', e?.message || e);
  }
} else {
  console.warn('[boot] supabase admin NOT configured');
}
// expose supabase to routers
app.locals.supabase = supabase;

// ---------- routes ----------
app.get('/health', (_req, res) => {
  return res.json({ ok: true, ts: new Date().toISOString() });
});

// ---- Legal pages
app.get('/privacy', (_req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});
app.get('/terms', (_req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

// ---- Favicon
app.get('/favicon.ico', (_req, res) => {
  return res.sendFile(path.join(__dirname, 'public', 'favicon.ico'));
});

// ---- Mount feature routers
try {
  const roomsRouter = require('./routes/rooms');
  const hmsRouter = require('./routes/hms');
  const debugRouter = require('./routes/debug');
  app.use('/rooms', roomsRouter);
  app.use('/hms', hmsRouter);
  app.use(debugRouter);
  console.log('[boot] mounted /debug routes');
} catch (e) {
  console.warn('[boot] routers not mounted:', e?.message || e);
}

// ----- INLINE DEBUG ROUTES (always mounted) -----
app.get('/debug/ping', (_req, res) => {
  res.json({ ok: true, msg: 'pong', mounted: true });
});

app.get('/debug/env', (_req, res) => {
  res.json({
    ok: true,
    env: {
      has_SUPABASE_URL: !!process.env.SUPABASE_URL,
      has_SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY || !!process.env.SUPABASE_SERVICE_KEY,
      has_HMS_ACCESS_KEY: !!(process.env.HMS_ACCESS_KEY || process.env.HMS_APP_ID),
      has_HMS_SECRET: !!(process.env.HMS_SECRET || process.env.HMS_APP_SECRET),
      has_HMS_MANAGEMENT_TOKEN: !!process.env.HMS_MANAGEMENT_TOKEN,
      has_HMS_ROOM_TEMPLATE_ID: !!process.env.HMS_ROOM_TEMPLATE_ID,
    },
  });
});

app.get('/debug/hms-room/:roomId', async (req, res) => {
  const roomId = req.params.roomId;
  if (!roomId) return res.status(400).json({ ok: false, message: 'roomId required' });
  if (!app.locals?.supabase) {
    return res.json({ ok: true, room_id: roomId, hms_room_id: null, note: 'no supabase admin' });
  }
  try {
    const { data, error } = await app.locals.supabase
      .from('rooms')
      .select('hms_room_id')
      .eq('id', roomId)
      .maybeSingle();
    if (error) return res.status(500).json({ ok: false, message: String(error.message || error) });
    res.json({ ok: true, room_id: roomId, hms_room_id: data?.hms_room_id || null });
  } catch (e) {
    res.status(500).json({ ok: false, message: String(e?.message || e) });
  }
});

// ---- Index
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'Dreams KSA Backend',
    endpoints: [
      'GET  /health',
      'GET  /privacy',
      'GET  /terms',
      'GET  /favicon.ico',
      'GET  /rooms/:roomId/participants',
      'POST /rooms/join',
      'POST /rooms/leave',
      'POST /rooms/role',
      'POST /rooms/handraise',
      'POST /rooms/handlower',
      'POST /hms/token',
    ],
  });
});

// ---------- export for Passenger; listen only in local ----------
module.exports = app;
if (require.main === module) {
  const port = process.env.PORT || 8080;
  app.listen(port, '0.0.0.0', () => {
    log(`server listening on http://0.0.0.0:${port}`);
  });
}
