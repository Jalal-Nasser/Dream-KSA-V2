// app/voicechat.tsx - Voice Room MVP Implementation
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Pressable, 
  ScrollView, 
  Alert,
  Modal,
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Hand, 
  LogOut, 
  Users, 
  Crown,
  Settings,
  MessageCircle 
} from 'lucide-react-native';
import { 
  HMSSDK, 
  HMSUpdateListenerActions,
  HMSPeerUpdate 
} from '@100mslive/react-native-hms';

// Import your components
import Avatar from '@/components/avatar';

const { width, height } = Dimensions.get('window');

interface Participant {
  id: string;
  name: string;
  role: 'listener' | 'speaker' | 'moderator';
  isMuted: boolean;
  isHandRaised: boolean;
  avatar?: string;
  isLocalUser?: boolean;
}

export default function VoiceRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const hmsInstanceRef = useRef<any>(null);
  
  // Room State
  const [roomName, setRoomName] = useState(params.roomName as string || 'Voice Room');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // User State
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [userRole, setUserRole] = useState<'listener' | 'speaker' | 'moderator'>('listener');
  
  // Participants State
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'local-user',
      name: 'أنت',
      role: 'listener',
      isMuted: true,
      isHandRaised: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      isLocalUser: true
    }
  ]);
  
  // UI State
  const [showParticipants, setShowParticipants] = useState(false);

  // HMS Event Handlers
  const onJoinSuccess = () => {
    console.log('✅ Successfully joined room');
    setIsConnected(true);
    setIsConnecting(false);
  };

  const onPeerUpdate = (data: any) => {
    console.log('👥 Peer update:', data);
    // Handle peer updates - add/remove participants
  };

  const onError = (error: any) => {
    console.error('❌ HMS Error:', error);
    setIsConnecting(false);
    Alert.alert('خطأ', `حدث خطأ: ${error.description || error.message}`);
  };

  // Connect to HMS
  const connectToRoom = async () => {
    try {
      setIsConnecting(true);
      const hmsInstance = await HMSSDK.build();
      hmsInstanceRef.current = hmsInstance;

      // Set up event listeners
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, onJoinSuccess);
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, onPeerUpdate);
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, onError);

      // Get authentication token
      const res = await fetch('http://192.168.1.9:4000/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'dream-user-001',
          role: userRole,
          room_id: params.roomId || '687656dfa48ca61c46475db8',
        }),
      });
      
      const data = await res.json();
      if (!data.token) {
        throw new Error('Failed to get authentication token');
      }

      // Join room
      await hmsInstance.join({ 
        roomCode: params.roomId || '687656dfa48ca61c46475db8',
        username: 'Dream User',
        authToken: String(data.token)
      } as any);

    } catch (error: any) {
      console.error('❌ Failed to connect:', error);
      setIsConnecting(false);
      Alert.alert('خطأ في الاتصال', 'فشل في الاتصال بالغرفة. يرجى المحاولة مرة أخرى.');
    }
  };

  // Voice Controls
  const toggleMute = async () => {
    if (hmsInstanceRef.current) {
      try {
        if (isMuted) {
          await hmsInstanceRef.current.localPeer?.localAudioTrack?.setMute(false);
        } else {
          await hmsInstanceRef.current.localPeer?.localAudioTrack?.setMute(true);
        }
        setIsMuted(!isMuted);
        
        // Update local participant
        setParticipants(prev => prev.map(p => 
          p.isLocalUser ? { ...p, isMuted: !isMuted } : p
        ));
      } catch (error) {
        console.error('Error toggling mute:', error);
      }
    }
  };

  const toggleHandRaise = () => {
    const newHandState = !isHandRaised;
    setIsHandRaised(newHandState);
    
    // Update local participant
    setParticipants(prev => prev.map(p => 
      p.isLocalUser ? { ...p, isHandRaised: newHandState } : p
    ));
    
    // TODO: Send hand raise event to HMS
    console.log(newHandState ? '🙋‍♂️ Hand raised' : '🙋‍♂️ Hand lowered');
  };

  const leaveRoom = () => {
    Alert.alert(
      'مغادرة الغرفة',
      'هل أنت متأكد من أنك تريد مغادرة الغرفة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'مغادرة', 
          style: 'destructive',
          onPress: async () => {
            if (hmsInstanceRef.current) {
              await hmsInstanceRef.current.leave();
            }
            router.back();
          }
        }
      ]
    );
  };

  // Auto-connect when component mounts
  useEffect(() => {
    connectToRoom();
    return () => {
      // Cleanup
      if (hmsInstanceRef.current) {
        hmsInstanceRef.current.leave();
      }
    };
  }, []);

  const renderParticipant = (participant: Participant) => (
    <View key={participant.id} style={styles.participantItem}>
      <View style={styles.participantAvatar}>
        <Avatar 
          src={participant.avatar} 
          fallback={participant.name.charAt(0)}
        />
        {participant.role === 'moderator' && (
          <View style={styles.crownBadge}>
            <Crown size={12} color="#fbbf24" />
          </View>
        )}
        {participant.isHandRaised && (
          <View style={styles.handBadge}>
            <Hand size={12} color="#fff" />
          </View>
        )}
      </View>
      
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{participant.name}</Text>
        <Text style={styles.participantRole}>
          {participant.role === 'moderator' ? 'مدير' : 
           participant.role === 'speaker' ? 'متحدث' : 'مستمع'}
        </Text>
      </View>
      
      <View style={styles.participantStatus}>
        {participant.isMuted ? (
          <MicOff size={16} color="#ef4444" />
        ) : (
          <Mic size={16} color="#10b981" />
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#1F2937', '#111827', '#0A0E15']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft color="white" size={24} />
          </Pressable>
          
          <View style={styles.headerCenter}>
            <Text style={styles.roomTitle}>{roomName}</Text>
            <Text style={styles.participantCount}>
              {participants.length} {participants.length === 1 ? 'مشارك' : 'مشاركين'}
            </Text>
          </View>
          
          <Pressable 
            onPress={() => setShowParticipants(true)} 
            style={styles.headerButton}
          >
            <Users color="white" size={24} />
          </Pressable>
        </View>

        {/* Connection Status */}
        {isConnecting && (
          <View style={styles.statusBar}>
            <Text style={styles.statusText}>🔄 جاري الاتصال...</Text>
          </View>
        )}
        
        {isConnected && (
          <View style={[styles.statusBar, styles.connectedStatus]}>
            <Text style={styles.statusText}>✅ متصل</Text>
          </View>
        )}

        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Speakers Section */}
          <View style={styles.speakersSection}>
            <Text style={styles.sectionTitle}>المتحدثون</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.speakersContainer}
            >
              {participants
                .filter(p => p.role === 'speaker' || p.role === 'moderator')
                .map(participant => (
                  <View key={participant.id} style={styles.speakerCard}>
                    <View style={styles.speakerAvatar}>
                      <Avatar 
                        src={participant.avatar} 
                        fallback={participant.name.charAt(0)}
                      />
                      {participant.role === 'moderator' && (
                        <View style={styles.crownBadge}>
                          <Crown size={16} color="#fbbf24" />
                        </View>
                      )}
                      {!participant.isMuted && (
                        <View style={styles.speakingIndicator} />
                      )}
                    </View>
                    <Text style={styles.speakerName}>{participant.name}</Text>
                    {participant.isMuted ? (
                      <MicOff size={16} color="#ef4444" />
                    ) : (
                      <Mic size={16} color="#10b981" />
                    )}
                  </View>
                ))}
            </ScrollView>
          </View>

          {/* Listeners Section */}
          <View style={styles.listenersSection}>
            <Text style={styles.sectionTitle}>المستمعون</Text>
            <View style={styles.listenersGrid}>
              {participants
                .filter(p => p.role === 'listener')
                .slice(0, 8) // Show max 8 listeners
                .map(participant => (
                  <View key={participant.id} style={styles.listenerItem}>
                    <Avatar 
                      src={participant.avatar} 
                      fallback={participant.name.charAt(0)}
                    />
                    {participant.isHandRaised && (
                      <View style={styles.handBadge}>
                        <Hand size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                ))}
            </View>
          </View>
        </View>

        {/* Bottom Controls */}
        <View style={styles.bottomControls}>
          <View style={styles.controlsRow}>
            {/* Leave Room */}
            <Pressable onPress={leaveRoom} style={styles.leaveButton}>
              <LogOut size={20} color="#ef4444" />
            </Pressable>

            {/* Hand Raise */}
            <Pressable 
              onPress={toggleHandRaise} 
              style={[styles.controlButton, isHandRaised && styles.activeControl]}
            >
              <Hand size={24} color={isHandRaised ? "#fbbf24" : "white"} />
            </Pressable>

            {/* Mic Toggle */}
            <Pressable 
              onPress={toggleMute} 
              style={[styles.micButton, !isMuted && styles.activeMic]}
            >
              {isMuted ? (
                <MicOff size={28} color="white" />
              ) : (
                <Mic size={28} color="white" />
              )}
            </Pressable>

            {/* Chat (Future) */}
            <Pressable style={styles.controlButton}>
              <MessageCircle size={24} color="white" />
            </Pressable>

            {/* Settings */}
            <Pressable style={styles.controlButton}>
              <Settings size={20} color="white" />
            </Pressable>
          </View>
        </View>

        {/* Participants Modal */}
        <Modal
          visible={showParticipants}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.modalContainer}
          >
            <SafeAreaView style={styles.modalSafeArea}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>المشاركون ({participants.length})</Text>
                <Pressable 
                  onPress={() => setShowParticipants(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>إغلاق</Text>
                </Pressable>
              </View>
              
              <ScrollView style={styles.participantsList}>
                {participants.map(renderParticipant)}
              </ScrollView>
            </SafeAreaView>
          </LinearGradient>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  roomTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  participantCount: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  statusBar: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  connectedStatus: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  speakersSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  speakersContainer: {
    paddingHorizontal: 10,
  },
  speakerCard: {
    alignItems: 'center',
    marginHorizontal: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 15,
    minWidth: 120,
  },
  speakerAvatar: {
    position: 'relative',
    marginBottom: 10,
  },
  speakerName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  crownBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 10,
    padding: 4,
  },
  handBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    padding: 4,
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 12,
    height: 12,
    backgroundColor: '#10b981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  listenersSection: {
    flex: 1,
  },
  listenersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 15,
  },
  listenerItem: {
    position: 'relative',
    marginBottom: 10,
  },
  bottomControls: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeControl: {
    backgroundColor: 'rgba(251, 191, 36, 0.3)',
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMic: {
    backgroundColor: '#10b981',
  },
  leaveButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  participantsList: {
    flex: 1,
    padding: 20,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 15,
    marginBottom: 10,
  },
  participantAvatar: {
    position: 'relative',
    marginRight: 15,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  participantRole: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  participantStatus: {
    marginLeft: 10,
  },
});
