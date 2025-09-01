import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// TEMP: pin the Expo proxy (works in Expo Go). Replace "anonymous" with your Expo username later if desired.
export const authRedirectUri = 'https://auth.expo.io/@anonymous/dream-ksa';

// Variants to list in dashboards (scheme for dev/production builds)
export const routerTriple = Linking.createURL('/auth-callback', { scheme: 'dream-ksa' }); // e.g. dream-ksa:///auth-callback
export const schemeSingle = 'dream-ksa://auth-callback';

export function parseCode(url?: string) {
  if (!url) return '';
  const { queryParams } = Linking.parse(url);
  return typeof queryParams?.code === 'string' ? String(queryParams.code) : '';
}

export function logRedirects(tag='[oauth]') {
  console.log(tag, 'USING redirect:', authRedirectUri);
  console.log(tag, 'Add also (for builds):', routerTriple, schemeSingle);
}
