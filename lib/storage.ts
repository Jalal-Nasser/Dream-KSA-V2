import { supabase } from '@/lib/supabase';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

/**
 * Upload a local image URI to Supabase storage and return { path, publicUrl }.
 * Stores under: avatars/<userId>/<timestamp>.jpg
 */
export async function uploadAvatar(localUri: string, userId: string) {
  // Compress/resize to keep uploads light (optional but good for perf)
  let finalUri = localUri;
  try {
    const m = await manipulateAsync(
      localUri,
      [{ resize: { width: 640 } }],
      { compress: 0.8, format: SaveFormat.JPEG }
    );
    finalUri = m.uri;
  } catch {
    // If manipulation fails, fallback to original
  }

  const res = await fetch(finalUri);
  const blob = await res.blob();

  const path = `avatars/${userId}/${Date.now()}.jpg`;
  const { error } = await supabase
    .storage
    .from('avatars')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;

  const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
  return { path, publicUrl: pub.publicUrl };
}

/** Resolve a renderable image source from profiles.avatar_url (path or http URL). */
export function resolveAvatarUrl(avatar_url?: string | null) {
  if (!avatar_url) return undefined;
  if (/^https?:\/\//i.test(avatar_url)) return avatar_url;
  const { data } = supabase.storage.from('avatars').getPublicUrl(avatar_url);
  return data.publicUrl;
}
