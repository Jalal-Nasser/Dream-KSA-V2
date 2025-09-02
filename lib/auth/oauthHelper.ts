import * as WebBrowser from 'expo-web-browser';
import { authRedirectUri } from '../linking';
import { completeSessionFromRedirect } from './sessionFromUrl';

export async function openAndExchange(authUrl: string) {
  console.log('[oauth] openAuthSessionAsync →', authUrl.slice(0, 140), '…');
  const res = await WebBrowser.openAuthSessionAsync(authUrl, authRedirectUri);
  console.log('[oauth] openAuthSessionAsync result:', res?.type, res?.url?.slice(0, 120) || '<no-url>');
  if (res?.type === 'success' && res?.url) {
    const { error } = await completeSessionFromRedirect(res.url);
    if (!error) return 'ok:openAuthSessionAsync';
    console.warn('[oauth] completeSession error:', error.message);
  }
  return 'await:listener';
}