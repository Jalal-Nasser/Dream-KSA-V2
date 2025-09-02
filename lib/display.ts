import type { User } from '@supabase/supabase-js';

export type ProfileRow = {
  display_name?: string | null;
  username?: string | null;
};

export function resolveDisplayName(p?: ProfileRow | null, u?: User | null) {
  const fullName = (u?.user_metadata?.full_name ||
                    u?.user_metadata?.name ||
                    u?.user_metadata?.given_name ||
                    '') as string;
  const emailPrefix = (u?.email ? String(u.email).split('@')[0] : '') || '';
  return (p?.display_name || '').trim()
      || (p?.username || '').trim()
      || fullName.trim()
      || emailPrefix.trim()
      || 'مستخدم';
}
