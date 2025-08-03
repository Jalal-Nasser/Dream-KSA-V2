import { View, Text, StyleSheet } from 'react-native';

export default function RoomsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore Rooms</Text>
      <Text style={styles.subtitle}>Voice chat rooms will appear here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f3f4f6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#6b7280',
  },
});
