import React, { useEffect, useState } from 'react';
import { 
  View, 
  Pressable, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  BackHandler,
  Platform 
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { HMSPrebuilt } from '@100mslive/react-native-room-kit';

export default function VoiceChat() {
  const { roomId, token, userName } = useLocalSearchParams<{ 
    roomId: string; 
    token: string; 
    userName: string; 
  }>();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  // Handle Android back button
  useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (isConnected) {
          Alert.alert(
            'Leave Room',
            'Are you sure you want to leave the voice room?',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Leave', style: 'destructive', onPress: handleLeave }
            ]
          );
          return true; // Prevent default back behavior
        }
        return false; // Allow default back behavior
      });

      return () => backHandler.remove();
    }
  }, [isConnected]);

  // Validate required params
  if (!token || !roomId || !userName) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Missing Information</Text>
          <Text style={styles.errorText}>
            Room ID, token, or user name is missing. Please try joining again.
          </Text>
          <Pressable 
            style={styles.goToJoinButton}
            onPress={() => router.push('/join')}
          >
            <Text style={styles.goToJoinButtonText}>Go to Join</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const handleLeave = () => {
    setIsConnected(false);
    router.back();
  };

  const handleHMSJoin = () => {
    setIsConnecting(true);
    // HMSPrebuilt will handle the connection automatically
    // We'll track the state via HMS events if needed
  };

  const handleHMSLeave = () => {
    setIsConnected(false);
    setIsConnecting(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Leave Button */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.roomTitle}>Voice Room</Text>
          <Text style={styles.roomId}>{roomId}</Text>
          <Text style={styles.userName}>Connected as: {userName}</Text>
        </View>
        <Pressable 
          style={styles.leaveButton}
          onPress={handleLeave}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </Pressable>
      </View>

      {/* 100ms Room Kit */}
      <View style={styles.roomContainer}>
        <HMSPrebuilt
          options={{
            userName: userName,
            authToken: token,
          }}
          onJoin={handleHMSJoin}
          onLeave={handleHMSLeave}
          onError={(error) => {
            console.error('HMS Error:', error);
            Alert.alert(
              'Connection Error',
              'Failed to connect to the voice room. Please try again.',
              [
                { text: 'OK', onPress: () => router.back() }
              ]
            );
          }}
        />
      </View>

      {/* Connection Status Overlay */}
      {isConnecting && (
        <View style={styles.statusOverlay}>
          <Text style={styles.statusText}>Connecting to room...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 10,
  },
  headerInfo: {
    flex: 1,
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  roomId: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  userName: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  leaveButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  leaveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  roomContainer: {
    flex: 1,
  },
  statusOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    zIndex: 20,
  },
  statusText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  goToJoinButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goToJoinButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
