import express from 'express';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

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
    backgroundImage = null
  } = req.body;

  try {
    console.log('Creating room with HMS...', { name, description, theme, bannerImage, backgroundImage });
    
    // Create room in 100ms
    const roomResponse = await fetch('https://prod-in2.100ms.live/api/v2/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HMS_MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        description: description,
        template_id: process.env.HMS_ROOM_TEMPLATE_ID,
        region: 'in',
      }),
    });

    console.log('HMS response status:', roomResponse.status);
    
    if (!roomResponse.ok) {
      const errorText = await roomResponse.text();
      console.error('HMS error response:', errorText);
      throw new Error(`HMS API error: ${roomResponse.status} - ${errorText}`);
    }

    const roomData = await roomResponse.json();
    console.log('HMS room created:', roomData);

    // Store room in Supabase with customization data
    const { data: dbRoom, error: dbError } = await supabase
      .from('rooms')
      .insert({
        id: roomData.id,
        name: name,
        description: description,
        type: type,
        theme: theme,
        banner_image: bannerImage,
        background_image: backgroundImage,
        hms_room_id: roomData.id,
        created_at: new Date().toISOString(),
        is_active: true
      })
      .select()
      .single();

    if (dbError && dbError.code !== '23505') { // Ignore duplicate key errors
      console.error('Database error:', dbError);
      // Continue anyway as the HMS room was created successfully
    } else {
      console.log('Room stored in database:', dbRoom);
    }

    res.json({
      id: roomData.id,
      name: name,
      description: description,
      theme: theme,
      bannerImage: bannerImage,
      backgroundImage: backgroundImage,
      hms_room_id: roomData.id
    });

  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: error.message });
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

    // Generate token using 100ms API
    const tokenPayload = {
      access_key: HMS_APP_ID,
      app_secret: HMS_APP_SECRET, 
      room_id: room_id,
      user_id: user_id,
      role: role,
      type: 'app',
      version: 2,
      iat: Math.floor(Date.now() / 1000),
      nbf: Math.floor(Date.now() / 1000),
    };

    console.log('Token payload:', tokenPayload);

    const tokenResponse = await fetch('https://prod-in2.100ms.live/api/v2/app-tokens', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HMS_MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tokenPayload),
    });

    console.log('Token response status:', tokenResponse.status);

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('HMS token error:', errorText);
      throw new Error(`HMS token API error: ${tokenResponse.status} - ${errorText}`);
    }

    const tokenData = await tokenResponse.json();
    console.log('Token generated successfully');

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
      token: tokenData.token,
      room_id: room_id,
      user_id: user_id,
      role: role
    });

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
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
