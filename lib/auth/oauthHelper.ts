import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { parseCode, authRedirectUri } from '../linking';
import { getSupabase } from '../supabase';

export async function openAndExchange(authUrl: string) {
  const supabase = getSupabase();

  // 1) Prefer openAuthSessionAsync
  console.log('[oauth] try openAuthSessionAsync →', authUrl.slice(0,120), '…');
  try {
    const r1 = await WebBrowser.openAuthSessionAsync(authUrl, authRedirectUri);
    console.log('[oauth] openAuthSessionAsync result:', r1?.type, r1?.url?.slice(0,120) || '<no-url>');
    const code1 = parseCode(r1?.url);
    if (code1) {
      const { error } = await supabase.auth.exchangeCodeForSession({ code: code1 });
      if (!error) return 'ok:openAuthSessionAsync';
      console.warn('[oauth] exchange error (openAuthSessionAsync):', error.message);
    }
  } catch (e) {
    console.warn('[oauth] openAuthSessionAsync failed:', e);
  }

  // 2) AuthSession.startAsync
  try {
    console.log('[oauth] try AuthSession.startAsync');
    const r2 = (await AuthSession.startAsync({ authUrl, returnUrl: authRedirectUri })) as any;
    console.log('[oauth] startAsync result:', r2?.type, r2?.url?.slice(0,120) || '<no-url>');
    const code2 = parseCode(r2?.url);
    if (code2) {
      const { error } = await supabase.auth.exchangeCodeForSession({ code: code2 });
      if (!error) return 'ok:startAsync';
      console.warn('[oauth] exchange error (startAsync):', error.message);
    }
  } catch (e) {
    console.warn('[oauth] startAsync failed:', e);
  }

  // 3) External browser fallback (root listener will catch on resume)
  try {
    console.log('[oauth] try openBrowserAsync (fallback)');
    const r3 = await WebBrowser.openBrowserAsync(authUrl);
    console.log('[oauth] openBrowserAsync closed with:', r3?.type);
    return 'await:listener';
  } catch (e) {
    console.warn('[oauth] openBrowserAsync failed:', e);
  }

  // 4) Last resort deep-link
  try {
    console.log('[oauth] try Linking.openURL (last resort)');
    await Linking.openURL(authUrl);
    return 'await:listener';
  } catch (e) {
    console.warn('[oauth] Linking.openURL failed:', e);
  }

  return 'failed';
}
