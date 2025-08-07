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

  // Voice Controls
  const leaveRoom = () => {
    Alert.alert(
      'مغادرة الغرفة',
      'هل أنت متأكد من أنك تريد مغادرة الغرفة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'مغادرة', style: 'destructive', onPress: () => router.back() }
      ]
    );
  };

  const toggleMute = () => setIsMuted((prev) => !prev);
  const toggleHandRaise = () => setIsHandRaised((prev) => !prev);

  const renderParticipant = (participant: Participant) => (
    <View key={participant.id} style={styles.participantItem}>
      <View style={styles.participantAvatar}>
        <Avatar src={participant.avatar} fallback={participant.name.charAt(0)} />
        {participant.role === 'moderator' && (
          <View style={styles.crownBadge}>
            <Crown size={12} color="#fbbf24" />
          </View>
        )}
        {participant.isHandRaised && (
          <View style={styles.handBadge}>
            <Hand size={12} color="#a21caf" />
          </View>
        )}
      </View>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{participant.name}</Text>
        <Text style={styles.participantRole}>
          {participant.role === 'moderator' ? 'مدير' : participant.role === 'speaker' ? 'متحدث' : 'مستمع'}
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
    <>
      <LinearGradient
        colors={["#8b5cf6", "#ec4899", "#3b82f6"]}
        locations={[0.1, 0.5, 0.9]}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.centeredCard}>
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.headerButton}>
                <ArrowLeft color="#a21caf" size={24} />
              </Pressable>
              <View style={styles.headerCenter}>
                <Text style={styles.roomTitle}>{roomName}</Text>
                <Text style={styles.participantCount}>
                  {participants.length} {participants.length === 1 ? 'مشارك' : 'مشاركين'}
                </Text>
              </View>
              <Pressable onPress={() => setShowParticipants(true)} style={styles.headerButton}>
                <Users color="#a21caf" size={24} />
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

            {/* Speakers Section */}
            <View style={styles.speakersSection}>
              <Text style={styles.sectionTitle}>المتحدثون</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.speakersContainer}>
                {participants
                  .filter(p => p.role === 'speaker' || p.role === 'moderator')
                  .map(renderParticipant)}
              </ScrollView>
            </View>

            {/* Listeners Section */}
            <View style={styles.listenersSection}>
              <Text style={styles.sectionTitle}>المستمعون</Text>
              <View style={styles.listenersGrid}>
                {participants
                  .filter(p => p.role === 'listener')
                  .slice(0, 8)
                  .map(renderParticipant)}
              </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomControls}>
              <View style={styles.controlsRow}>
                <Pressable onPress={leaveRoom} style={styles.leaveButton}>
                  <LogOut size={20} color="#ef4444" />
                </Pressable>
                <Pressable onPress={toggleHandRaise} style={[styles.controlButton, isHandRaised && styles.activeControl]}>
                  <Hand size={24} color={isHandRaised ? "#fff" : "#a21caf"} />
                </Pressable>
                <Pressable onPress={toggleMute} style={[styles.micButton, !isMuted && styles.activeMic]}>
                  {isMuted ? (
                    <MicOff size={28} color="#a21caf" />
                  ) : (
                    <Mic size={28} color="#10b981" />
                  )}
                </Pressable>
                <Pressable style={styles.controlButton}>
                  <MessageCircle size={24} color="#a21caf" />
                </Pressable>
                <Pressable style={styles.controlButton}>
                  <Settings size={20} color="#a21caf" />
                </Pressable>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </LinearGradient>
      {/* Participants Modal */}
      <Modal
        visible={showParticipants}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <LinearGradient
          colors={["#8b5cf6", "#ec4899"]}
          style={styles.modalContainer}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>المشاركون ({participants.length})</Text>
              <Pressable onPress={() => setShowParticipants(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>إغلاق</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.participantsList}>
              {participants.map(renderParticipant)}
            </ScrollView>
          </SafeAreaView>
        </LinearGradient>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
  },
  centeredCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  roomTitle: {
    color: '#1e293b',
    fontSize: 20,
    fontWeight: 'bold',
  },
  participantCount: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 2,
  },
  statusBar: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
  },
  connectedStatus: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  statusText: {
    color: '#222',
    fontSize: 14,
    fontWeight: '500',
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  speakersSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    color: '#1e293b',
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
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 15,
    minWidth: 120,
  },
  speakerAvatar: {
    position: 'relative',
    marginBottom: 10,
  },
  speakerName: {
    color: '#1e293b',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'center',
  },
  crownBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    padding: 4,
  },
  handBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#a21caf',
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
    borderColor: '#fff',
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeControl: {
    backgroundColor: '#a21caf',
  },
  micButton: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMic: {
    backgroundColor: '#10b981',
  },
  leaveButton: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
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
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    color: '#1e293b',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  closeButtonText: {
    color: '#a21caf',
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
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
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
    color: '#1e293b',
    fontSize: 16,
    fontWeight: '600',
  },
  participantRole: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 2,
  },
  participantStatus: {
    marginLeft: 10,
  },
});
