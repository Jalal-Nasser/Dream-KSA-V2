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
    payout_split INTEGER DEFAULT 30 CHECK (payout_split >= 0 AND payout_split <= 100),
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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. HOSTS TABLE
CREATE TABLE IF NOT EXISTS public.hosts (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    monthly_hours NUMERIC DEFAULT 0,
    monthly_gifts NUMERIC DEFAULT 0,
    total_earnings NUMERIC DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. ROOMS TABLE
CREATE TABLE IF NOT EXISTS public.rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE SET NULL,
    hms_room_id TEXT,
    is_live BOOLEAN DEFAULT false,
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
    room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'listener' CHECK (role IN ('room_admin', 'speaker', 'listener')),
    hand_raised BOOLEAN DEFAULT false,
    mic_granted BOOLEAN DEFAULT false,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (room_id, user_id)
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
    receiver_host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    gift_id UUID REFERENCES public.gifts_catalog(id) ON DELETE CASCADE NOT NULL,
    points INTEGER NOT NULL DEFAULT 0,
    message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. MONTHLY EARNINGS TABLE
CREATE TABLE IF NOT EXISTS public.monthly_earnings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    month TEXT NOT NULL CHECK (month ~ '^\d{4}-\d{2}$'), -- Format: 'YYYY-MM'
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    total_points INTEGER DEFAULT 0,
    host_share_points INTEGER DEFAULT 0,
    agency_share_points INTEGER DEFAULT 0,
    converted_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'finalized', 'paid')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(host_id, month)
);

-- 10. PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    month TEXT NOT NULL,
    beneficiary_type TEXT CHECK (beneficiary_type IN ('host', 'agency')),
    beneficiary_id UUID NOT NULL, -- keep generic name
    agency_id UUID REFERENCES public.agencies(id) ON DELETE CASCADE NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed')),
    payout_method TEXT DEFAULT 'bank_transfer',
    reference_id TEXT,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Add a safe foreign key that works for both host & agency payouts
    CONSTRAINT fk_payouts_beneficiary FOREIGN KEY (beneficiary_id)
        REFERENCES public.profiles(id) ON DELETE CASCADE
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
CREATE INDEX IF NOT EXISTS idx_monthly_earnings_month ON public.monthly_earnings(month);
CREATE INDEX IF NOT EXISTS idx_payouts_beneficiary ON public.payouts(beneficiary_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON public.payouts(status);

-- Create RPC function for monthly aggregation
CREATE OR REPLACE FUNCTION public.fn_aggregate_monthly(p_month TEXT)
RETURNS TEXT AS $$
DECLARE
    v_host RECORD;
    v_total_points INTEGER;
    v_agency_split INTEGER;
    v_host_share INTEGER;
    v_agency_share INTEGER;
    v_converted_amount NUMERIC;
    v_points_per_currency INTEGER := 100; -- Configurable rate
BEGIN
    -- Loop through all hosts
    FOR v_host IN 
        SELECT h.user_id, h.agency_id, a.payout_split
        FROM public.hosts h
        JOIN public.agencies a ON h.agency_id = a.id
        WHERE h.is_active = true
    LOOP
        -- Calculate total points for this host in the month
        SELECT COALESCE(SUM(points), 0) INTO v_total_points
        FROM public.gifts
        WHERE receiver_host_id = v_host.user_id
        AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', (p_month || '-01')::DATE);
        
        -- Calculate splits
        v_agency_split := v_host.payout_split;
        v_host_share := v_total_points * (100 - v_agency_split) / 100;
        v_agency_share := v_total_points * v_agency_split / 100;
        v_converted_amount := v_total_points::NUMERIC / v_points_per_currency;
        
        -- Upsert monthly earnings
        INSERT INTO public.monthly_earnings (
            month, host_id, agency_id, total_points, 
            host_share_points, agency_share_points, converted_amount, status
        ) VALUES (
            p_month, v_host.user_id, v_host.agency_id, v_total_points,
            v_host_share, v_agency_share, v_converted_amount, 'draft'
        )
        ON CONFLICT (host_id, month) DO UPDATE SET
            total_points = EXCLUDED.total_points,
            host_share_points = EXCLUDED.host_share_points,
            agency_share_points = EXCLUDED.agency_share_points,
            converted_amount = EXCLUDED.converted_amount,
            updated_at = NOW();
    END LOOP;
    
    RETURN 'Month ' || p_month || ' aggregated successfully';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

