// app/voicechat_real.tsx - Real HMS Voice Chat Implementation
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useHMSRoom } from '../hooks/useHMSRoom';

const { width, height } = Dimensions.get('window');

export default function RealVoiceChatScreen() {
  const router = useRouter();
  const { roomId, userId, userName, role = 'guest' } = useLocalSearchParams();
  
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isGettingToken, setIsGettingToken] = useState(true);

  // Use real HMS integration
  const {
    isConnected,
    isConnecting,
    localPeer,
    remotePeers,
    isMuted,
    isHandRaised,
    isSpeaking,
    error,
    joinRoom,
    leaveRoom,
    toggleMute,
    raiseHand,
    muteRemotePeer,
    removePeer,
  } = useHMSRoom({
    roomId: roomId as string,
    userId: userId as string,
    userName: userName as string,
    role: role as string,
  });

  // Get HMS auth token from backend
  useEffect(() => {
    const getAuthToken = async () => {
      try {
        setIsGettingToken(true);
        
        const response = await fetch('http://localhost:3001/get-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            room_id: roomId,
            user_id: userId,
            role: role,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get auth token');
        }

        const data = await response.json();
        setAuthToken(data.token);
        
        // Auto-join room once we have the token
        await joinRoom(data.token);
        
      } catch (error: any) {
        console.error('Error getting auth token:', error);
        Alert.alert('خطأ في الاتصال', 'فشل في الحصول على رمز المصادقة');
      } finally {
        setIsGettingToken(false);
      }
    };

    if (roomId && userId) {
      getAuthToken();
    }
  }, [roomId, userId, role]);

  const handleLeaveRoom = async () => {
    Alert.alert(
      'مغادرة الغرفة',
      'هل أنت متأكد من رغبتك في مغادرة الغرفة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'مغادرة',
          style: 'destructive',
          onPress: async () => {
            await leaveRoom();
            router.back();
          },
        },
      ]
    );
  };

  const renderParticipant = (peer: any, isLocal = false) => (
    <View key={peer.peerID || 'local'} style={styles.participantCard}>
      <LinearGradient
        colors={peer.isSpeaking || (isLocal && isSpeaking) ? ['#4CAF50', '#45a049'] : ['#757575', '#616161']}
        style={styles.participantAvatar}
      >
        <Text style={styles.participantInitial}>
          {(peer.name || userName).charAt(0).toUpperCase()}
        </Text>
        {(peer.isSpeaking || (isLocal && isSpeaking)) && (
          <View style={styles.speakingIndicator}>
            <Ionicons name="radio-outline" size={12} color="#fff" />
          </View>
        )}
      </LinearGradient>
      
      <Text style={styles.participantName} numberOfLines={1}>
        {isLocal ? `${peer.name || userName} (أنت)` : peer.name}
      </Text>
      
      <View style={styles.participantStatus}>
        {(peer.audioTrack?.isMute() || (isLocal && isMuted)) && (
          <Ionicons name="mic-off" size={16} color="#f44336" />
        )}
        {peer.isHandRaised && (
          <Ionicons name="hand-left" size={16} color="#ff9800" />
        )}
      </View>

      {/* Admin controls for remote peers */}
      {!isLocal && role === 'admin' && (
        <View style={styles.adminControls}>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => muteRemotePeer(peer)}
          >
            <Ionicons name="mic-off" size={14} color="#f44336" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.adminButton}
            onPress={() => removePeer(peer)}
          >
            <Ionicons name="person-remove" size={14} color="#f44336" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  if (isGettingToken) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>جاري الاتصال بالخادم...</Text>
      </LinearGradient>
    );
  }

  if (isConnecting) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
        <Text style={styles.loadingText}>جاري الانضمام للغرفة...</Text>
      </LinearGradient>
    );
  }

  if (error && !isConnected) {
    return (
      <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.errorContainer}>
        <Ionicons name="warning" size={50} color="#f44336" />
        <Text style={styles.errorText}>خطأ في الاتصال</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>العودة</Text>
        </TouchableOpacity>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#1e3c72', '#2a5298']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLeaveRoom} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.roomTitle}>غرفة صوتية</Text>
          <Text style={styles.roomId}>#{roomId}</Text>
        </View>
        <View style={styles.connectionStatus}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? '#4CAF50' : '#f44336' }]} />
          <Text style={styles.statusText}>
            {isConnected ? 'متصل' : 'غير متصل'}
          </Text>
        </View>
      </View>

      {/* Participants */}
      <ScrollView style={styles.participantsContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>
          المشاركون ({1 + remotePeers.length})
        </Text>
        
        {/* Local peer */}
        {localPeer && renderParticipant(localPeer, true)}
        
        {/* Remote peers */}
        {remotePeers.map((peer: any) => renderParticipant(peer))}
        
        {remotePeers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={50} color="#9e9e9e" />
            <Text style={styles.emptyStateText}>لا يوجد مشاركون آخرون</Text>
          </View>
        )}
      </ScrollView>

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, isMuted ? styles.mutedButton : styles.activeButton]}
          onPress={toggleMute}
        >
          <Ionicons 
            name={isMuted ? "mic-off" : "mic"} 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.controlButtonText}>
            {isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, isHandRaised ? styles.activeButton : styles.inactiveButton]}
          onPress={raiseHand}
        >
          <Ionicons 
            name="hand-left" 
            size={24} 
            color="#fff" 
          />
          <Text style={styles.controlButtonText}>
            {isHandRaised ? 'إنزال اليد' : 'رفع اليد'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlButton, styles.leaveButton]}
          onPress={handleLeaveRoom}
        >
          <Ionicons name="call" size={24} color="#fff" />
          <Text style={styles.controlButtonText}>مغادرة</Text>
        </TouchableOpacity>
      </View>

      {/* Real-time status */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons 
            name={isSpeaking ? "radio" : "radio-outline"} 
            size={16} 
            color={isSpeaking ? "#4CAF50" : "#9e9e9e"} 
          />
          <Text style={styles.statusItemText}>
            {isSpeaking ? 'تتحدث' : 'صامت'}
          </Text>
        </View>
        
        <View style={styles.statusItem}>
          <Ionicons 
            name="people" 
            size={16} 
            color="#fff" 
          />
          <Text style={styles.statusItemText}>
            {1 + remotePeers.length} مشارك
          </Text>
        </View>
        
        {role === 'admin' && (
          <View style={styles.statusItem}>
            <Ionicons name="shield-checkmark" size={16} color="#ff9800" />
            <Text style={styles.statusItemText}>مدير</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    textAlign: 'center',
  },
  errorMessage: {
    color: '#ffcccb',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#f44336',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  roomTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  roomId: {
    color: '#b3e5fc',
    fontSize: 14,
    marginTop: 2,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
  },
  participantsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  participantCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  participantInitial: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  speakingIndicator: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantName: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 15,
  },
  participantStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  adminControls: {
    flexDirection: 'row',
  },
  adminButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(244, 67, 54, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: '#9e9e9e',
    fontSize: 16,
    marginTop: 10,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  controlButton: {
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    minWidth: 100,
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  mutedButton: {
    backgroundColor: '#f44336',
  },
  leaveButton: {
    backgroundColor: '#f44336',
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusItemText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
});
