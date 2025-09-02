import * as Linking from 'expo-linking';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

export const authRedirectUri =
  Constants.appOwnership === 'expo'
    ? AuthSession.makeRedirectUri({ useProxy: true }) // HTTPS proxy for Expo Go
    : Linking.createURL('/auth-callback', { scheme: 'dream-ksa' }); // scheme for dev/prod builds

export function looksLikeAuthReturn(url: string) {
  if (!url) return false;
  return url.includes('access_token') || url.includes('refresh_token') || url.includes('code=');
}

export function logRedirects(tag='[oauth]') {
  console.log(tag, 'USING redirect:', authRedirectUri);
}