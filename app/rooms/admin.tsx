import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Mic, MicOff, Hand, Crown, Users } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';

interface Participant {
  id: string;
  user_id: string;
  room_id: string;
  hand_raised: boolean;
  mic_granted: boolean;
  role: string;
  user: {
    email: string;
    user_metadata: {
      name?: string;
    };
  };
}

export default function RoomAdminPanel() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const roomId = params.roomId as string;
  
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current user and check if admin
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Check if user is admin of this room
        const { data: roomData } = await supabase
          .from('rooms')
          .select('admin_id')
          .eq('id', roomId)
          .single();
        
        if (roomData?.admin_id !== user.id) {
          Alert.alert('Access Denied', 'You are not an admin of this room');
          router.back();
        }
      }
    };
    getCurrentUser();
  }, [roomId]);

  // Fetch participants with raised hands
  const fetchParticipants = async () => {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .select(`
          *,
          user:auth.users!room_participants_user_id_fkey(
            email,
            user_metadata
          )
        `)
        .eq('room_id', roomId)
        .order('hand_raised', { ascending: false })
        .order('mic_granted', { ascending: false });

      if (error) throw error;
      setParticipants(data || []);
    } catch (error) {
      console.error('[ADMIN] Fetch error:', error);
      Alert.alert('Error', 'Failed to fetch participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roomId) {
      fetchParticipants();
    }
  }, [roomId]);

  // Grant mic access
  const grantMic = async (participant: Participant) => {
    try {
      // Check if we already have 2 speakers
      const currentSpeakers = participants.filter(p => p.mic_granted && p.role === 'speaker').length;
      if (currentSpeakers >= 2) {
        Alert.alert('Limit Reached', 'Maximum 2 speakers allowed. Revoke one first.');
        return;
      }

      const { error } = await supabase
        .from('room_participants')
        .update({
          hand_raised: false,
          mic_granted: true,
          role: 'speaker'
        })
        .eq('room_id', roomId)
        .eq('user_id', participant.user_id);

      if (error) throw error;
      
      Alert.alert('Success', 'Mic access granted');
      fetchParticipants();
    } catch (error) {
      console.error('[ADMIN] Grant error:', error);
      Alert.alert('Error', 'Failed to grant mic access');
    }
  };

  // Revoke mic access
  const revokeMic = async (participant: Participant) => {
    try {
      const { error } = await supabase
        .from('room_participants')
        .update({
          mic_granted: false,
          role: 'listener'
        })
        .eq('room_id', roomId)
        .eq('user_id', participant.user_id);

      if (error) throw error;
      
      Alert.alert('Success', 'Mic access revoked');
      fetchParticipants();
    } catch (error) {
      console.error('[ADMIN] Revoke error:', error);
      Alert.alert('Error', 'Failed to revoke mic access');
    }
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantItem}>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>
          {item.user?.user_metadata?.name || item.user?.email || 'Unknown User'}
        </Text>
        <View style={styles.participantStatus}>
          {item.hand_raised && <Text style={styles.handRaised}>✋ Hand Raised</Text>}
          {item.mic_granted && <Text style={styles.micGranted}>🎤 Mic Active</Text>}
          <Text style={styles.role}>Role: {item.role}</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        {item.hand_raised && !item.mic_granted && (
          <TouchableOpacity 
            style={styles.grantButton}
            onPress={() => grantMic(item)}
          >
            <Mic size={16} color="#ffffff" />
            <Text style={styles.buttonText}>Grant</Text>
          </TouchableOpacity>
        )}
        
        {item.mic_granted && (
          <TouchableOpacity 
            style={styles.revokeButton}
            onPress={() => revokeMic(item)}
          >
            <MicOff size={16} color="#ffffff" />
            <Text style={styles.buttonText}>Revoke</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Room Admin Panel</Text>
        <View style={styles.headerActions}>
          <Crown size={20} color="#fbbf24" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Users size={20} color="#94a3b8" />
            <Text style={styles.statText}>Total: {participants.length}</Text>
          </View>
          <View style={styles.statItem}>
            <Hand size={20} color="#f59e0b" />
            <Text style={styles.statText}>
              Hands Raised: {participants.filter(p => p.hand_raised).length}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Mic size={20} color="#10b981" />
            <Text style={styles.statText}>
              Active Mics: {participants.filter(p => p.mic_granted).length}/2
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Participants</Text>
        
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.user_id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statText: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  participantStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  handRaised: {
    color: '#f59e0b',
    fontSize: 12,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  micGranted: {
    color: '#10b981',
    fontSize: 12,
    backgroundColor: '#d1fae5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  role: {
    color: '#94a3b8',
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  grantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  revokeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
});

