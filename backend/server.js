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
} catch (e) {
  console.warn('[boot] routers not mounted:', e?.message || e);
}

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
