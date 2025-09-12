'use strict';

/**
 * Express app that works under Passenger (Plesk) and locally.
 * - No ESM-only deps (uses Node 18+)
 * - Uses express.json/urlencoded, no body-parser
 * - Exports app for Passenger; listens only in local dev
 */

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { createClient } = require('@supabase/supabase-js');

// ---------- helpers ----------
const log = (...a) => console.log('[boot]', ...a);
const v4rx = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isUuid = (s) => typeof s === 'string' && v4rx.test(s);

// ---------- env ----------
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
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
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    log('supabase admin client initialized');
  } catch (e) {
    console.error('[boot] supabase init failed:', e?.message || e);
  }
} else {
  console.warn('[boot] supabase admin NOT configured');
}

// ---------- routes ----------
app.get('/health', (_req, res) => {
  return res.json({ ok: true, ts: new Date().toISOString() });
});

// ---- Participants (merge profiles manually)
app.get('/rooms/:id/participants', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ ok: false, message: 'Supabase admin not configured' });
    }
    const roomId = req.params.id;
    if (!isUuid(roomId)) {
      return res.status(400).json({ ok: false, message: 'invalid room_id' });
    }

    const { data: rows, error } = await supabase
      .from('room_participants')
      .select('user_id, role, joined_at, hand_raised')
      .eq('room_id', roomId)
      .order('joined_at', { ascending: true });

    if (error) {
      return res.status(500).json({ ok: false, message: 'participants fetch failed', details: error });
    }
    if (!rows || rows.length === 0) {
      return res.json({ ok: true, data: [] });
    }

    const ids = [...new Set(rows.map((r) => r.user_id))];
    const { data: profiles, error: pErr } = await supabase
      .from('profiles')
      .select('id, username, display_name, avatar_url, email')
      .in('id', ids);

    if (pErr) {
      return res.status(500).json({ ok: false, message: 'profiles fetch failed', details: pErr });
    }

    const byId = new Map((profiles || []).map((p) => [p.id, p]));
    const merged = rows.map((r) => {
      const p = byId.get(r.user_id) || {};
      const display = p.display_name || p.username || (p.email ? p.email.split('@')[0] : 'عضو');
      return {
        user_id: r.user_id,
        role: r.role || 'listener',
        joined_at: r.joined_at,
        hand_raised: !!r.hand_raised,
        profile: { id: p.id, username: p.username, display_name: p.display_name, avatar_url: p.avatar_url, email: p.email, display },
      };
    });

    return res.json({ ok: true, data: merged });
  } catch (e) {
    console.error('[participants] error', e);
    return res.status(500).json({ ok: false, message: 'participants fatal', details: String(e?.message || e) });
  }
});

// ---- Join
app.post('/rooms/join', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(500).json({ ok: false, message: 'Supabase admin not configured' });
    }
    const { room_id, user_id, role } = req.body || {};
    if (!isUuid(room_id) || !isUuid(user_id)) {
      return res.status(400).json({ ok: false, message: 'room_id, user_id must be uuid' });
    }
    const payload = {
      room_id,
      user_id,
      role: role || 'listener',
      joined_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('room_participants').upsert(payload, { onConflict: 'room_id,user_id' });
    if (error) {
      return res.status(500).json({ ok: false, message: 'join failed', details: error });
    }
    return res.json({ ok: true, data: payload });
  } catch (e) {
    console.error('[join] error', e);
    return res.status(500).json({ ok: false, message: 'join fatal', details: String(e?.message || e) });
  }
});

// ---- Hand raise/lower
async function setHand(req, res, value) {
  try {
    if (!supabase) {
      return res.status(500).json({ ok: false, message: 'Supabase admin not configured' });
    }
    const { room_id, user_id } = req.body || {};
    if (!isUuid(room_id) || !isUuid(user_id)) {
      return res.status(400).json({ ok: false, message: 'room_id, user_id must be uuid' });
    }
    const { error } = await supabase
      .from('room_participants')
      .update({ hand_raised: !!value })
      .eq('room_id', room_id)
      .eq('user_id', user_id);

    if (error) {
      return res.status(500).json({ ok: false, message: 'hand update failed', details: error });
    }
    return res.json({ ok: true });
  } catch (e) {
    console.error('[hand] error', e);
    return res.status(500).json({ ok: false, message: 'hand fatal', details: String(e?.message || e) });
  }
}
app.post('/rooms/handraise', (req, res) => setHand(req, res, true));
app.post('/rooms/handlower', (req, res) => setHand(req, res, false));

// ---- HMS token
app.post('/hms/token', async (req, res) => {
  try {
    const { room_id, user_id, name, role } = req.body || {};
    if (!isUuid(room_id) || !isUuid(user_id)) {
      return res.status(400).json({ ok: false, message: 'room_id, user_id must be uuid' });
    }
    if (!HMS_ACCESS_KEY || !HMS_SECRET) {
      return res.status(500).json({ ok: false, message: 'HMS server keys missing' });
    }

    const payload = {
      access_key: HMS_ACCESS_KEY,
      type: 'app',
      version: 2,
      room_id,
      user_id,
      role: role || 'listener',
      // metadata: { name }
    };

    const token = jwt.sign(payload, HMS_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
    return res.json({ ok: true, token });
  } catch (e) {
    console.error('[hms/token] error', e);
    return res.status(500).json({ ok: false, message: 'token generation failed', details: String(e?.message || e) });
  }
});

// ---- Index
app.get('/', (_req, res) => {
  res.json({
    ok: true,
    service: 'Dreams KSA Backend',
    endpoints: [
      'GET  /health',
      'GET  /rooms/:id/participants',
      'POST /rooms/join',
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
