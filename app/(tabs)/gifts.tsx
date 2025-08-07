import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GiftsScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Gradient background */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <View style={{ flex: 1, backgroundColor: 'transparent' }}>
            {/* Use LinearGradient for background */}
            <View style={{ flex: 1 }}>
              {/* ...existing code... */}
            </View>
          </View>
        </View>
        {/* Content */}
        <View style={{ flex: 1, padding: 20 }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 16 }}>الهدايا</Text>
          {/* Grid of gifts (placeholder) */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {[1,2,3,4].map(i => (
              <View key={i} style={{ width: '47%', backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, padding: 16, alignItems: 'center', elevation: 2 }}>
                <Text style={{ color: '#4d9ef6', fontWeight: 'bold', fontSize: 16 }}>هدية {i}</Text>
                <Text style={{ color: '#555', fontSize: 13, marginTop: 6 }}>وصف مختصر</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ...existing code...
});
