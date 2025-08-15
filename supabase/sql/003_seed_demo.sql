-- Seed data for instant demo
-- Note: Replace these placeholder UUIDs with actual auth.users IDs from your Supabase project

-- Insert default gifts catalog
INSERT INTO public.gifts_catalog (name, points, icon_url, category) VALUES
('Rose', 10, '🌹', 'flowers'),
('Heart', 25, '❤️', 'love'),
('Star', 50, '⭐', 'premium'),
('Crown', 100, '👑', 'luxury'),
('Diamond', 250, '', 'exclusive'),
('Rocket', 500, '🚀', 'special'),
('Trophy', 1000, '🏆', 'elite')
ON CONFLICT DO NOTHING;

-- Insert demo profiles (replace UUIDs with actual auth.users IDs)
-- You need to create these users in Supabase Auth first, then update these UUIDs

-- Example structure (uncomment and update UUIDs after creating users):
/*
INSERT INTO public.profiles (id, display_name, role, country) VALUES
('00000000-0000-0000-0000-000000000001', 'Admin User', 'admin', 'SA'),
('00000000-0000-0000-0000-000000000002', 'Agency Owner', 'agency_owner', 'SA'),
('00000000-0000-0000-0000-000000000003', 'Demo Host', 'host', 'SA'),
('00000000-0000-0000-0000-000000000004', 'Demo User', 'user', 'SA')
ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    role = EXCLUDED.role,
    country = EXCLUDED.country;

-- Create demo agency
INSERT INTO public.agencies (name, description, owner_id, payout_split) VALUES
('Dreams KSA Agency', 'Demo agency for testing', '00000000-0000-0000-0000-000000000002', 30)
ON CONFLICT DO NOTHING;

-- Create demo host
INSERT INTO public.hosts (user_id, agency_id) VALUES
('00000000-0000-0000-0000-000000000003', (SELECT id FROM public.agencies LIMIT 1))
ON CONFLICT (user_id) DO NOTHING;

-- Create demo room
INSERT INTO public.rooms (name, description, owner_id, agency_id, is_live) VALUES
('Demo Voice Room', 'Test room for voice chat', '00000000-0000-0000-0000-000000000003', (SELECT id FROM public.agencies LIMIT 1), true)
ON CONFLICT DO NOTHING;

-- Insert demo gifts
INSERT INTO public.gifts (room_id, sender_id, receiver_host_id, gift_id, points, message) VALUES
((SELECT id FROM public.rooms LIMIT 1), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', (SELECT id FROM public.gifts_catalog WHERE name = 'Rose' LIMIT 1), 10, 'Welcome!'),
((SELECT id FROM public.rooms LIMIT 1), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', (SELECT id FROM public.gifts_catalog WHERE name = 'Heart' LIMIT 1), 25, 'Great show!'),
((SELECT id FROM public.rooms LIMIT 1), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', (SELECT id FROM public.gifts_catalog WHERE name = 'Star' LIMIT 1), 50, 'Amazing!'),
((SELECT id FROM public.rooms LIMIT 1), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', (SELECT id FROM public.gifts_catalog WHERE name = 'Crown' LIMIT 1), 100, 'You are the best!'),
((SELECT id FROM public.rooms LIMIT 1), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', (SELECT id FROM public.gifts_catalog WHERE name = 'Diamond' LIMIT 1), 250, 'Legendary performance!')
ON CONFLICT DO NOTHING;

-- Call monthly aggregation function for current month
SELECT public.fn_aggregate_monthly(TO_CHAR(CURRENT_DATE, 'YYYY-MM'));
*/

-- Instructions for using this seed file:
-- 1. First create users in Supabase Auth (Authentication > Users > Add User)
-- 2. Copy the UUIDs of created users
-- 3. Replace the placeholder UUIDs in the INSERT statements above
-- 4. Uncomment the INSERT statements
-- 5. Run this file in Supabase SQL Editor

-- Alternative: Run this to see current month aggregation (after creating data):
-- SELECT public.fn_aggregate_monthly(TO_CHAR(CURRENT_DATE, 'YYYY-MM'));

