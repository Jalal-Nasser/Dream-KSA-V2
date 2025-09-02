import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession(); // safe on native

// Always compute the Expo proxy redirect for dev (works in Expo Go & accepted by Supabase)
export function getRedirectTo(): string {
  const uri = AuthSession.makeRedirectUri({ useProxy: true });
  console.log('[oauth] getRedirectTo(useProxy:true) →', uri);
  return uri;
}

export function looksLikeAuthReturn(url: string) {
  if (!url) return false;
  return url.includes('access_token') || url.includes('refresh_token') || url.includes('code=');
}