import { getSupabase } from './supabase';
import { prepareAvatarUri } from './image';

type ProfilePatch = Partial<{
  display_name: string;
  username: string;
  gender: 'male' | 'female' | 'other';
  birthday: string; // ISO yyyy-mm-dd
  country: string;
  title: string;
  signature: string;
  avatar_url: string;
}>;

export type Profile = {
  id: string;
  display_name: string | null;
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

function pickProfilePatch(patch: any): ProfilePatch {
  // Accept only DB columns to avoid schema-cache errors
  const allowed = [
    'display_name','username','gender','birthday','country','title','signature','avatar_url'
  ] as const;
  const out: any = {};
  for (const k of allowed) {
    if (patch[k] !== undefined) {
      const v = typeof patch[k] === 'string' ? patch[k].trim() : patch[k];
      out[k] = v;
    }
  }
  // Normalize country (e.g., "sa" -> "SA")
  if (out.country && typeof out.country === 'string') {
    out.country = out.country.toUpperCase();
  }
  return out;
}

export async function upsertMyProfile(patch: Partial<Profile>) {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: userData } = await supabase.auth.getUser();
  const authUser = userData?.user;
  const clean = pickProfilePatch(patch);

  // Ensure display_name is always present and non-empty
  const emailPrefix =
    (authUser?.email ? String(authUser.email).split('@')[0] : '') || '';
  const metaName =
    (authUser?.user_metadata?.full_name ||
      authUser?.user_metadata?.name ||
      authUser?.user_metadata?.given_name ||
      '') as string;
  const dn =
    (clean.display_name || '').trim() ||
    (clean.username || '').trim() ||
    metaName.trim() ||
    emailPrefix.trim() ||
    'مستخدم';
  clean.display_name = dn;

  const row = { id: user.id, ...clean, updated_at: new Date().toISOString() };
  const { data, error } = await supabase.from('profiles').upsert(row, { onConflict: 'id' }).select().single();
  if (error) throw error;
  return data as Profile;
}

export async function loadMyProfile() {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, username, gender, birthday, country, title, signature, avatar_url, updated_at')
    .eq('id', user.id)
    .single();
  if (error) return null;
  return data as Profile | null;
}

export function publicAvatarUrl(path: string | null) {
  if (!path) return null;
  const supabase = getSupabase();
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return data.publicUrl;
}

async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id || null;
}

export async function uploadAvatar(uri: string): Promise<string> {
  const uid = await getCurrentUserId();
  if (!uid) throw new Error('No user');
  const prepared = await prepareAvatarUri(uri);
  const ext = (prepared.split('?')[0].split('.').pop() || 'jpg').toLowerCase();
  const path = `${uid}/${Date.now()}.${ext}`;
  const blob = await (await fetch(prepared)).blob();
  const supabase = getSupabase();
  const { error } = await supabase.storage.from('avatars').upload(path, blob, {
    upsert: true,
    contentType: blob.type || 'image/jpeg',
  });
  if (error) throw error;
  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  const publicUrl = data.publicUrl;
  // Persist to profiles via RPC (created earlier in SQL)
  const { error: rpcErr } = await supabase.rpc('set_avatar_url', { _path: path });
  if (rpcErr) {
    // Fallback: try direct upsert if RPC failed (won't crash UI)
    try { await upsertMyProfile({ avatar_url: path }); } catch {}
  }
  return publicUrl;
}
