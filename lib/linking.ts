import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

// In Expo Go, MUST use the proxy redirect (https://auth.expo.io/@username/slug)
export const authRedirectUri =
  Constants.appOwnership === 'expo'
    ? AuthSession.makeRedirectUri({ useProxy: true })
    : Linking.createURL('/auth-callback', { scheme: 'dream-ksa' });

// Helpful variants you must add to Supabase (Auth → URL Configuration → Redirect URLs)
export const expoProxyUri = AuthSession.makeRedirectUri({ useProxy: true }); // proxy form
export const routerTriple = Linking.createURL('/auth-callback', { scheme: 'dream-ksa' }); // usually dream-ksa:///auth-callback
export const schemeSingle = 'dream-ksa://auth-callback'; // single-slash variant

export function parseCode(url?: string) {
  if (!url) return '';
  const { queryParams } = Linking.parse(url);
  return typeof queryParams?.code === 'string' ? String(queryParams.code) : '';
}

export function logRedirects(tag='[oauth]') {
  console.log(tag, 'USING redirect:', authRedirectUri, 'ownership:', Constants.appOwnership);
  console.log(tag, 'Add these in Supabase:', expoProxyUri, routerTriple, schemeSingle);
}
