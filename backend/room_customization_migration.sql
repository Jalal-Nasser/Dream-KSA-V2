-- Add customization fields to rooms table
ALTER TABLE rooms 
ADD COLUMN IF NOT EXISTS theme VARCHAR(7) DEFAULT '#4f46e5',
ADD COLUMN IF NOT EXISTS banner_image TEXT,
ADD COLUMN IF NOT EXISTS background_image TEXT;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_rooms_theme ON rooms(theme);

-- Add comment for documentation
COMMENT ON COLUMN rooms.theme IS 'Hex color code for room theme';
COMMENT ON COLUMN rooms.banner_image IS 'URL or base64 string for room banner image';
COMMENT ON COLUMN rooms.background_image IS 'URL or base64 string for room background image';
