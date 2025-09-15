import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSupabase, getSessionToken } from '../../lib/supabase';
import { api } from '../../lib/api';
import { hmsJoin, hmsIsConnected } from '../lib/hmsClient';
import * as Clipboard from 'expo-clipboard';
import RoomCard from '../../src/components/RoomCard';

type Room = { 
  id: string; 
  title: string; 
  created_at: string;
  host_name?: string;
  host_country?: string;
  participant_count?: number;
  status?: 'live' | 'soon';
  host_avatar?: string | null;
};

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 12 * 2 - 12) / 2; // 2 columns with padding

export default function Rooms() {
  const router = useRouter();
  const supabase = getSupabase();
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [title, setTitle] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [joiningId, setJoiningId] = React.useState<string | null>(null);

  // TODO: Remove before release - DEBUG ONLY
  const handleDebugToken = React.useCallback(async () => {
    if (!__DEV__) return;
    try {
      const token = await getSessionToken();
      if (token) {
        console.log('[auth] token', token.slice(0, 24) + '…');
        await Clipboard.setStringAsync(token);
        Alert.alert('Debug', 'Token copied to clipboard');
      } else {
        Alert.alert('Debug', 'Not signed in');
      }
    } catch (e) {
      console.log('[auth] debug token error:', e);
      Alert.alert('Debug', 'Error getting token');
    }
  }, []);

  // Demo rooms data
  const demoRooms: Room[] = [
    {
      id: 'demo-1',
      title: 'ون كافيه',
      created_at: new Date().toISOString(),
      host_name: 'مضيف',
      host_country: 'السعودية',
      participant_count: 20,
      status: 'live',
      host_avatar: null
    },
    {
      id: 'demo-2', 
      title: 'الوداع',
      created_at: new Date().toISOString(),
      host_name: 'مضيف',
      host_country: 'السعودية',
      participant_count: 6,
      status: 'live',
      host_avatar: null
    },
    {
      id: 'demo-3',
      title: 'اليوم',
      created_at: new Date().toISOString(),
      host_name: 'مضيف',
      host_country: 'السعودية',
      participant_count: 1,
      status: 'soon',
      host_avatar: null
    },
    {
      id: 'demo-4',
      title: 'عهد الأصدقاء',
      created_at: new Date().toISOString(),
      host_name: 'مضيف',
      host_country: 'السعودية',
      participant_count: 1,
      status: 'soon',
      host_avatar: null
    }
  ];

  const fetchRooms = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (!error && data) {
        const mappedRooms = data.map((room: any) => ({
          id: room.id,
          title: room.title || 'غرفة',
          created_at: room.created_at,
          host_name: 'مضيف',
          host_country: 'السعودية',
          participant_count: Math.floor(Math.random() * 20) + 1,
          status: Math.random() > 0.3 ? 'live' : 'soon',
        }));
        setRooms(mappedRooms as Room[]);
      } else {
        setRooms(demoRooms);
      }
    } catch (error) {
      console.log('Error fetching rooms:', error);
      setRooms(demoRooms);
    }
  }, []);

  React.useEffect(() => {
    fetchRooms();
    
    // Health check on mount (non-blocking, log-only)
    api.health().then(
      () => console.log("[api] health ok"),
      (e) => console.log("[api] health failed", String(e?.message || e))
    );
  }, [fetchRooms]);

  useFocusEffect(
    React.useCallback(() => {
      fetchRooms();
    }, [fetchRooms])
  );

  const createRoom = async () => {
    if (!title.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال عنوان الغرفة');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .insert([{ title: title.trim() }])
        .select()
        .single();
      
      if (error) throw error;
      
      setTitle('');
      fetchRooms();
      Alert.alert('نجح', 'تم إنشاء الغرفة بنجاح');
    } catch (error: any) {
      Alert.alert('خطأ', error.message || 'فشل في إنشاء الغرفة');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    if (joiningId) return;
    
    setJoiningId(roomId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('خطأ', 'يجب تسجيل الدخول أولاً');
        return;
      }

      const name = user.user_metadata?.name || user.email?.split('@')[0] || 'مستخدم';
      
      // Use new authenticated API functions
      const { apiJoinRoom, apiToken } = await import('../../lib/api');
      await apiJoinRoom(roomId, 'listener');
      const token = await apiToken(roomId, 'listener');
      
      await hmsJoin(token, name, 'listener');
      const connected = await hmsIsConnected();
      
      if (connected) {
        router.push(`/room/${roomId}`);
      } else {
        Alert.alert('خطأ', 'فشل في الانضمام للغرفة');
      }
    } catch (error: any) {
      console.warn('[join] failed', error.message);
      Alert.alert('خطأ', error.message || 'فشل في الانضمام للغرفة');
    } finally {
      setJoiningId(null);
    }
  };

  const renderRoomItem = ({ item }: { item: Room }) => (
    <View style={{ width: CARD_WIDTH, marginBottom: 12 }}>
      <RoomCard
        title={item.title}
        country={item.host_country || 'السعودية'}
        audienceCount={item.participant_count || 0}
        isLive={item.status === 'live'}
        onPress={() => joinRoom(item.id)}
        avatarLetter={item.title?.trim()?.[0] ?? 'م'}
      />
    </View>
  );

  return (
    <LinearGradient
      colors={['#F5D1E0', '#E8B5C7', '#F0C4D1', '#F5D1E0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onLongPress={handleDebugToken}>
          <Text style={styles.headerTitle}>الغرف المباشرة</Text>
        </Pressable>
        <Pressable style={styles.createButton} onPress={createRoom}>
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Create Room Input */}
      <View style={styles.createSection}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="إنشاء غرفة جديدة..."
          placeholderTextColor="#999"
          textAlign="right"
        />
        <Pressable 
          style={[styles.createBtn, loading && styles.createBtnDisabled]} 
          onPress={createRoom}
          disabled={loading}
        >
          <Text style={styles.createBtnText}>{loading ? '...' : 'إنشاء'}</Text>
        </Pressable>
      </View>

      {/* Rooms Grid */}
      <FlatList
        data={rooms}
        renderItem={renderRoomItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
    textAlign: 'right',
  },
  createButton: {
    backgroundColor: '#EA4C89',
    borderRadius: 20,
    padding: 8,
  },
  createSection: {
    flexDirection: 'row-reverse',
    padding: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E8D5E0',
    textAlign: 'right',
  },
  createBtn: {
    backgroundColor: '#EA4C89',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
  },
  createBtnDisabled: {
    opacity: 0.6,
  },
  createBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  grid: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 24,
  },
  row: {
    justifyContent: 'space-between',
    gap: 12,
  },
});