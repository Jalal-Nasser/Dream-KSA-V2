import { supabase } from '@/lib/supabase';

export type Agency = { id: string; name: string; owner_id: string; icon_url?: string | null; created_at?: string };
export type AgencyRole = 'owner' | 'manager' | 'host' | 'member';
export type AgencyMember = { agency_id: string; user_id: string; role: AgencyRole; joined_at?: string };

export async function listAgencies() {
  return await supabase.from('agencies').select('*').order('created_at', { ascending: false });
}

export async function createAgency(name: string, owner_id: string, icon_url?: string) {
  return await supabase.from('agencies').insert({ name, owner_id, icon_url }).select('*').single();
}

export async function getAgency(agency_id: string) {
  return await supabase.from('agencies').select('*').eq('id', agency_id).single();
}

export async function getRoster(agency_id: string) {
  return await supabase.from('v_agency_roster').select('*').eq('agency_id', agency_id);
}

export async function upsertMember(agency_id: string, user_id: string, role: AgencyRole = 'member') {
  return await supabase.from('agency_members').upsert({ agency_id, user_id, role }, { onConflict: 'agency_id,user_id' });
}

export async function updateMemberRole(agency_id: string, user_id: string, role: AgencyRole) {
  return await supabase.from('agency_members').update({ role }).match({ agency_id, user_id });
}

export async function removeMember(agency_id: string, user_id: string) {
  return await supabase.from('agency_members').delete().match({ agency_id, user_id });
}





