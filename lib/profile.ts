import { getSupabase } from './supabase';

export type Profile = {
  id: string;
  username: string | null;
  gender: 'male' | 'female' | 'other' | null;
  birthday: string | null; // ISO date
  country: string | null;
  title: string | null;
  signature: string | null;
  avatar_url: string | null;
  updated_at?: string | null;
};

export async function fetchMyProfile() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
  return { user, profile: (data ?? null) as Profile | null };
}

export async function upsertMyProfile(patch: Partial<Profile>) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const row = { id: user.id, ...patch, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data as Profile;
}

export function publicAvatarUrl(path: string | null) {
  if (!path) return null;
  const supabase = getSupabase();
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}
