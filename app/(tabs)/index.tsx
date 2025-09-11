import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
export default function HiddenIndex() {
  const router = useRouter();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      <Text>✅ tabs mounted</Text>
      <TouchableOpacity onPress={() => router.push('/rooms')} style={{ padding: 12, backgroundColor: '#2563eb', borderRadius: 10 }}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Open Rooms</Text>
      </TouchableOpacity>
    </View>
  );
}
