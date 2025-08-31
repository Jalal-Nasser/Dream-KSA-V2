import { View, Text, StyleSheet } from 'react-native';

export default function TabsIndex() {
  return (
    <View style={styles.c}>
      <Text style={styles.t}>✅ (tabs) mounted</Text>
      <Text style={styles.s}>Routing is active.</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  c: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  t: { fontSize: 20, fontWeight: '600', marginBottom: 6 },
  s: { opacity: 0.7 }
});
