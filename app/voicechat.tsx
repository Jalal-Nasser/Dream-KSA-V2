// app/voicechat.tsx - Complete Voice Room Implementation
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
  Dimensions,
  Image,
  TextInput,
  TouchableOpacity,
  FlatList
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
  MessageCircle,
  Send,
  UserPlus,
  Share2,
  Volume2,
  VolumeX,
  MoreHorizontal
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Participant {
  id: string;
  name: string;
  role: 'listener' | 'speaker' | 'moderator';
  isMuted: boolean;
  isHandRaised: boolean;
  avatar?: string;
  isLocalUser?: boolean;
  isSpeaking?: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  userAvatar?: string;
}

// Simple Avatar Component
const Avatar = ({ src, fallback, size = 60 }: { src?: string; fallback: string; size?: number }) => (
  <View style={[styles.avatarContainer, { width: size, height: size, borderRadius: size / 2 }]}>
    {src ? (
      <Image source={{ uri: src }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size / 2 }]} />
    ) : (
      <View style={[styles.avatarFallback, { width: size, height: size, borderRadius: size / 2 }]}>
        <Text style={[styles.avatarText, { fontSize: size * 0.4 }]}>{fallback}</Text>
      </View>
    )}
  </View>
);

export default function VoiceRoomScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Room State
  const [roomName, setRoomName] = useState(params.roomName as string || 'الرئيسية');
  const [roomId, setRoomId] = useState(params.roomId as string || '1');
  const [isConnected, setIsConnected] = useState(true); // Simulated as connected
  const [isConnecting, setIsConnecting] = useState(false);
  
  // User State
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [userRole, setUserRole] = useState<'listener' | 'speaker' | 'moderator'>('moderator'); // Set as moderator for admin controls
  const [currentUserId, setCurrentUserId] = useState('user-1');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [micLevel, setMicLevel] = useState(0); // Audio level indicator
  
  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      userId: 'jalal-jj',
      userName: 'Jalal JJ',
      message: 'أهلا ومرحبا، عين غطا وعين فراش',
      timestamp: new Date(),
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  
  // Participants State - Sample data matching the screenshot
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'speaker-1',
      name: 'أحاديث عامة',
      role: 'speaker',
      isMuted: false,
      isHandRaised: false,
      isSpeaking: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'speaker-2', 
      name: 'قعدة أصدقاء',
      role: 'speaker',
      isMuted: false,
      isHandRaised: false,
      isSpeaking: false,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'listener-1',
      name: 'نقاء',
      role: 'listener', 
      isMuted: true,
      isHandRaised: true,
      isSpeaking: false,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b577?w=100&h=100&fit=crop&crop=face',
      isLocalUser: true
    },
    {
      id: 'listener-2',
      name: 'محمد',
      role: 'listener', 
      isMuted: true,
      isHandRaised: false,
      isSpeaking: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'listener-3',
      name: 'فاطمة',
      role: 'listener', 
      isMuted: true,
      isHandRaised: false,
      isSpeaking: false,
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    }
  ]);
  
  // UI State
  const [showParticipants, setShowParticipants] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

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

  const toggleMute = () => {
    setIsMuted((prev) => {
      const newMutedState = !prev;
      // Update local participant
      setParticipants(prevParticipants => 
        prevParticipants.map(p => 
          p.isLocalUser ? { ...p, isMuted: newMutedState, isSpeaking: newMutedState ? false : p.isSpeaking } : p
        )
      );
      
      // Stop speaking when muted
      if (newMutedState) {
        setIsSpeaking(false);
        setMicLevel(0);
      }
      
      // Show feedback
      Alert.alert(
        newMutedState ? 'تم كتم الميكروفون' : 'تم تشغيل الميكروفون',
        newMutedState ? 'لن يتمكن الآخرون من سماعك' : 'يمكن للآخرين سماعك الآن'
      );
      
      return newMutedState;
    });
  };

  // Simulate speaking when mic is active (for demo purposes)
  useEffect(() => {
    let speakingInterval: any;
    
    if (!isMuted && userRole !== 'listener') {
      // Simulate random speaking activity
      speakingInterval = setInterval(() => {
        const shouldSpeak = Math.random() > 0.7; // 30% chance to be speaking
        const newMicLevel = shouldSpeak ? Math.random() * 100 : 0;
        
        setIsSpeaking(shouldSpeak);
        setMicLevel(newMicLevel);
        
        // Update local participant
        setParticipants(prevParticipants => 
          prevParticipants.map(p => 
            p.isLocalUser ? { ...p, isSpeaking: shouldSpeak } : p
          )
        );
      }, 1000);
    } else {
      setIsSpeaking(false);
      setMicLevel(0);
    }
    
    return () => {
      if (speakingInterval) {
        clearInterval(speakingInterval);
      }
    };
  }, [isMuted, userRole]);

  const toggleHandRaise = () => {
    setIsHandRaised((prev) => {
      const newHandRaisedState = !prev;
      // Update local participant
      setParticipants(prevParticipants => 
        prevParticipants.map(p => 
          p.isLocalUser ? { ...p, isHandRaised: newHandRaisedState } : p
        )
      );
      return newHandRaisedState;
    });
  };

  // Admin Controls
  const muteParticipant = (participantId: string) => {
    if (userRole !== 'moderator') {
      Alert.alert('ليس لديك صلاحيات', 'فقط المشرفون يمكنهم كتم المشاركين');
      return;
    }
    
    setParticipants(prevParticipants => 
      prevParticipants.map(p => 
        p.id === participantId ? { ...p, isMuted: true, isSpeaking: false } : p
      )
    );
    
    Alert.alert('تم الكتم', `تم كتم المشارك بنجاح`);
  };

  const promoteToSpeaker = (participantId: string) => {
    if (userRole !== 'moderator') {
      Alert.alert('ليس لديك صلاحيات', 'فقط المشرفون يمكنهم ترقية المشاركين');
      return;
    }
    
    setParticipants(prevParticipants => 
      prevParticipants.map(p => 
        p.id === participantId ? { ...p, role: 'speaker', isHandRaised: false } : p
      )
    );
    
    Alert.alert('تمت الترقية', 'تم ترقية المشارك إلى متحدث');
  };

  const kickParticipant = (participantId: string) => {
    if (userRole !== 'moderator') {
      Alert.alert('ليس لديك صلاحيات', 'فقط المشرفون يمكنهم طرد المشاركين');
      return;
    }
    
    Alert.alert(
      'طرد المشارك',
      'هل أنت متأكد من طرد هذا المشارك؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'طرد', 
          style: 'destructive', 
          onPress: () => {
            setParticipants(prevParticipants => 
              prevParticipants.filter(p => p.id !== participantId)
            );
            Alert.alert('تم الطرد', 'تم طرد المشارك من الغرفة');
          }
        }
      ]
    );
  };

  // Invite functionality
  const invitePeople = () => {
    setShowInviteModal(true);
  };

  const shareRoomLink = () => {
    const roomLink = `https://dreams-ksa.app/room/${roomId}`;
    Alert.alert(
      'مشاركة الغرفة',
      `رابط الغرفة: ${roomLink}`,
      [
        { text: 'نسخ الرابط', onPress: () => Alert.alert('تم النسخ', 'تم نسخ رابط الغرفة') },
        { text: 'إغلاق', style: 'cancel' }
      ]
    );
  };

  // Chat functionality
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: currentUserId,
      userName: 'أنت',
      message: newMessage.trim(),
      timestamp: new Date(),
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const renderParticipant = (participant: Participant, index: number) => {
    const isAdmin = userRole === 'moderator';
    
    return (
      <TouchableOpacity 
        key={participant.id} 
        style={styles.avatarGridItem}
        onLongPress={() => {
          if (isAdmin && !participant.isLocalUser) {
            const alertOptions = [
              { text: 'إلغاء', style: 'cancel' as const },
              { text: 'كتم', onPress: () => muteParticipant(participant.id) },
            ];
            
            if (participant.role === 'listener' && participant.isHandRaised) {
              alertOptions.push({ text: 'ترقية لمتحدث', onPress: () => promoteToSpeaker(participant.id) });
            }
            
            alertOptions.push({ text: 'طرد', onPress: () => kickParticipant(participant.id) });
            
            Alert.alert(
              'إدارة المشارك',
              `${participant.name}`,
              alertOptions
            );
          }
        }}
      >
        <View style={styles.avatarWrapper}>
          <Avatar src={participant.avatar} fallback={participant.name.charAt(0)} size={60} />
          
          {/* Speaking indicator */}
          {participant.isSpeaking && (
            <View style={styles.speakingIndicator}>
              <View style={styles.speakingPulse} />
            </View>
          )}
          
          {/* Mic/Mute Icon */}
          <View style={styles.micIconWrapper}>
            {participant.isMuted ? (
              <MicOff size={18} color="#ef4444" />
            ) : (
              <Mic size={18} color="#22c55e" />
            )}
          </View>
          
          {/* Hand raised indicator */}
          {participant.isHandRaised && (
            <View style={styles.handRaisedIndicator}>
              <Hand size={16} color="#fbbf24" />
            </View>
          )}
          
          {/* Role badge */}
          {participant.role === 'moderator' && (
            <View style={styles.moderatorBadge}>
              <Crown size={12} color="#fff" />
            </View>
          )}
          
          {/* VIP badge example */}
          {index === 0 && (
            <View style={styles.vipBadge}>
              <Text style={styles.badgeText}>VIP</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.avatarName}>{participant.name}</Text>
        <Text style={styles.avatarNumber}>No.{index + 1}</Text>
        <View style={styles.avatarRoleRow}>
          <Text style={styles.avatarRole}>{participant.role}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={styles.chatMessageContainer}>
      <View style={styles.chatMessageHeader}>
        <Text style={styles.chatMessageUser}>{item.userName}</Text>
        <Text style={styles.chatMessageTime}>
          {item.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      <Text style={styles.chatMessageText}>{item.message}</Text>
    </View>
  );

  return (
    <LinearGradient
      colors={["#1e293b", "#0f172a"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <ArrowLeft color="#fff" size={24} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={styles.roomTitle}>{roomName}</Text>
            <View style={styles.participantCount}>
              <Users size={16} color="#94a3b8" />
              <Text style={styles.participantCountText}>{participants.length} مشارك</Text>
            </View>
            
            {/* Mic Status Indicator */}
            <View style={[
              styles.micStatusIndicator, 
              { backgroundColor: isMuted ? '#ef4444' : (isSpeaking ? '#22c55e' : '#fbbf24') }
            ]}>
              <Text style={styles.micStatusText}>
                {isMuted ? '🔇 مكتوم' : (isSpeaking ? '🎤 يتحدث' : '🎤 نشط')}
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <Pressable onPress={invitePeople} style={styles.headerButton}>
              <UserPlus color="#fff" size={20} />
            </Pressable>
            <Pressable onPress={() => setShowChatModal(true)} style={styles.headerButton}>
              <MessageCircle color="#fff" size={20} />
            </Pressable>
          </View>
        </View>

        {/* Participants Grid */}
        <ScrollView style={styles.participantsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.avatarGrid}>
            {participants.map((participant, index) => renderParticipant(participant, index))}
          </View>
        </ScrollView>

        {/* Bottom Controls */}
        <View style={styles.controlsContainer}>
          {/* Mic Level Indicator */}
          {!isMuted && (
            <View style={styles.micLevelContainer}>
              <Text style={styles.micLevelText}>
                {isSpeaking ? `🎤 يتحدث (${Math.round(micLevel)}%)` : '🎤 الميكروفون نشط'}
              </Text>
              <View style={styles.micLevelBar}>
                <View 
                  style={[
                    styles.micLevelFill, 
                    { 
                      width: `${micLevel}%`,
                      backgroundColor: micLevel > 50 ? '#22c55e' : micLevel > 20 ? '#fbbf24' : '#ef4444'
                    }
                  ]} 
                />
              </View>
            </View>
          )}
          
          <View style={styles.controlsRow}>
            {/* Mute/Unmute */}
            <Pressable 
              style={[
                styles.controlButton, 
                isMuted ? styles.mutedButton : styles.activeButton,
                isSpeaking && !isMuted && styles.speakingButton
              ]} 
              onPress={toggleMute}
            >
              {isMuted ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#fff" />}
              {isSpeaking && !isMuted && (
                <View style={styles.speakingButtonPulse} />
              )}
            </Pressable>
            
            {/* Manual Speak Test Button */}
            {!isMuted && (
              <Pressable 
                style={[styles.controlButton, styles.testSpeakButton]} 
                onPressIn={() => {
                  setIsSpeaking(true);
                  setMicLevel(75);
                  setParticipants(prev => prev.map(p => p.isLocalUser ? {...p, isSpeaking: true} : p));
                }}
                onPressOut={() => {
                  setIsSpeaking(false);
                  setMicLevel(0);
                  setParticipants(prev => prev.map(p => p.isLocalUser ? {...p, isSpeaking: false} : p));
                }}
              >
                <Text style={styles.testButtonText}>تحدث</Text>
              </Pressable>
            )}
            
            {/* Raise Hand */}
            <Pressable 
              style={[styles.controlButton, isHandRaised ? styles.handRaisedButton : styles.normalButton]} 
              onPress={toggleHandRaise}
            >
              <Hand size={24} color="#fff" />
            </Pressable>
            
            {/* Share Room */}
            <Pressable style={styles.controlButton} onPress={shareRoomLink}>
              <Share2 size={24} color="#fff" />
            </Pressable>
            
            {/* Leave Room */}
            <Pressable style={[styles.controlButton, styles.leaveButton]} onPress={leaveRoom}>
              <LogOut size={24} color="#fff" />
            </Pressable>
          </View>
          
          {userRole === 'moderator' && (
            <Text style={styles.adminLabel}>🔧 أدوات المشرف متاحة - اضغط مطولاً على المشاركين</Text>
          )}
        </View>

        {/* Invite Modal */}
        <Modal visible={showInviteModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>دعوة أشخاص</Text>
              <Pressable style={styles.modalOption} onPress={shareRoomLink}>
                <Share2 size={20} color="#4f46e5" />
                <Text style={styles.modalOptionText}>مشاركة رابط الغرفة</Text>
              </Pressable>
              <Pressable style={styles.modalCancel} onPress={() => setShowInviteModal(false)}>
                <Text style={styles.modalCancelText}>إغلاق</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Chat Modal */}
        <Modal visible={showChatModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.chatModalContent}>
              <View style={styles.chatHeader}>
                <Text style={styles.chatTitle}>الدردشة</Text>
                <Pressable onPress={() => setShowChatModal(false)}>
                  <Text style={styles.chatCloseButton}>✕</Text>
                </Pressable>
              </View>
              
              <FlatList
                data={chatMessages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id}
                style={styles.chatList}
                showsVerticalScrollIndicator={false}
              />
              
              <View style={styles.chatInputContainer}>
                <TextInput
                  style={styles.chatInput}
                  placeholder="اكتب رسالة..."
                  placeholderTextColor="#94a3b8"
                  value={newMessage}
                  onChangeText={setNewMessage}
                  multiline
                />
                <Pressable style={styles.sendButton} onPress={sendMessage}>
                  <Send size={20} color="#fff" />
                </Pressable>
              </View>
            </View>
          </View>
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
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  roomTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  participantCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  participantCountText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  micStatusIndicator: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 4,
  },
  micStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  participantsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  avatarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  avatarGridItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  avatarWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakingIndicator: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#22c55e',
  },
  speakingPulse: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#22c55e',
    opacity: 0.5,
  },
  micIconWrapper: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    elevation: 2,
  },
  handRaisedIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    padding: 4,
  },
  moderatorBadge: {
    position: 'absolute',
    top: -8,
    left: -8,
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    padding: 4,
  },
  vipBadge: {
    position: 'absolute',
    top: -12,
    left: -12,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 10,
  },
  avatarName: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  avatarNumber: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 4,
    textAlign: 'center',
  },
  avatarRoleRow: {
    alignItems: 'center',
  },
  avatarRole: {
    color: '#94a3b8',
    fontSize: 10,
  },
  controlsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  micLevelContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  micLevelText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  micLevelBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  micLevelFill: {
    height: '100%',
    borderRadius: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  activeButton: {
    backgroundColor: '#22c55e',
  },
  mutedButton: {
    backgroundColor: '#ef4444',
  },
  speakingButton: {
    backgroundColor: '#22c55e',
    shadowColor: '#22c55e',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
  },
  speakingButtonPulse: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: '#22c55e',
    opacity: 0.6,
  },
  testSpeakButton: {
    backgroundColor: '#7c3aed',
    width: 60,
    height: 50,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  handRaisedButton: {
    backgroundColor: '#fbbf24',
  },
  normalButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  leaveButton: {
    backgroundColor: '#ef4444',
  },
  adminLabel: {
    color: '#fbbf24',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  // Avatar styles
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarFallback: {
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: width * 0.8,
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1f2937',
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    marginBottom: 12,
  },
  modalOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  modalCancel: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  // Chat modal styles
  chatModalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: width * 0.9,
    height: height * 0.7,
    maxHeight: 600,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  chatCloseButton: {
    fontSize: 20,
    color: '#6b7280',
    padding: 4,
  },
  chatList: {
    flex: 1,
    padding: 16,
  },
  chatMessageContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  chatMessageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatMessageUser: {
    fontWeight: 'bold',
    color: '#4f46e5',
    fontSize: 14,
  },
  chatMessageTime: {
    color: '#6b7280',
    fontSize: 12,
  },
  chatMessageText: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
    color: '#374151',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Legacy styles for compatibility
  centeredCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    flex: 1,
  },
  roomSubtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchPlaceholder: {
    color: '#94a3b8',
    fontSize: 16,
    textAlign: 'center',
  },
  speakersScrollView: {
    marginBottom: 24,
  },
  speakersContainer: {
    paddingHorizontal: 10,
    gap: 16,
  },
  speakerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 20,
    padding: 16,
    width: 160,
    alignItems: 'center',
    position: 'relative',
  },
  speakerHeader: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 1,
  },
  liveIndicator: {
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  participantCounter: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  counterText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  speakerAvatar: {
    position: 'relative',
    marginTop: 32,
    marginBottom: 16,
  },
  speakerName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  speakerFooter: {
    flexDirection: 'row',
    gap: 16,
  },
  speakerRole: {
    color: '#94a3b8',
    fontSize: 12,
  },
  createRoomButton: {
    backgroundColor: '#a21caf',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 'auto',
  },
  createRoomText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  crownBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fbbf24',
    borderRadius: 10,
    padding: 4,
  },
  chatArea: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 8,
    marginBottom: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  chatMessageBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    padding: 8,
    marginBottom: 4,
  },
});
