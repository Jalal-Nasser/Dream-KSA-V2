import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

export default function IndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/login');
  }, []);
  return <View style={{ flex: 1, backgroundColor: '#fff' }} />;
}
