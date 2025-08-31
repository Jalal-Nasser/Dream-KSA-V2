import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function Explore() {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[tabs/index] mounted');
  }, []);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#111' }}>استكشف</Text>
    </View>
  );
}
