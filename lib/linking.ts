import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';

// make Expo complete any pending sessions (required on iOS)
WebBrowser.maybeCompleteAuthSession();

/**
 * Use AuthSession proxy in Expo Go; use app scheme in dev/builds.
 * This makes OAuth work both in Expo Go and in a Dev/Prod build.
 */
export const authRedirectUri = AuthSession.makeRedirectUri({
  scheme: 'dream-ksa',
  preferLocalhost: true,
  // use proxy when running inside Expo Go
  useProxy: Constants.appOwnership === 'expo',
});

// tiny helper to parse a code from a URL
export function getCodeFromUrl(url?: string) {
  if (!url) return '';
  const { queryParams } = Linking.parse(url);
  return typeof queryParams?.code === 'string' ? queryParams.code : '';
}
