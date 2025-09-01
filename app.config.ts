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
    EXPO_PUBLIC_SUPABASE_URL: 'https://kgcpeoidouajwytndtqi.supabase.co',
    EXPO_PUBLIC_SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtnY3Blb2lkb3Vhand5dG5kdHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI5NTc2MzgsImV4cCI6MjA2ODUzMzYzOH0.eV1GRnbrDIQ4xzZ6EsdNOzgGdxUoSFtOXJWoV71wxW4',
    eas: {
      projectId: "kgcpeoidouajwytndtqi"
    }
  },
  experiments: {
    typedRoutes: true
  }
};

export default config;
