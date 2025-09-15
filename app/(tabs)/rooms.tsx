import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PALETTE } from '../../lib/theme';
import { getSupabase, getSessionToken } from '../../lib/supabase';
import { api } from '../../lib/api';
import { hmsJoin, hmsIsConnected, hmsToggleLocalMute, hmsLeave } from '../lib/hmsClient';
import { handRaise, handLower } from '../../lib/api';
import { subscribeParticipants, ParticipantRow, subscribeMessages, sendMessage } from '../lib/realtime';
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
const cardWidth = (width - 48) / 2; // 2 columns with padding

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

  // Demo rooms data for Binmo style
  const demoRooms: Room[] = [
    {
      id: 'demo-1',
      title: 'ون كافيه',
      created_at: new Date().toISOString(),
      host_name: 'مضيف',
      host_country: 'السعودية',
      participant_count: 20,
      status: 'live',
      host_avatar: null // Will show "م" placeholder
    },
    {
      id: 'demo-2', 
      title: 'الوداع',
      created_at: new Date().toISOString(),
      host_name: 'مضيف',
      host_country: 'السعودية',
      participant_count: 6,
      status: 'live',
      host_avatar: null // Will show "م" placeholder
    },
    {
      id: 'demo-3',
      title: 'اليوم',
      created_at: new Date().toISOString(),
      host_name: 'مضيف',
      host_country: 'السعودية',
      participant_count: 1,
      status: 'soon',
      host_avatar: null // Will show "م" placeholder
    },
    {
      id: 'demo-4',
      title: 'عهد الأصدقاء',
      created_at: new Date().toISOString(),
      host_name: 'مضيف',
      host_country: 'السعودية',
      participant_count: 1,
      status: 'soon',
      host_avatar: null // Will show "م" placeholder
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
        // Fallback to demo rooms if no data
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

  const renderRoomCard = ({ item }: { item: Room }) => (
    <RoomCard
      room={item}
      onPress={joinRoom}
      joining={joiningId === item.id}
    />
  );

  return (
    <View style={styles.container}>
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
        renderItem={renderRoomCard}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F0F2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6EA',
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
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0E6EA',
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
    padding: 16,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
});