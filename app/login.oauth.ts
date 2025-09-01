import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { parseCode, authRedirectUri } from '../lib/linking';
import { getSupabase } from '../lib/supabase';

export async function openAndExchange(authUrl: string) {
  const supabase = getSupabase();

  // 1) Prefer openAuthSessionAsync (Android-friendly)
  console.log('[oauth] try openAuthSessionAsync →', authUrl.slice(0,120), '…');
  let r1 = await WebBrowser.openAuthSessionAsync(authUrl, authRedirectUri);
  console.log('[oauth] openAuthSessionAsync result:', r1?.type, r1?.url?.slice(0,120) || '<no-url>');
  let code = parseCode(r1?.url);
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession({ code });
    if (!error) return 'ok:openAuthSessionAsync';
    console.warn('[oauth] exchange error (openAuthSessionAsync):', error.message);
  }

  // 2) AuthSession.startAsync (alt)
  console.log('[oauth] try AuthSession.startAsync');
  let r2 = await AuthSession.startAsync({ authUrl, returnUrl: authRedirectUri }) as any;
  console.log('[oauth] startAsync result:', r2?.type, r2?.url?.slice(0,120) || '<no-url>');
  code = parseCode(r2?.url);
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession({ code });
    if (!error) return 'ok:startAsync';
    console.warn('[oauth] exchange error (startAsync):', error.message);
  }

  // 3) Open in external browser; listener in _layout handles the redirect when the app is resumed
  console.log('[oauth] try openBrowserAsync (fallback)');
  const r3 = await WebBrowser.openBrowserAsync(authUrl);
  console.log('[oauth] openBrowserAsync closed with:', r3?.type);
  if (r3?.type === 'opened') return 'await:listener';

  // 4) Last resort, deep open
  console.log('[oauth] try Linking.openURL (last resort)');
  await Linking.openURL(authUrl);
  return 'await:listener';
}
