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
  Dimensions,
  Image 
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
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  // User State
  const [isMuted, setIsMuted] = useState(true);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [userRole, setUserRole] = useState<'listener' | 'speaker' | 'moderator'>('listener');
  
  // Participants State - Sample data matching the screenshot
  const [participants, setParticipants] = useState<Participant[]>([
    {
      id: 'speaker-1',
      name: 'أحاديث عامة',
      role: 'speaker',
      isMuted: false,
      isHandRaised: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'speaker-2', 
      name: 'قعدة أصدقاء',
      role: 'speaker',
      isMuted: false,
      isHandRaised: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    {
      id: 'listener-1',
      name: 'نقاء',
      role: 'listener', 
      isMuted: true,
      isHandRaised: false,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
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

  const renderSpeaker = (participant: Participant) => (
    <View key={participant.id} style={styles.speakerCard}>
      <View style={styles.speakerHeader}>
        <View style={styles.liveIndicator}>
          <Text style={styles.liveText}>مباشر</Text>
        </View>
        <View style={styles.participantCounter}>
          <Users size={12} color="#fff" />
          <Text style={styles.counterText}>+{Math.floor(Math.random() * 50) + 10}</Text>
        </View>
      </View>
      <View style={styles.speakerAvatar}>
        <Avatar src={participant.avatar} fallback={participant.name.charAt(0)} size={80} />
        {participant.role === 'moderator' && (
          <View style={styles.crownBadge}>
            <Crown size={12} color="#fbbf24" />
          </View>
        )}
      </View>
      <Text style={styles.speakerName}>{participant.name}</Text>
      <View style={styles.speakerFooter}>
        <Text style={styles.speakerRole}>عام</Text>
        <Text style={styles.speakerRole}>عام</Text>
      </View>
    </View>
  );

  return (
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
              <Text style={styles.roomSubtitle}>اكتشف الغرف وابدأ الدردشة الصوتية</Text>
            </View>
            <Pressable onPress={() => setShowParticipants(true)} style={styles.headerButton}>
              <Users color="#a21caf" size={24} />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Text style={styles.searchPlaceholder}>ابحث عن الغرف أو الأصدقاء</Text>
          </View>

          {/* Speakers Section */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.speakersContainer}
            style={styles.speakersScrollView}
          >
            {participants
              .filter(p => p.role === 'speaker' || p.role === 'moderator')
              .map(renderSpeaker)}
          </ScrollView>

          {/* Create Room Button */}
          <Pressable style={styles.createRoomButton}>
            <Text style={styles.createRoomText}>إنشاء غرفة جديدة</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
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
    paddingTop: 20,
  },
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
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
  // Avatar styles
  avatarContainer: {
    position: 'relative',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarFallback: {
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#64748b',
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
});
