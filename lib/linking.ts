import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export const authRedirectUri = AuthSession.makeRedirectUri({
  scheme: 'dream-ksa',
  preferLocalhost: true,
  useProxy: Constants.appOwnership === 'expo',
});

// Also generate both local forms we may see on Android
export const redirectDouble = Linking.createURL('/auth-callback', { scheme: 'dream-ksa' });   // dream-ksa:///auth-callback
export const redirectSingle = 'dream-ksa://auth-callback';

export function parseCode(url?: string) {
  if (!url) return '';
  const { queryParams } = Linking.parse(url);
  return typeof queryParams?.code === 'string' ? String(queryParams.code) : '';
}

export function logRedirects(tag='[oauth]') {
  console.log(tag, 'authRedirectUri:', authRedirectUri);
  console.log(tag, 'allow also:', redirectDouble, 'and', redirectSingle);
}
