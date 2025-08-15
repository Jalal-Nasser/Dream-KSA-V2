-- Add WhatsApp verification fields to profiles table
-- Migration: 004_whatsapp_verification.sql

-- Add WhatsApp verification columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.whatsapp_verified IS 'Whether the user has verified their WhatsApp number';
COMMENT ON COLUMN public.profiles.whatsapp_number IS 'The verified WhatsApp number in E.164 format (e.g., +9665xxxxxxx)';

-- Create index on whatsapp_number for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp_number ON public.profiles(whatsapp_number);

-- Update RLS policies to allow users to update their own WhatsApp fields
-- (assuming existing RLS policies allow users to update their own profiles)
