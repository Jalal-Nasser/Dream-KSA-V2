import express from 'express';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Health check endpoint for Railway
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dreams KSA Voice Chat Backend',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', uptime: process.uptime() });
});

// Simple route map to help diagnose deploy routing issues
app.get('/routes', (_req, res) => {
  res.json({
    routes: [
      'GET /',
      'GET /health',
      'POST /create-room',
      'POST /get-token',
      'GET /room/:roomId',
      'GET /rooms',
      'GET /api/rooms',
      'POST /leave-room',
      'POST /admin/mute',
      'POST /admin/kick'
    ]
  });
});

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const HMS_MANAGEMENT_TOKEN = process.env.HMS_MANAGEMENT_TOKEN;
const HMS_APP_ID = process.env.HMS_APP_ID;
const HMS_APP_SECRET = process.env.HMS_APP_SECRET;

// Create a new room
app.post('/create-room', async (req, res) => {
  const {
    name,
    description = 'Voice chat room',
    type = 'voice',
    theme = '#4f46e5',
    bannerImage = null,
    backgroundImage = null,
  } = req.body;

  try {
    if (!name || String(name).trim().length === 0) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }

    console.log('Create-room request received', {
      name,
      description,
      theme,
      bannerImage,
      backgroundImage,
    });

    let createdRoomId = null;
    let hmsRoomId = null;

    const canUseHMS = Boolean(HMS_MANAGEMENT_TOKEN && HMS_APP_ID && HMS_APP_SECRET && process.env.HMS_ROOM_TEMPLATE_ID);

    if (canUseHMS) {
      try {
        console.log('Creating room via 100ms…');
        const roomResponse = await fetch('https://prod-in2.100ms.live/api/v2/rooms', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${HMS_MANAGEMENT_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: String(name).substring(0, 48), // HMS name limit safety
            description,
            template_id: process.env.HMS_ROOM_TEMPLATE_ID,
            region: 'in',
          }),
        });

        console.log('HMS response status:', roomResponse.status);

        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          createdRoomId = roomData.id;
          hmsRoomId = roomData.id;
        } else {
          const errorText = await roomResponse.text();
          console.warn('HMS error response (continuing with fallback):', errorText);
        }
      } catch (hmsErr) {
        console.warn('HMS request failed (continuing with fallback):', hmsErr?.message || hmsErr);
      }
    } else {
      console.log('HMS is not configured; using local fallback room ID.');
    }

    // Fallback: generate a UUID if HMS is unavailable or failed
    if (!createdRoomId) {
      createdRoomId = uuidv4();
    }

    // Store in Supabase (best-effort)
    try {
      const { data: dbRoom, error: dbError } = await supabase
        .from('rooms')
        .upsert({
          id: createdRoomId,
          name: name,
          description: description,
          type: type,
          theme: theme,
          banner_image: bannerImage,
          background_image: backgroundImage,
          hms_room_id: hmsRoomId,
          created_at: new Date().toISOString(),
          is_active: true,
        })
        .select()
        .single();

      if (dbError && dbError.code !== '23505') {
        console.warn('Database error (continuing anyway):', dbError);
      } else {
        console.log('Room stored in database:', dbRoom?.id || createdRoomId);
      }
    } catch (dbCatch) {
      console.warn('Supabase insert failed (continuing anyway):', dbCatch?.message || dbCatch);
    }

    return res.json({
      id: createdRoomId,
      name,
      description,
      theme,
      bannerImage,
      backgroundImage,
      hms_room_id: hmsRoomId,
    });
  } catch (error) {
    console.error('Create room error:', error);
    return res.status(500).json({ error: error.message || 'Unknown error' });
  }
});

