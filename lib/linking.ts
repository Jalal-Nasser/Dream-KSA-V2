import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export const authRedirectUri =
  Constants.appOwnership === 'expo'
    ? AuthSession.makeRedirectUri({ useProxy: true })
    : Linking.createURL('/auth-callback', { scheme: 'dream-ksa' });

export const expoProxyUri = AuthSession.makeRedirectUri({ useProxy: true });
export const routerTriple = Linking.createURL('/auth-callback', { scheme: 'dream-ksa' });
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
