import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function Moments() { 
  return (
    <LinearGradient
      colors={['#FBE7EF', '#F2CAD6', '#F8D7DA', '#FBE7EF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text style={{ fontSize: 24, fontWeight: '700', color: '#800F2F' }}>⚡ لحظات</Text>
    </LinearGradient>
  ); 
}
