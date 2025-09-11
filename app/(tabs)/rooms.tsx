import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    if (!error && data) {
      const mappedRooms = data.map((room: any) => ({
        id: room.id,
        title: room.title || 'Room',
        created_at: room.created_at,
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
    
    // Try title first (remote schema may not have name column); fallback to name.
    // IMPORTANT: include host_id (and keep owner_id) to satisfy NOT NULL / RLS.
    let data: any = null;
    let error: any = null;
    const insertTitle: Record<string, any> = {
      title: title.trim() || 'Room',
      host_id: user.id,
      owner_id: user.id,
    };
    let res = await supabase
      .from('rooms')
      .insert(insertTitle)
      .select('id')
      .maybeSingle();
    if (!res.error && res.data) {
      data = res.data;
    } else {
      error = res.error;
      const insertName: Record<string, any> = {
        name: title.trim() || 'Room',
        host_id: user.id,
        owner_id: user.id,
      };
      res = await supabase
        .from('rooms')
        .insert(insertName)
        .select('id')
        .maybeSingle();
      if (!res.error && res.data) {
        data = res.data;
        error = null;
      } else {
        error = error || res.error;
      }
    }
    
    setLoading(false);
    if (error) {
      console.log('[createRoom] Database error:', error);
      return;
    }
    
    console.log('[createRoom] Room created successfully:', data);
    setTitle('');
    // Ensure host membership
    const { error: insErr } = await supabase.from('room_participants').insert({
      room_id: data!.id,
      user_id: user.id,
      role: 'host',
      joined_at: new Date().toISOString(),
    });
    
    if (insErr) {
      console.log('[createRoom] host insert failed, trying update:', insErr);
      await supabase
        .from('room_participants')
        .update({ role: 'host' })
        .eq('room_id', data!.id)
        .eq('user_id', user.id);
    }
    router.push(`/room/${data!.id}`);
  };

  return (
    <LinearGradient
      colors={['#FBE7EF', '#F2CAD6', '#F8D7DA', '#FBE7EF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
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
      </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  creator: { flexDirection: 'row-reverse', gap: 8, marginBottom: 12 },
  input: { 
    flex: 1, 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontWeight: '700',
    shadowColor: '#800F2F',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  makeBtn: { 
    backgroundColor: PALETTE.primary, 
    borderRadius: 12, 
    paddingHorizontal: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    flexDirection: 'row-reverse', 
    gap: 6,
    shadowColor: '#800F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  roomRow: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10,
    shadowColor: '#800F2F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  roomTitle: { flex: 1, textAlign: 'right', fontWeight: '800' },
});
