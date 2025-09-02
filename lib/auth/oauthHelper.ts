import * as WebBrowser from 'expo-web-browser';
import { redirectNative } from '../linking';
import { completeSessionFromRedirect } from './sessionFromUrl';

export async function openAndExchange(authUrl: string) {
  console.log('[oauth] openAuthSessionAsync (native) →', authUrl.slice(0, 140), '…');
  const res = await WebBrowser.openAuthSessionAsync(authUrl, redirectNative);
  const url = (res && typeof res === 'object' && 'url' in res && typeof (res as any).url === 'string')
    ? (res as any).url as string
    : undefined;
  console.log('[oauth] result:', res?.type, url?.slice(0, 140) || '<no-url>');
  if (res?.type === 'success' && url) {
    const { error } = await completeSessionFromRedirect(url);
    if (!error) return 'ok:openAuthSessionAsync';
    console.warn('[oauth] completeSession error:', error.message);
  }
  return 'await:listener';
}