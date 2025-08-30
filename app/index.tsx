import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

// Small redirector so the app root shows the couple-background login screen (app/login.tsx)
export default function IndexRedirect() {
  const router = useRouter();
  useEffect(() => {
    // replace so back navigation won't return here
    router.replace('/login');
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#e21b73" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#071021' },
});
