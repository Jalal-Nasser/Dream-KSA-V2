import * as React from 'react';
import { View, Text, Pressable, DevSettings } from 'react-native';

export default function DevTools() {
  return (
    <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>Dev Tools</Text>
      <Pressable
        onPress={() => DevSettings.reload()}
        style={{ backgroundColor: '#A4133C', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Reload JS</Text>
      </Pressable>
    </View>
  );
}


