import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function AdminPanel() {
  const { appRoomId } = useLocalSearchParams() as any;
  const [queue, setQueue] = useState<any[]>([]);
  const [granted, setGranted] = useState<any[]>([]);

  const refetch = async () => {
    if (!appRoomId) return;
    const { data } = await supabase
      .from('mic_requests')
      .select('id, user_id, status, created_at, decided_at')
      .eq('room_id', appRoomId)
      .order('created_at', { ascending: true });
    setQueue(data || []);
  };

  useEffect(() => {
    if (!appRoomId) return;
    const ch = supabase
      .channel(`mic:${appRoomId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'mic_requests', filter: `room_id=eq.${appRoomId}` },
        refetch)
      .subscribe();
    refetch();
    return () => { try { supabase.removeChannel(ch); } catch {} };
  }, [appRoomId]);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E15', padding: 16 }}>
      <Text style={{color:'white', fontSize:24, marginBottom:16}}>Admin Panel</Text>
      <Text style={{color:'white', fontSize:18, marginTop:16, marginBottom:8}}>Queue</Text>
      <FlatList
        data={queue}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 12, backgroundColor: '#1F2937', marginBottom: 8, borderRadius: 8 }}>
            <Text style={{color:'white'}}>User: {item.user_id}</Text>
            <Text style={{color:'#9CA3AF'}}>Status: {item.status}</Text>
            <TouchableOpacity
              onPress={async () => {
                try {
                  await supabase.rpc('grant_mic', { p_room: appRoomId, p_user: item.user_id });
                } catch (e) { console.log('[ADMIN] grant error', e); }
              }}
              disabled={item.status !== 'pending'}
              style={{ padding: 8, backgroundColor: item.status === 'pending' ? '#3b82f6' : '#6b7280', borderRadius: 6, marginTop: 8 }}
            >
              <Text style={{color:'white', textAlign:'center'}}>
                {item.status === 'pending' ? 'Grant' : item.status}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}



