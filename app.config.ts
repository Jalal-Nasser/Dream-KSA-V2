// app.config.ts
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: "Dream KSA",
  slug: "dream-ksa",
  scheme: "dream-ksa",
  owner: "jnasser",
  version: "1.0.0",
  orientation: "portrait",
  newArchEnabled: true,
  plugins: [
    "expo-router",
    "expo-dev-client"
  ],
  ios: {
    bundleIdentifier: "com.dreamksa.app",
    supportsTablet: true,
    infoPlist: {
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ["dream-ksa"]
        }
      ]
    }
  },
  android: {
    package: "app.dreamksa",
    intentFilters: [
      {
        action: "VIEW",
        data: [
          { scheme: "dream-ksa", host: "*", pathPrefix: "/auth/redirect" },
          { scheme: "dream-ksa", host: "*", pathPrefix: "/auth/callback" }
        ],
        category: ["BROWSABLE", "DEFAULT"]
      }
    ]
  },
  extra: {
    // keep your env pass-throughs if used elsewhere
    EXPO_PUBLIC_SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: 'YOUR-ANON-KEY',
    eas: {
      projectId: "replace-with-your-eas-project-id"
    }
  },
  experiments: {
    typedRoutes: true
  }
};

export default config;
