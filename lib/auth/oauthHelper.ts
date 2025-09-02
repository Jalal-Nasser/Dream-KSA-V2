import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { parseCode, authRedirectUri } from '../linking';
import { getSupabase } from '../supabase';
import { completeSessionFromRedirect, completeSessionFromParams } from './sessionFromUrl';

export async function openAndExchange(authUrl: string) {
  const supabase = getSupabase();
  const isExpoGo = Constants.appOwnership === 'expo';

  // In Expo Go, prefer AuthSession.startAsync (returns params directly)
  if (isExpoGo) {
    console.log('[oauth] Expo Go: try AuthSession.startAsync first');
    try {
      const r2 = (await AuthSession.startAsync({ authUrl, returnUrl: authRedirectUri })) as any;
      console.log('[oauth] startAsync result:', r2?.type);
      if (r2?.type === 'success') {
        const done2 = await completeSessionFromParams(r2?.params);
        if (!done2.error) return 'ok:startAsync';
        console.warn('[oauth] exchange error (startAsync):', done2.error?.message);
      }
    } catch (e) {
      console.warn('[oauth] startAsync failed:', String(e));
    }
  }

  // 1) openAuthSessionAsync (works well in dev client / some Androids)
  try {
    console.log('[oauth] try openAuthSessionAsync →', authUrl.slice(0, 120), '…');
    const r1 = await WebBrowser.openAuthSessionAsync(authUrl, authRedirectUri);
    console.log('[oauth] openAuthSessionAsync result:', r1?.type, r1?.url?.slice(0, 120) || '<no-url>');
    const done1 = await completeSessionFromRedirect(r1?.url);
    if (!done1.error) return 'ok:openAuthSessionAsync';
  } catch (e) {
    console.warn('[oauth] openAuthSessionAsync failed:', String(e));
  }

  // 2) Fallback startAsync (non-ExpoGo) to catch params
  try {
    console.log('[oauth] try AuthSession.startAsync (fallback)');
    const r2 = (await AuthSession.startAsync({ authUrl, returnUrl: authRedirectUri })) as any;
    console.log('[oauth] startAsync result:', r2?.type, r2?.url?.slice(0, 120) || '<no-url>');
    if (r2?.type === 'success') {
      const done2 = await completeSessionFromParams(r2?.params);
      if (!done2.error) return 'ok:startAsync';
    }
  } catch (e) {
    console.warn('[oauth] startAsync (fallback) failed:', String(e));
  }

  // 3) External browser; listener in _layout will handle tokens on resume
  try {
    console.log('[oauth] try openBrowserAsync (fallback)');
    const r3 = await WebBrowser.openBrowserAsync(authUrl);
    console.log('[oauth] openBrowserAsync closed with:', r3?.type);
    return 'await:listener';
  } catch (e) {
    console.warn('[oauth] openBrowserAsync failed:', String(e));
  }

  // 4) Last resort: deep open; listener handles on resume
  try {
    console.log('[oauth] try Linking.openURL (last resort)');
    await Linking.openURL(authUrl);
    return 'await:listener';
  } catch (e) {
    console.warn('[oauth] Linking.openURL failed:', String(e));
  }

  return 'failed';
}
