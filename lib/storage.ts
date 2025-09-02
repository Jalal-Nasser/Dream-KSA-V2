import { createClient } from '@supabase/supabase-js';

// Simple in-memory memo to avoid recomputing public URLs repeatedly.
const avatarUrlCache = new Map<string, string>();

/**
 * Resolve a public URL for an avatar path with memoization.
 */
export function resolveAvatarUrl(client: ReturnType<typeof createClient>, path?: string | null) {
  if (!path) return null;
  const cached = avatarUrlCache.get(path);
  if (cached) return cached;
  if (__DEV__) console.log('[resolveAvatarUrl] path:', path);
  const { data } = client.storage.from('avatars').getPublicUrl(path);
  const url = data?.publicUrl ?? null;
  if (url) avatarUrlCache.set(path, url);
  return url;
}