// Get authentication token for joining a room
app.post('/get-token', async (req, res) => {
  const { user_id, room_id, role = 'listener', user_name = 'Guest' } = req.body;

  try {
    console.log('Generating token for:', { user_id, room_id, role, user_name });

    // Check if user is banned
    const { data: banned, error: banError } = await supabase
      .from('banned_users')
      .select('*')
      .eq('user_id', user_id)
      .eq('room_id', room_id)
      .single();

    if (banError && banError.code !== 'PGRST116') {
      console.error('Ban check error:', banError);
    }

    if (banned) {
      return res.status(403).json({ error: 'You are banned from this room.' });
    }

    // Generate token using JWT (more reliable than API call)
    const now = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      access_key: HMS_APP_ID,
      room_id: room_id,
      user_id: user_id,
      role: role,
      type: 'app',
      version: 2,
      iat: now,
      nbf: now,
      exp: now + (24 * 60 * 60), // 24 hours expiry
      jti: uuidv4() // unique token ID
    };

    console.log('Generating JWT token with payload:', tokenPayload);

    try {
      const authToken = jwt.sign(tokenPayload, HMS_APP_SECRET, { algorithm: 'HS256' });
      console.log('JWT token generated successfully');

      // Log user joining room
      await supabase
        .from('room_participants')
        .upsert({
          user_id: user_id,
          room_id: room_id,
          user_name: user_name,
          role: role,
          joined_at: new Date().toISOString(),
          is_active: true
        });

      res.json({ 
        token: authToken,
        room_id: room_id,
        user_id: user_id,
        role: role
      });

    } catch (jwtError) {
      console.error('JWT token generation error:', jwtError);
      res.status(500).json({ error: 'Failed to generate authentication token' });
    }

  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get room details
app.get('/room/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    // Get room from Supabase
    const { data: room, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (error) {
      throw error;
    }

    // Get active participants
    const { data: participants } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true);

    res.json({
      ...room,
      participants: participants || []
    });

  } catch (error) {
    console.error('Get room error:', error);
    res.status(500).json({ error: error.message });
  }
});

// List rooms (latest first)
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

// Alias path for clients behind proxies where /rooms might be intercepted
app.get('/api/rooms', async (req, res) => app._router.handle({ ...req, url: '/rooms', method: 'GET' }, res));

// Leave room
app.post('/leave-room', async (req, res) => {
  const { user_id, room_id } = req.body;

  try {
    await supabase
      .from('room_participants')
      .update({ is_active: false, left_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .eq('room_id', room_id);

    res.json({ success: true });

  } catch (error) {
    console.error('Leave room error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Mute participant
app.post('/admin/mute', async (req, res) => {
  const { admin_user_id, target_user_id, room_id } = req.body;

  try {
    // Verify admin permissions
    const { data: adminParticipant } = await supabase
      .from('room_participants')
      .select('role')
      .eq('user_id', admin_user_id)
      .eq('room_id', room_id)
      .eq('is_active', true)
      .single();

    if (!adminParticipant || adminParticipant.role !== 'moderator') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Mute via 100ms API (this would need to be implemented based on your HMS setup)
    // For now, just update the database
    await supabase
      .from('room_participants')
      .update({ is_muted: true })
      .eq('user_id', target_user_id)
      .eq('room_id', room_id);

    res.json({ success: true, message: 'Participant muted' });

  } catch (error) {
    console.error('Mute error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Admin: Kick participant
app.post('/admin/kick', async (req, res) => {
  const { admin_user_id, target_user_id, room_id } = req.body;

  try {
    // Verify admin permissions
    const { data: adminParticipant } = await supabase
      .from('room_participants')
      .select('role')
      .eq('user_id', admin_user_id)
      .eq('room_id', room_id)
      .eq('is_active', true)
      .single();

    if (!adminParticipant || adminParticipant.role !== 'moderator') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Remove participant
    await supabase
      .from('room_participants')
      .update({ is_active: false, left_at: new Date().toISOString() })
      .eq('user_id', target_user_id)
      .eq('room_id', room_id);

    res.json({ success: true, message: 'Participant kicked' });

  } catch (error) {
    console.error('Kick error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Dreams KSA Backend Server listening on ${HOST}:${PORT}`);
  console.log(`📡 Health check: http://${HOST}:${PORT}/health`);
});

// Final JSON 404 to make it obvious the app handled the request
// (and to help diagnose which paths are missing in production)
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});
