import * as WebBrowser from 'expo-web-browser';
import { authRedirectUri } from '../linking';
import { completeSessionFromRedirect } from './sessionFromUrl';

export async function openAndExchange(authUrl: string) {
  console.log('[oauth] openAuthSessionAsync →', authUrl.slice(0, 140), '…');
  const res = await WebBrowser.openAuthSessionAsync(authUrl, authRedirectUri);
  // Safely access the 'url' property only if it exists on the result object
  const url = (res && typeof res === 'object' && 'url' in res && typeof (res as any).url === 'string')
    ? (res as any).url as string
    : undefined;
  console.log('[oauth] openAuthSessionAsync result:', res?.type, url?.slice(0, 120) || '<no-url>');
  if (res?.type === 'success' && url) {
    const { error } = await completeSessionFromRedirect(url);
    if (!error) return 'ok:openAuthSessionAsync';
    console.warn('[oauth] completeSession error:', error.message);
  }
  return 'await:listener';
}