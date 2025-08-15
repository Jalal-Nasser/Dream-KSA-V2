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
      'RECORD_AUDIO',
      'BLUETOOTH',
      'BLUETOOTH_CONNECT',
      'MODIFY_AUDIO_SETTINGS'
    ],
    intentFilters: [
      {
        action: 'VIEW',
        data: [{ scheme: 'dream-ksa', host: 'auth', pathPrefix: '/callback' }],
        category: ['BROWSABLE', 'DEFAULT'],
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
  },
});
