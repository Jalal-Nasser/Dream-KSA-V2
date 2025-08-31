import { View, Text, StyleSheet } from 'react-native';

export default function TabsIndex() {
  return (
    <View style={styles.c}>
      <Text style={styles.t}>✅ (tabs)/index mounted</Text>
      <Text style={styles.s}>If you can see this, routing is fixed.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  t: { fontSize: 20, fontWeight: '600', marginBottom: 8 },
  s: { opacity: 0.7 }
});
