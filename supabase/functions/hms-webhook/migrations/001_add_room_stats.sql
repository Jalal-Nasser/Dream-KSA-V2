-- Migration: Add room statistics and trending score columns
-- This migration adds the required columns for the HMS webhook function

-- Add new columns to rooms table if they don't exist
DO $$ 
BEGIN
    -- Add is_live column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'is_live') THEN
        ALTER TABLE rooms ADD COLUMN is_live BOOLEAN DEFAULT false;
    END IF;
    
    -- Add listener_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'listener_count') THEN
        ALTER TABLE rooms ADD COLUMN listener_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add speaker_count column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'speaker_count') THEN
        ALTER TABLE rooms ADD COLUMN speaker_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add last_active_at column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'last_active_at') THEN
        ALTER TABLE rooms ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
    
    -- Add trending_score column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'trending_score') THEN
        ALTER TABLE rooms ADD COLUMN trending_score NUMERIC(10,2) DEFAULT 0;
    END IF;
    
    -- Add featured column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'featured') THEN
        ALTER TABLE rooms ADD COLUMN featured BOOLEAN DEFAULT false;
    END IF;
    
    -- Add hms_room_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'rooms' AND column_name = 'hms_room_id') THEN
        ALTER TABLE rooms ADD COLUMN hms_room_id TEXT;
        -- Add unique constraint if you want to ensure one-to-one mapping
        -- ALTER TABLE rooms ADD CONSTRAINT rooms_hms_room_id_unique UNIQUE (hms_room_id);
    END IF;
    
END $$;

-- Create index on hms_room_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_rooms_hms_room_id ON rooms(hms_room_id);

-- Create index on trending_score for sorting
CREATE INDEX IF NOT EXISTS idx_rooms_trending_score ON rooms(trending_score DESC);

-- Create index on is_live for filtering live rooms
CREATE INDEX IF NOT EXISTS idx_rooms_is_live ON rooms(is_live);

-- Create index on last_active_at for recency queries
CREATE INDEX IF NOT EXISTS idx_rooms_last_active_at ON rooms(last_active_at DESC);

-- Add comments to document the columns
COMMENT ON COLUMN rooms.is_live IS 'Whether the room is currently live/active';
COMMENT ON COLUMN rooms.listener_count IS 'Current number of listeners in the room';
COMMENT ON COLUMN rooms.speaker_count IS 'Current number of speakers in the room';
COMMENT ON COLUMN rooms.last_active_at IS 'Timestamp of last activity in the room';
COMMENT ON COLUMN rooms.trending_score IS 'Calculated trending score based on participants and recency';
COMMENT ON COLUMN rooms.featured IS 'Whether the room is featured (affects trending score)';
COMMENT ON COLUMN rooms.hms_room_id IS '100ms room identifier for webhook matching';

-- Create a function to update trending scores for all rooms
CREATE OR REPLACE FUNCTION update_all_trending_scores()
RETURNS void AS $$
DECLARE
    room_record RECORD;
    base_score NUMERIC;
    hours_since_active NUMERIC;
    decay_factor NUMERIC;
BEGIN
    FOR room_record IN 
        SELECT 
            id,
            listener_count,
            speaker_count,
            featured,
            last_active_at
        FROM rooms
    LOOP
        -- Calculate base score
        base_score := (room_record.listener_count * 1) + (room_record.speaker_count * 3);
        IF room_record.featured THEN
            base_score := base_score + 5;
        END IF;
        
        -- Calculate recency decay (6 hour half-life)
        hours_since_active := EXTRACT(EPOCH FROM (NOW() - room_record.last_active_at)) / 3600;
        decay_factor := POWER(0.5, hours_since_active / 6);
        
        -- Update trending score
        UPDATE rooms 
        SET trending_score = ROUND((base_score * decay_factor)::NUMERIC, 2)
        WHERE id = room_record.id;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to update trending scores (optional)
-- This would require pg_cron extension
-- SELECT cron.schedule('update-trending-scores', '*/15 * * * *', 'SELECT update_all_trending_scores();');

-- Grant necessary permissions to authenticated users (adjust as needed)
-- GRANT SELECT ON rooms TO authenticated;
-- GRANT UPDATE (is_live, listener_count, speaker_count, last_active_at, trending_score) ON rooms TO authenticated;
