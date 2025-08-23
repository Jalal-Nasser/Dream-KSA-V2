// app.config.js
export default ({ config }) => ({
  ...config,
  name: 'Dreams KSA',
  slug: 'dream-ksa',
  scheme: 'dream-ksa',
  plugins: ['expo-router'],
  android: {
    package: 'com.dreamsksa',
    permissions: [
      'INTERNET',
      'RECORD_AUDIO',
      'BLUETOOTH',
      'BLUETOOTH_CONNECT',
      'MODIFY_AUDIO_SETTINGS'
    ],
    intentFilters: [
      {
        action: 'VIEW',
        category: ['BROWSABLE', 'DEFAULT'],
        data: [
          { scheme: 'dream-ksa', host: 'auth', pathPrefix: '/callback' },
          { scheme: 'exp+dream-ksa', host: 'auth', pathPrefix: '/callback' },
        ],
      },
    ],
  },
  ios: {
    bundleIdentifier: 'com.dreamsksa',
  },
  extra: {
    SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
    SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
    FUNCTIONS_BASE_URL: process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL ?? 'https://kgcpeoidouajwytndtqi.functions.supabase.co',
    HMS_TOKEN_URL: process.env.EXPO_PUBLIC_HMS_TOKEN_URL ?? 'https://kgcpeoidouajwytndtqi.functions.supabase.co/hms-token',
    EXPO_PUBLIC_HMS_SPEAKER_ROLE: process.env.EXPO_PUBLIC_HMS_SPEAKER_ROLE ?? 'speaker',
    EXPO_PUBLIC_HMS_LISTENER_ROLE: process.env.EXPO_PUBLIC_HMS_LISTENER_ROLE ?? 'listener',
  },
});
