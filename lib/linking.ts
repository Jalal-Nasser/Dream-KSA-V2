import * as Linking from 'expo-linking';

export const authRedirectUri = Linking.createURL('/auth-callback', { scheme: 'dream-ksa' });
