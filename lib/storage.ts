import { createClient } from '@supabase/supabase-js';

// Memoize avatar public URLs to avoid flicker & extra logs
const avatarUrlCache = new Map<string, string>();

/**
 * Given a storage path (e.g., "u/<userId>/avatar"), return a public URL.
 * If a full URL was passed, return it as-is.
 */
export function resolveAvatarUrl(client: ReturnType<typeof createClient>, value?: string | null) {
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  const cached = avatarUrlCache.get(value);
  if (cached) return cached;
  const { data } = client.storage.from('avatars').getPublicUrl(value);
  const url = data?.publicUrl ?? null;
  if (url) avatarUrlCache.set(value, url);
  return url;
}