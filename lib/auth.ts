// app/lib/auth.ts
import * as Linking from 'expo-linking';
import { supabase } from '@/supabase';

export const DREAM_REDIRECT = "dream-ksa://auth/redirect"; // normalized (no triple slash)

export async function startGoogleOAuth() {
  // Prefer explicit string to avoid triple-slash surprises
  const redirectTo = DREAM_REDIRECT;
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      // If you configured PKCE in your project, supabase handles verifier internally.
      // If not using PKCE, this still works for implicit flow.
      skipBrowserRedirect: false
    }
  });
}

// Parses fragment (#...) and query (?...) into a single object
export function parseAuthParams(url: string) {
  const u = new URL(url);
  const out: Record<string, string> = {};
  // query params
  u.searchParams.forEach((v, k) => { out[k] = v; });
  // fragment params
  if (u.hash && u.hash.startsWith('#')) {
    const frag = new URLSearchParams(u.hash.slice(1));
    frag.forEach((v, k) => { out[k] = v; });
  }
  return out;
}

export async function handleAuthRedirect(url: string) {
  const params = parseAuthParams(url);

  // Case A: PKCE code flow: ?code=...
  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(params.code);
    if (error) throw error;
    return data?.session ?? null;
  }

  // Case B: Implicit flow: #access_token=...&refresh_token=...
  const access_token = params.access_token;
  const refresh_token = params.refresh_token;

  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw error;
    return data.session ?? null;
  }

  throw new Error("No recognizable auth params in redirect URL.");
}
