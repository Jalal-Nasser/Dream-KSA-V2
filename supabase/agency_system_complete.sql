-- Complete Agency System Schema for Dreams KSA
-- This creates all required tables with proper relationships and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'agency_owner', 'host', 'user')),
    country TEXT DEFAULT 'SA',
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. AGENCIES TABLE
CREATE TABLE IF NOT EXISTS public.agencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    payout_split DECIMAL(5,2) DEFAULT 30.00 CHECK (payout_split >= 0 AND payout_split <= 100),
    logo_url TEXT,
    banner_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. AGENCY INVITES TABLE
CREATE TABLE IF NOT EXISTS public.agency_invites (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    invitee_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HOSTS TABLE
CREATE TABLE IF NOT EXISTS public.hosts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    monthly_hours DECIMAL(10,2) DEFAULT 0,
    monthly_gifts INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    hms_room_id TEXT,
    is_live BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    max_speakers INTEGER DEFAULT 2,
    current_speakers INTEGER DEFAULT 0,
    country TEXT DEFAULT 'SA',
    theme TEXT DEFAULT 'default',
    banner_image TEXT,
    background_image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. ROOM PARTICIPANTS TABLE
CREATE TABLE IF NOT EXISTS public.room_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL DEFAULT 'listener' CHECK (role IN ('room_admin', 'speaker', 'listener')),
    hand_raised BOOLEAN DEFAULT false,
    mic_granted BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(room_id, user_id)
);

-- 7. GIFTS CATALOG TABLE
CREATE TABLE IF NOT EXISTS public.gifts_catalog (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    icon_url TEXT,
    category TEXT DEFAULT 'general',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. GIFTS TABLE
CREATE TABLE IF NOT EXISTS public.gifts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_host_id UUID REFERENCES public.hosts(id) ON DELETE CASCADE NOT NULL,
    gift_id UUID REFERENCES public.gifts_catalog(id) ON DELETE CASCADE NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MONTHLY EARNINGS TABLE
CREATE TABLE IF NOT EXISTS public.monthly_earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    host_id UUID REFERENCES public.hosts(id) ON DELETE CASCADE NOT NULL,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    month_year TEXT NOT NULL, -- Format: '2024-01'
    total_gifts INTEGER DEFAULT 0,
    total_points INTEGER DEFAULT 0,
    total_currency DECIMAL(10,2) DEFAULT 0,
    agency_share DECIMAL(10,2) DEFAULT 0,
    host_share DECIMAL(10,2) DEFAULT 0,
    is_finalized BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(host_id, month_year)
);

-- 10. PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    host_id UUID REFERENCES public.hosts(id) ON DELETE CASCADE NOT NULL,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    monthly_earnings_id UUID REFERENCES public.monthly_earnings(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    payout_method TEXT DEFAULT 'bank_transfer',
    reference_id TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);
CREATE INDEX IF NOT EXISTS idx_agencies_owner ON public.agencies(owner_id);
CREATE INDEX IF NOT EXISTS idx_agencies_active ON public.agencies(is_active);
CREATE INDEX IF NOT EXISTS idx_agency_invites_agency ON public.agency_invites(agency_id);
CREATE INDEX IF NOT EXISTS idx_agency_invites_invitee ON public.agency_invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_agency_invites_status ON public.agency_invites(status);
CREATE INDEX IF NOT EXISTS idx_hosts_user ON public.hosts(user_id);
CREATE INDEX IF NOT EXISTS idx_hosts_agency ON public.hosts(agency_id);
CREATE INDEX IF NOT EXISTS idx_rooms_owner ON public.rooms(owner_id);
CREATE INDEX IF NOT EXISTS idx_rooms_agency ON public.rooms(agency_id);
CREATE INDEX IF NOT EXISTS idx_rooms_live ON public.rooms(is_live);
CREATE INDEX IF NOT EXISTS idx_room_participants_room ON public.room_participants(room_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_user ON public.room_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_room_participants_role ON public.room_participants(role);
CREATE INDEX IF NOT EXISTS idx_gifts_room ON public.gifts(room_id);
CREATE INDEX IF NOT EXISTS idx_gifts_sender ON public.gifts(sender_id);
CREATE INDEX IF NOT EXISTS idx_gifts_receiver ON public.gifts(receiver_host_id);
CREATE INDEX IF NOT EXISTS idx_monthly_earnings_host ON public.monthly_earnings(host_id);
CREATE INDEX IF NOT EXISTS idx_monthly_earnings_month ON public.monthly_earnings(month_year);
CREATE INDEX IF NOT EXISTS idx_payouts_host ON public.payouts(host_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for PROFILES
DROP POLICY IF EXISTS "profiles_self_read" ON public.profiles;
CREATE POLICY "profiles_self_read" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_self_update" ON public.profiles;
CREATE POLICY "profiles_self_update" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_admin_read" ON public.profiles;
CREATE POLICY "profiles_admin_read" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for AGENCIES
DROP POLICY IF EXISTS "agencies_owner_full_access" ON public.agencies;
CREATE POLICY "agencies_owner_full_access" ON public.agencies
    FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "agencies_public_read" ON public.agencies;
CREATE POLICY "agencies_public_read" ON public.agencies
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "agencies_admin_full_access" ON public.agencies;
CREATE POLICY "agencies_admin_full_access" ON public.agencies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for AGENCY INVITES
DROP POLICY IF EXISTS "agency_invites_agency_owner" ON public.agency_invites;
CREATE POLICY "agency_invites_agency_owner" ON public.agency_invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = agency_invites.agency_id AND owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "agency_invites_invitee" ON public.agency_invites;
CREATE POLICY "agency_invites_invitee" ON public.agency_invites
    FOR SELECT USING (invitee_id = auth.uid());

-- RLS Policies for HOSTS
DROP POLICY IF EXISTS "hosts_self_access" ON public.hosts;
CREATE POLICY "hosts_self_access" ON public.hosts
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "hosts_agency_owner" ON public.hosts;
CREATE POLICY "hosts_agency_owner" ON public.hosts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = hosts.agency_id AND owner_id = auth.uid()
        )
    );

