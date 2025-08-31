import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

/**
 * Lightweight redirect from "/" -> "/login"
 * Use a tiny timeout to ensure the Root Layout Slot is mounted before calling router.replace.
 */
export default function IndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    // small delay ensures the router mounts first and avoids "navigate before mount" errors
    const t = setTimeout(() => {
      try {
        router.replace('/login');
      } catch (e) {
        // swallow any early navigation error — router will be ready on next render
      }
    }, 60);
    return () => clearTimeout(t);
  }, [router]);
  return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
}
