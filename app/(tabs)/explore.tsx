import React from 'react';
import { View, ScrollView, Pressable, Text } from 'react-native';
import RoomCard from '@/app/RoomCard';
import { Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();

  // Mock rooms data for now - you can connect this to your backend later
  const rooms = [
    { id: '1', name: 'نقاش تقني', tags: ['نقاش', 'عام'] },
    { id: '2', name: 'غرفة الموسيقى', tags: ['موسيقى', 'ترفيه'] },
    { id: '3', name: 'دردشة عامة', tags: ['دردشة', 'عام'] },
  ];

  return (
    <ScrollView style={{ backgroundColor: '#0A0E15', flex: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 16 }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, color: 'white' }}>جميع الغرف</Text>
        <Pressable
          onPress={() => router.push('/createroom')}
          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#4f46e5', padding: 10, borderRadius: 12 }}
        >
          <Plus color="#fff" size={18} />
          <Text style={{ color: 'white', marginLeft: 8 }}>إضافة غرفة</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </View>
    </ScrollView>
  );
}
