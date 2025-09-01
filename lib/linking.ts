import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

// Try to get a proper HTTPS Expo proxy URL. If makeRedirectUri returns exp://, build it manually.
function resolveExpoProxy(): string {
  let proxy = AuthSession.makeRedirectUri({ useProxy: true });
  if (!proxy.startsWith('https://')) {
    const owner =
      (Constants as any)?.expoConfig?.owner ||
      (Constants as any)?.expoConfig?.extra?.eas?.projectOwner ||
      (Constants as any)?.expoConfig?.extra?.owner ||
      (Constants as any)?.expoConfig?.username ||
      'anonymous';
    const slug = (Constants as any)?.expoConfig?.slug || 'dream-ksa';
    proxy = `https://auth.expo.io/@${owner}/${slug}`;
  }
  return proxy;
}

// Final redirect used by the app:
export const authRedirectUri =
  Constants.appOwnership === 'expo'
    ? resolveExpoProxy() // ALWAYS HTTPS in Expo Go
    : Linking.createURL('/auth-callback', { scheme: 'dream-ksa' });

// Helpful variants (for dashboard):
export const expoProxyUri = resolveExpoProxy();
export const routerTriple = Linking.createURL('/auth-callback', { scheme: 'dream-ksa' }); // usually dream-ksa:///auth-callback
export const schemeSingle = 'dream-ksa://auth-callback';

export function parseCode(url?: string) {
  if (!url) return '';
  const { queryParams } = Linking.parse(url);
  return typeof queryParams?.code === 'string' ? String(queryParams.code) : '';
}

export function logRedirects(tag='[oauth]') {
  console.log(tag, 'USING redirect:', authRedirectUri, 'ownership:', Constants.appOwnership);
  console.log(tag, 'Add these in Supabase:', expoProxyUri, routerTriple, schemeSingle);
}
