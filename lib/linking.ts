import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

// Use proxy in Expo Go; use scheme in dev/prod builds
export const authRedirectUri = AuthSession.makeRedirectUri({
  scheme: 'dream-ksa',
  preferLocalhost: true,
  useProxy: Constants.appOwnership === 'expo',
});

// Android often resolves to a triple-slash variant; we'll allow both
export const redirectDouble = Linking.createURL('/auth-callback', { scheme: 'dream-ksa' }); // usually dream-ksa:///auth-callback
export const redirectSingle = 'dream-ksa://auth-callback';

export function parseCode(url?: string) {
  if (!url) return '';
  const { queryParams } = Linking.parse(url);
  return typeof queryParams?.code === 'string' ? String(queryParams.code) : '';
}

export function logRedirects(tag='[oauth]') {
  console.log(tag, 'authRedirectUri:', authRedirectUri);
  console.log(tag, 'also accept:', redirectDouble, 'and', redirectSingle, 'ownership:', Constants.appOwnership);
}