-- RLS Policies for ROOMS
DROP POLICY IF EXISTS "rooms_owner_full_access" ON public.rooms;
CREATE POLICY "rooms_owner_full_access" ON public.rooms
    FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "rooms_public_read" ON public.rooms;
CREATE POLICY "rooms_public_read" ON public.rooms
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "rooms_agency_host" ON public.rooms;
CREATE POLICY "rooms_agency_host" ON public.rooms
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hosts 
            WHERE user_id = auth.uid() AND agency_id = rooms.agency_id
        )
    );

-- RLS Policies for ROOM PARTICIPANTS
DROP POLICY IF EXISTS "room_participants_room_access" ON public.room_participants;
CREATE POLICY "room_participants_room_access" ON public.room_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rooms 
            WHERE id = room_participants.room_id AND is_active = true
        )
    );

DROP POLICY IF EXISTS "room_participants_self" ON public.room_participants;
CREATE POLICY "room_participants_self" ON public.room_participants
    FOR ALL USING (user_id = auth.uid());

-- RLS Policies for GIFTS CATALOG
DROP POLICY IF EXISTS "gifts_catalog_public_read" ON public.gifts_catalog;
CREATE POLICY "gifts_catalog_public_read" ON public.gifts_catalog
    FOR SELECT USING (is_active = true);

-- RLS Policies for GIFTS
DROP POLICY IF EXISTS "gifts_sender" ON public.gifts;
CREATE POLICY "gifts_sender" ON public.gifts
    FOR SELECT USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "gifts_receiver" ON public.gifts;
CREATE POLICY "gifts_receiver" ON public.gifts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hosts 
            WHERE id = gifts.receiver_host_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "gifts_agency_owner" ON public.gifts;
CREATE POLICY "gifts_agency_owner" ON public.gifts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hosts h
            JOIN public.agencies a ON h.agency_id = a.id
            WHERE h.id = gifts.receiver_host_id AND a.owner_id = auth.uid()
        )
    );

-- RLS Policies for MONTHLY EARNINGS
DROP POLICY IF EXISTS "monthly_earnings_host" ON public.monthly_earnings;
CREATE POLICY "monthly_earnings_host" ON public.monthly_earnings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hosts 
            WHERE id = monthly_earnings.host_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "monthly_earnings_agency_owner" ON public.monthly_earnings;
CREATE POLICY "monthly_earnings_agency_owner" ON public.monthly_earnings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = monthly_earnings.agency_id AND owner_id = auth.uid()
        )
    );

-- RLS Policies for PAYOUTS
DROP POLICY IF EXISTS "payouts_host" ON public.payouts;
CREATE POLICY "payouts_host" ON public.payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.hosts 
            WHERE id = payouts.host_id AND user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "payouts_agency_owner" ON public.payouts;
CREATE POLICY "payouts_agency_owner" ON public.payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = payouts.agency_id AND owner_id = auth.uid()
        )
    );

-- Create functions for common operations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name', 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agencies_updated_at BEFORE UPDATE ON public.agencies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agency_invites_updated_at BEFORE UPDATE ON public.agency_invites FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON public.hosts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON public.rooms FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_monthly_earnings_updated_at BEFORE UPDATE ON public.monthly_earnings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payouts_updated_at BEFORE UPDATE ON public.payouts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default gifts catalog
INSERT INTO public.gifts_catalog (name, points, icon_url, category) VALUES
('Rose', 10, '🌹', 'flowers'),
('Heart', 25, '❤️', 'love'),
('Star', 50, '⭐', 'premium'),
('Crown', 100, '👑', 'luxury'),
('Diamond', 250, '💎', 'exclusive'),
('Rocket', 500, '🚀', 'special'),
('Trophy', 1000, '🏆', 'elite')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Create a default admin user (you'll need to create this user in auth.users first)
-- INSERT INTO public.profiles (id, display_name, role) VALUES 
-- ('your-admin-user-id', 'Admin User', 'admin')
-- ON CONFLICT (id) DO UPDATE SET role = 'admin';
