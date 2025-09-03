import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PALETTE } from '../../lib/theme';
import { getSupabase } from '../../lib/supabase';

type Room = { id: string; title: string; created_at: string };

export default function Rooms() {
  const router = useRouter();
  const supabase = getSupabase();
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [title, setTitle] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const fetchRooms = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) {
      // Map to expected format
      const mappedRooms = data.map(room => ({
        id: room.id,
        title: room.name,
        created_at: room.created_at
      }));
      setRooms(mappedRooms as Room[]);
    }
  }, []);

  React.useEffect(() => {
    fetchRooms();
    const channel = supabase
      .channel('rooms_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms' }, (payload) => {
        setRooms((prev) => [payload.new as any, ...prev]);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRooms]);

  const createRoom = async () => {
    if (!title.trim()) {
      console.log('[createRoom] No title provided');
      return;
    }
    
    console.log('[createRoom] Starting room creation with title:', title.trim());
    setLoading(true);
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.log('[createRoom] User not authenticated:', authError);
      setLoading(false);
      return;
    }
    
    console.log('[createRoom] User authenticated:', user.id);
    
    const { data, error } = await supabase
      .from('rooms')
      .insert({ 
        name: title.trim(),
        description: `غرفة ${title.trim()}` 
        // owner_id will be auto-set by our trigger
      })
      .select()
      .single();
    
    setLoading(false);
    if (error) {
      console.log('[createRoom] Database error:', error);
      return;
    }
    
    console.log('[createRoom] Room created successfully:', data);
    setTitle('');
    router.push(`/room/${data!.id}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.soft1, padding: 12 }}>
      <View style={styles.creator}>
        <TextInput
          style={styles.input}
          placeholder="أدخل اسم الغرفة"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
          textAlign="right"
        />
        <Pressable disabled={loading} onPress={createRoom} style={styles.makeBtn}>
          <MaterialCommunityIcons name="plus" size={18} color="#fff" />
          <Text style={{ color: '#fff', fontWeight: '800' }}>{loading ? '...' : 'إنشاء'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={rooms}
        keyExtractor={(r) => r.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/room/${item.id}`)} style={styles.roomRow}>
            <MaterialCommunityIcons name="account-voice" size={20} color={PALETTE.primaryDark} />
            <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
            <Ionicons name="chevron-back" size={18} color="#B4B8BF" />
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  creator: { flexDirection: 'row-reverse', gap: 8, marginBottom: 12 },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontWeight: '700' },
  makeBtn: { backgroundColor: PALETTE.primary, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center', alignItems: 'center', flexDirection: 'row-reverse', gap: 6 },
  roomRow: { backgroundColor: '#fff', borderRadius: 16, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  roomTitle: { flex: 1, textAlign: 'right', fontWeight: '800' },
});
