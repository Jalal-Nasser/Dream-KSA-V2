import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Alert, 
  SafeAreaView,
  ImageBackground,
  Dimensions,
  ScrollView
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Users, 
  Settings,
  PhoneOff,
  Volume2,
  VolumeX
} from 'lucide-react-native';
import { useHMSRoom } from '../hooks/useHMSRoom';

const { width, height } = Dimensions.get('window');

export default function CustomizableVoiceChatScreen() {
  const router = useRouter();
  const { roomId, roomName } = useLocalSearchParams<{ roomId: string; roomName: string }>();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joinAttempted, setJoinAttempted] = useState(false);
  
  const {
    isConnected,
    isMuted,
    localPeer,
    remotePeers,
    joinRoom,
    leaveRoom,
    toggleMute,
  } = useHMSRoom({ 
    roomId: roomId || '', 
    userId: 'user-' + Date.now(), 
    userName: roomName || 'مستخدم',
    role: 'listener'
  });

  // Mock values for features not yet implemented in useHMSRoom
  const isDeafened = false;
  const participants = [
    { 
      name: localPeer?.name || 'أنت', 
      isLocal: true, 
      audioTrack: { isMute: isMuted } // Use isMuted state directly instead of localPeer.audioTrack
    },
    ...(remotePeers || []).map((peer: any, index: number) => ({
      name: peer?.name || `مشارك ${index + 1}`,
      isLocal: false,
      audioTrack: { isMute: peer?.audioTrack?.isMute?.() ?? peer?.isMuted ?? false }
    }))
  ];

  const toggleDeafen = async () => {
    // TODO: Implement deafen functionality
  };

  // Fetch room details including customization
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await fetch(`http://192.168.1.9:3001/room/${roomId}`);
        const data = await response.json();
        setRoomData(data);
      } catch (error) {
        console.error('Failed to fetch room data:', error);
        Alert.alert('خطأ', 'فشل في تحميل بيانات الغرفة');
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchRoomData();
    }
  }, [roomId]);

  // Auto-join room when component mounts
  useEffect(() => {
    const autoJoinRoom = async () => {
      if (roomId && !isConnected && !loading && !joinAttempted) {
        setJoinAttempted(true);
        try {
          // Get auth token from backend
          const response = await fetch('http://192.168.1.9:3001/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: 'user-' + Date.now(),
              room_id: roomId,
              role: 'listener',
              user_name: roomName || 'مستخدم'
            }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (data.token) {
            await joinRoom(data.token);
          } else {
            Alert.alert('خطأ', 'فشل في الحصول على رمز المصادقة');
          }
        } catch (error) {
          console.error('Auto-join failed:', error);
          Alert.alert('خطأ', 'فشل في الانضمام للغرفة');
          setJoinAttempted(false); // Reset on error to allow retry
        }
      }
    };

    // Only join if we have roomId, not connected, and not loading
    if (roomId && !loading && !joinAttempted) {
      autoJoinRoom();
    }
  }, [roomId, loading, joinAttempted]); // Remove dependencies that change frequently

  const handleLeaveRoom = async () => {
    Alert.alert(
      'مغادرة الغرفة',
      'هل أنت متأكد من مغادرة الغرفة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مغادرة',
          style: 'destructive',
          onPress: () => {
            leaveRoom();
            router.back();
          }
        }
      ]
    );
  };

  const theme = roomData?.theme || '#4f46e5';
  const backgroundImage = roomData?.background_image;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1F2937', '#111827']} style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري تحميل الغرفة...</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Safety check for required data
  if (!roomId) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1F2937', '#111827']} style={styles.loadingContainer}>
          <Text style={styles.loadingText}>خطأ: معرف الغرفة مفقود</Text>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const backgroundContent = (
    <LinearGradient
      colors={[theme + '20', theme + '10', '#1F2937']}
      style={styles.container}
    >
      {/* Header */}
      <SafeAreaView>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </Pressable>
          
          <View style={styles.headerCenter}>
            <Text style={styles.roomName}>{roomData?.name || roomName}</Text>
            <Text style={styles.participantCount}>
              <Users size={16} color="white" />
              {' '}{participants.length} مشارك
            </Text>
          </View>
          
          <Pressable style={styles.headerButton}>
            <Settings color="white" size={24} />
          </Pressable>
        </View>
      </SafeAreaView>

      {/* Room Banner */}
      {roomData?.banner_image && (
        <View style={styles.bannerContainer}>
          <ImageBackground
            source={{ uri: roomData.banner_image }}
            style={styles.banner}
            imageStyle={styles.bannerImage}
          >
            <LinearGradient
              colors={['transparent', theme + '80']}
              style={styles.bannerOverlay}
            />
          </ImageBackground>
        </View>
      )}

      {/* Main Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Connection Status */}
        <View style={[styles.statusCard, { borderColor: theme }]}>
          <View style={styles.statusHeader}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: isConnected ? '#10b981' : '#ef4444' }
            ]} />
            <Text style={styles.statusText}>
              {isConnected ? 'متصل' : 'غير متصل'}
            </Text>
          </View>
          
          {roomData?.description && (
            <Text style={styles.roomDescription}>{roomData.description}</Text>
          )}
        </View>

        {/* Participants List */}
        <View style={[styles.participantsCard, { borderColor: theme }]}>
          <Text style={styles.cardTitle}>المشاركون ({participants.length})</Text>
          <View style={styles.participantsList}>
            {participants.map((participant, index) => (
              <View key={index} style={styles.participantItem}>
                <View style={[styles.participantAvatar, { backgroundColor: theme }]}>
                  <Text style={styles.participantInitial}>
                    {participant?.name?.[0] || 'م'}
                  </Text>
                </View>
                <View style={styles.participantInfo}>
                  <Text style={styles.participantName}>
                    {participant?.name || `مشارك ${index + 1}`}
                  </Text>
                  <Text style={styles.participantRole}>
                    {participant?.isLocal ? 'أنت' : 'مشارك'}
                  </Text>
                </View>
                <View style={styles.participantStatus}>
                  {participant?.audioTrack?.isMute ? (
                    <MicOff size={16} color="#ef4444" />
                  ) : (
                    <Mic size={16} color="#10b981" />
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Controls */}
      <View style={[styles.controls, { backgroundColor: theme + '20' }]}>
        <Pressable
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={toggleMute}
        >
          {isMuted ? (
            <MicOff size={24} color="white" />
          ) : (
            <Mic size={24} color="white" />
          )}
        </Pressable>

        <Pressable
          style={[styles.controlButton, isDeafened && styles.controlButtonActive]}
          onPress={toggleDeafen}
        >
          {isDeafened ? (
            <VolumeX size={24} color="white" />
          ) : (
            <Volume2 size={24} color="white" />
          )}
        </Pressable>

        <Pressable
          style={[styles.controlButton, styles.leaveButton]}
          onPress={handleLeaveRoom}
        >
          <PhoneOff size={24} color="white" />
        </Pressable>
      </View>
    </LinearGradient>
  );

  // If there's a background image, wrap with ImageBackground
  if (backgroundImage) {
    return (
      <ImageBackground
        source={{ uri: backgroundImage }}
        style={styles.container}
        imageStyle={styles.backgroundImageStyle}
      >
        <View style={styles.backgroundOverlay}>
          {backgroundContent}
        </View>
      </ImageBackground>
    );
  }

  return backgroundContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  backgroundImageStyle: {
    opacity: 0.3,
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  roomName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  participantCount: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerContainer: {
    height: 120,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  banner: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  bannerImage: {
    borderRadius: 12,
  },
  bannerOverlay: {
    height: 60,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statusCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  roomDescription: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 20,
  },
  participantsCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 100,
    borderWidth: 1,
  },
  cardTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  participantsList: {
    gap: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 12,
    borderRadius: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  participantInitial: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  participantStatus: {
    padding: 4,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlButtonActive: {
    backgroundColor: '#ef4444',
  },
  leaveButton: {
    backgroundColor: '#ef4444',
  },
});
