import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, TextInput, Alert, TouchableOpacity, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PALETTE } from '../../lib/theme';
import { getSupabase } from '../../lib/supabase';
import { api } from '../../lib/api';
import { hmsJoin, hmsIsConnected, hmsToggleLocalMute, hmsLeave } from '../lib/hmsClient';
import { handRaise, handLower } from '../../lib/api';
import { subscribeParticipants, ParticipantRow, subscribeMessages, sendMessage } from '../lib/realtime';

type Room = { 
  id: string; 
  title: string; 
  created_at: string;
  host_name?: string;
  host_country?: string;
  participant_count?: number;
  status?: 'live' | 'soon';
  host_avatar?: string;
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

  // Demo rooms data for Binmo style
  const demoRooms: Room[] = [
    {
      id: 'demo-1',
      title: 'هههههههه',
      created_at: new Date().toISOString(),
      host_name: 'Ahmed',
      host_country: 'SA',
      participant_count: 8,
      status: 'live',
      host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'demo-2', 
      title: 'سوالف 195',
      created_at: new Date().toISOString(),
      host_name: 'Sarah',
      host_country: 'SA',
      participant_count: 15,
      status: 'soon',
      host_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'demo-3',
      title: 'كلام نواعم',
      created_at: new Date().toISOString(),
      host_name: 'Omar',
      host_country: 'SA',
      participant_count: 12,
      status: 'live',
      host_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
    },
    {
      id: 'demo-4',
      title: 'موسيقى وغناء',
      created_at: new Date().toISOString(),
      host_name: 'Layla',
      host_country: 'SA',
      participant_count: 18,
      status: 'live',
      host_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
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
          title: room.title || 'Room',
          created_at: room.created_at,
          host_name: 'Host',
          host_country: 'SA',
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
      const token = await api.getHMSToken(roomId, user.id, name, 'listener');
      
      await hmsJoin(token, name, 'listener');
      const connected = await hmsIsConnected();
      
      if (connected) {
        router.push(`/room/${roomId}`);
      } else {
        Alert.alert('خطأ', 'فشل في الانضمام للغرفة');
      }
    } catch (error: any) {
      console.log('Join error:', error);
      Alert.alert('خطأ', error.message || 'فشل في الانضمام للغرفة');
    } finally {
      setJoiningId(null);
    }
  };

  const renderRoomCard = ({ item }: { item: Room }) => (
    <Pressable 
      style={styles.roomCard}
      onPress={() => joinRoom(item.id)}
      disabled={joiningId === item.id}
    >
      {/* Host Avatar */}
      <View style={styles.avatarContainer}>
        {item.host_avatar ? (
          <Image source={{ uri: item.host_avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.host_name?.[0] || 'H'}</Text>
          </View>
        )}
        
        {/* Status Badge */}
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'live' ? '#FF4444' : '#FF69B4' }
        ]}>
          <Text style={styles.statusText}>{item.status === 'live' ? 'Live' : 'Soon'}</Text>
        </View>
        
        {/* Yellow Indicator */}
        <View style={styles.yellowIndicator} />
      </View>

      {/* Room Info */}
      <View style={styles.roomInfo}>
        <Text style={styles.roomTitle} numberOfLines={1}>{item.title}</Text>
        
        <View style={styles.hostInfo}>
          <Ionicons name="home" size={12} color="#666" />
          <Text style={styles.hostName}>{item.host_name}</Text>
          <Text style={styles.hostCountry}>{item.host_country}</Text>
        </View>
        
        <View style={styles.participantInfo}>
          <MaterialCommunityIcons name="account-group" size={16} color="#666" />
          <Text style={styles.participantCount}>{item.participant_count || 0}</Text>
        </View>
      </View>

      {/* Join Button (only for last card) */}
      {item.id === rooms[rooms.length - 1]?.id && (
        <Pressable style={styles.joinButton}>
          <Text style={styles.joinButtonText}>+</Text>
        </Pressable>
      )}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LIVE ROOMS</Text>
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
    backgroundColor: '#F7FBFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#333',
  },
  createButton: {
    backgroundColor: '#EA4C89',
    borderRadius: 20,
    padding: 8,
  },
  createSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
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
    justifyContent: 'space-between',
  },
  roomCard: {
    width: cardWidth,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: 'relative',
  },
  avatarContainer: {
    position: 'relative',
    padding: 16,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EA4C89',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  yellowIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
  },
  roomInfo: {
    padding: 16,
    paddingTop: 0,
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'right',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  hostName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  hostCountry: {
    fontSize: 12,
    color: '#666',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  joinButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EA4C89',
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});