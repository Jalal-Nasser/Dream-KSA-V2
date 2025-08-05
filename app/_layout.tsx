// app/_layout.tsx
import { Slot } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, StyleSheet } from 'react-native';

export default function Layout() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Slot />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000', // Optional background
  },
  container: {
    flex: 1,
  },
});
