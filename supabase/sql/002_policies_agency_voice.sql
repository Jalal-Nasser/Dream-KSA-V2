-- Enable Row Level Security (RLS) on all tables
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

DROP POLICY IF EXISTS "profiles_insert_self" ON public.profiles;
CREATE POLICY "profiles_insert_self" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for AGENCIES
DROP POLICY IF EXISTS "agencies_owner_full_access" ON public.agencies;
CREATE POLICY "agencies_owner_full_access" ON public.agencies
    FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "agencies_admin_full_access" ON public.agencies;
CREATE POLICY "agencies_admin_full_access" ON public.agencies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

DROP POLICY IF EXISTS "agencies_public_read" ON public.agencies;
CREATE POLICY "agencies_public_read" ON public.agencies
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "agencies_insert_owner" ON public.agencies;
CREATE POLICY "agencies_insert_owner" ON public.agencies
    FOR INSERT WITH CHECK (owner_id = auth.uid());

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

DROP POLICY IF EXISTS "agency_invites_admin" ON public.agency_invites;
CREATE POLICY "agency_invites_admin" ON public.agency_invites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

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

DROP POLICY IF EXISTS "hosts_insert_owner" ON public.hosts;
CREATE POLICY "hosts_insert_owner" ON public.hosts
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- RLS Policies for ROOMS
DROP POLICY IF EXISTS "rooms_owner_full_access" ON public.rooms;
CREATE POLICY "rooms_owner_full_access" ON public.rooms
    FOR ALL USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "rooms_public_read" ON public.rooms;
CREATE POLICY "rooms_public_read" ON public.rooms
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "rooms_insert_owner" ON public.rooms;
CREATE POLICY "rooms_insert_owner" ON public.rooms
    FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "rooms_admin_update" ON public.rooms;
CREATE POLICY "rooms_admin_update" ON public.rooms
    FOR UPDATE USING (
        owner_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for ROOM PARTICIPANTS
DROP POLICY IF EXISTS "room_participants_room_access" ON public.room_participants;
CREATE POLICY "room_participants_room_access" ON public.room_participants
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.rooms 
            WHERE id = room_participants.room_id
        )
    );

DROP POLICY IF EXISTS "room_participants_self" ON public.room_participants;
CREATE POLICY "room_participants_self" ON public.room_participants
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS "room_participants_admin_update" ON public.room_participants;
CREATE POLICY "room_participants_admin_update" ON public.room_participants
    FOR UPDATE USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM public.room_participants rp
            JOIN public.rooms r ON rp.room_id = r.id
            WHERE rp.room_id = room_participants.room_id
            AND rp.user_id = auth.uid()
            AND rp.role = 'room_admin'
        )
    );

-- RLS Policies for GIFTS CATALOG
DROP POLICY IF EXISTS "gifts_catalog_public_read" ON public.gifts_catalog;
CREATE POLICY "gifts_catalog_public_read" ON public.gifts_catalog
    FOR SELECT USING (is_active = true);

-- RLS Policies for GIFTS
DROP POLICY IF EXISTS "gifts_room_members" ON public.gifts;
CREATE POLICY "gifts_room_members" ON public.gifts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.room_participants
            WHERE room_id = gifts.room_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for MONTHLY EARNINGS
DROP POLICY IF EXISTS "monthly_earnings_host" ON public.monthly_earnings;
CREATE POLICY "monthly_earnings_host" ON public.monthly_earnings
    FOR SELECT USING (host_id = auth.uid());

DROP POLICY IF EXISTS "monthly_earnings_agency_owner" ON public.monthly_earnings;
CREATE POLICY "monthly_earnings_agency_owner" ON public.monthly_earnings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = monthly_earnings.agency_id AND owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "monthly_earnings_admin" ON public.monthly_earnings;
CREATE POLICY "monthly_earnings_admin" ON public.monthly_earnings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- RLS Policies for PAYOUTS
DROP POLICY IF EXISTS "payouts_beneficiary" ON public.payouts;
CREATE POLICY "payouts_beneficiary" ON public.payouts
    FOR SELECT USING (beneficiary_id = auth.uid());

DROP POLICY IF EXISTS "payouts_agency_owner" ON public.payouts;
CREATE POLICY "payouts_agency_owner" ON public.payouts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.agencies 
            WHERE id = payouts.agency_id AND owner_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "payouts_admin" ON public.payouts;
CREATE POLICY "payouts_admin" ON public.payouts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

