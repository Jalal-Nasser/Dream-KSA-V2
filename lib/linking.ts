import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession(); // safe on native

// Expo Go must use the HTTPS proxy that you added in Supabase Redirect URLs.
export const authRedirectUri = AuthSession.makeRedirectUri({ useProxy: true });

export function looksLikeAuthReturn(url: string) {
  if (!url) return false;
  return url.includes('access_token') || url.includes('refresh_token') || url.includes('code=');
}

export function logRedirects(tag = '[oauth]') {
  console.log(tag, 'USING redirect:', authRedirectUri);
}