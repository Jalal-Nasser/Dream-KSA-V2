import { supabase } from '@/lib/supabase';

// Allowed types and max size
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Upload a local image URI to Supabase storage and return { path, publicUrl }.
 * Validates MIME type and size before uploading.
 */
export async function uploadAvatar(localUri: string, userId: string) {
  if (!localUri) throw new Error('No local URI');
  // fetch to get blob + content type + size
  const resp = await fetch(localUri);
  const blob = await resp.blob();
  const contentType = blob.type || 'image/jpeg';

  if (!ALLOWED_TYPES.includes(contentType)) {
    throw new Error(`Invalid file type: ${contentType}`);
  }
  if (blob.size > MAX_BYTES) {
    throw new Error(`File too large: ${(blob.size / 1024 / 1024).toFixed(2)} MB (max ${(MAX_BYTES/1024/1024)} MB)`);
  }

  // Optional: try to compress/resize with expo-image-manipulator if available
  let uploadBlob = blob;
  try {
    // If manipulateAsync is available at runtime, use it (import dynamically)
    // This keeps the helper resilient if the project doesn't include the manipulator
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { manipulateAsync, SaveFormat } = require('expo-image-manipulator');
    if (manipulateAsync) {
      const m = await manipulateAsync(localUri, [{ resize: { width: 1024 } }], { compress: 0.8, format: SaveFormat.JPEG });
      const r = await fetch(m.uri);
      uploadBlob = await r.blob();
    }
  } catch (e) {
    // ignore — proceed with original blob
  }

  const path = `avatars/${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from('avatars').upload(path, uploadBlob, { contentType: 'image/jpeg', upsert: true });
  if (error) throw error;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

/** Resolve a renderable image URL from profiles.avatar_url (path or full URL). */
export function resolveAvatarUrl(avatar_url?: string | null) {
  if (!avatar_url) return undefined;
  if (/^https?:\/\//i.test(avatar_url)) return avatar_url;
  const { data } = supabase.storage.from('avatars').getPublicUrl(avatar_url);
  return data?.publicUrl;
}