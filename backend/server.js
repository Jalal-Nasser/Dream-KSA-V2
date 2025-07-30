import express from 'express';
import fetch from 'node-fetch';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const HMS_MANAGEMENT_TOKEN = process.env.HMS_MANAGEMENT_TOKEN;
const ROOM_TEMPLATE_ID = process.env.HMS_ROOM_TEMPLATE_ID; // updated to match your .env

app.post('/get-token', async (req, res) => {
  const { user_id, room_id, role } = req.body;

  try {
    // Check if user is banned
    const { data: banned, error: banError } = await supabase
      .from('banned_users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (banError && banError.code !== 'PGRST116') {
      throw banError;
    }

    if (banned) {
      return res.status(403).json({ error: 'You are banned from this room.' });
    }

    // Generate token using 100ms API
    const tokenResponse = await fetch(`https://prod-in.100ms.live/api/v2/room/${ROOM_TEMPLATE_ID}/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HMS_MANAGEMENT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id,
        role,
        room_id,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error(tokenData.error || 'Failed to generate token');
    }

    res.json({ token: tokenData.token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
