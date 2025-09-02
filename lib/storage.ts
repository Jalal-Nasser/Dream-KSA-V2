import { createClient } from '@supabase/supabase-js';

// Memoize avatar public URLs to avoid flicker & extra logs
const avatarUrlCache = new Map<string, string>();

export function resolveAvatarUrl(client: ReturnType<typeof createClient>, path?: string | null) {
  if (!path) return null;
  const cached = avatarUrlCache.get(path);
  if (cached) return cached;
  const { data } = client.storage.from('avatars').getPublicUrl(path);
  const url = data?.publicUrl ?? null;
  if (url) avatarUrlCache.set(path, url);
  return url;
}