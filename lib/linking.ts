import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

// REQUIRED on iOS to complete pending sessions
WebBrowser.maybeCompleteAuthSession();

/** Expo Go uses proxy, dev/prod builds use app scheme. */
export const authRedirectUri = AuthSession.makeRedirectUri({
  scheme: 'dream-ksa',
  preferLocalhost: true,
  useProxy: Constants.appOwnership === 'expo',
});

export function parseCode(url?: string) {
  if (!url) return '';
  const { queryParams } = Linking.parse(url);
  return typeof queryParams?.code === 'string' ? queryParams.code : '';
}

export function logAuthInfo(tag = '[oauth]') {
  console.log(tag, 'redirect:', authRedirectUri, 'ownership:', Constants.appOwnership);
}
