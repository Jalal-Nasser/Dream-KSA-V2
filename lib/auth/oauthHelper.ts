import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { authRedirectUri } from '../linking';
import { completeSessionFromRedirect } from './sessionFromUrl';

export async function openAndExchange(authUrl: string) {
  // 1) Prefer openAuthSessionAsync (Android-friendly)
  console.log('[oauth] try openAuthSessionAsync →', authUrl.slice(0,120), '…');
  try {
    const r1 = await WebBrowser.openAuthSessionAsync(authUrl, authRedirectUri);
    console.log('[oauth] openAuthSessionAsync result:', r1?.type, r1?.url?.slice(0,120) || '<no-url>');
    const done1 = await completeSessionFromRedirect(r1?.url);
    if (!done1.error) return 'ok:openAuthSessionAsync';
    console.warn('[oauth] session error (openAuthSessionAsync):', done1.error.message);
  } catch (e) {
    console.warn('[oauth] openAuthSessionAsync failed:', e);
  }

  // 2) AuthSession.startAsync
  try {
    console.log('[oauth] try AuthSession.startAsync');
    const r2 = (await AuthSession.startAsync({ authUrl, returnUrl: authRedirectUri })) as any;
    console.log('[oauth] startAsync result:', r2?.type, r2?.url?.slice(0,120) || '<no-url>');
    const done2 = await completeSessionFromRedirect(r2?.url);
    if (!done2.error) return 'ok:startAsync';
    console.warn('[oauth] session error (startAsync):', done2.error.message);
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
