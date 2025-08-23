import { supabase } from '@/lib/supabase';

export type AgencyLite = { id: string; name: string; icon_url?: string | null; theme_color?: string | null; default_mic_policy?: 'queue' | 'free' | null };

export async function listMyAgencies(): Promise<AgencyLite[]> {
  const { data: me } = await supabase.auth.getUser();
  const uid = me.user?.id;
  if (!uid) return [];
  const { data: roster } = await supabase
    .from('v_agency_roster')
    .select('agency_id')
    .eq('user_id', uid);
  const agencyIds = Array.from(new Set((roster || []).map((r: any) => r.agency_id)));
  if (agencyIds.length === 0) return [];
  const { data } = await supabase
    .from('agencies')
    .select('id,name,icon_url,theme_color,default_mic_policy')
    .in('id', agencyIds);
  return (data || []) as AgencyLite[];
}

export async function getAgencyById(id: string): Promise<AgencyLite | null> {
  const { data } = await supabase
    .from('agencies')
    .select('id,name,icon_url,theme_color,default_mic_policy')
    .eq('id', id)
    .maybeSingle();
  return (data as AgencyLite) || null;
}





