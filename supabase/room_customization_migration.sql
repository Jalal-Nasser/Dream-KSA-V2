-- PostgreSQL Migration Script for Room Customization
-- This file uses PostgreSQL syntax, not SQL Server
-- Run this against your Supabase PostgreSQL database

-- Add customization fields to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS theme VARCHAR(7) DEFAULT '#4f46e5',
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS background_image TEXT,
ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'SA',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'voice',
ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_rooms_theme ON rooms(theme);
CREATE INDEX IF NOT EXISTS idx_rooms_country ON rooms(country);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at);

-- Add comment for documentation
COMMENT ON COLUMN rooms.theme IS 'Hex color code for room theme';
COMMENT ON COLUMN rooms.banner_image IS 'URL or base64 string for room banner image';
COMMENT ON COLUMN rooms.background_image IS 'URL or base64 string for room background image';
