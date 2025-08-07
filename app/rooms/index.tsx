// app/rooms/index.tsx
import React, { useState, useRef } from 'react';
import { Button, Alert, SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native';
import { ArrowLeft, Home } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { 
  HMSSDK, 
  HMSUpdateListenerActions 
} from '@100mslive/react-native-hms';

const RoomScreen = () => {
  const hmsInstanceRef = useRef<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  const joinRoom = async () => {
    try {
      setIsConnecting(true);
      const hmsInstance = await HMSSDK.build();
      hmsInstanceRef.current = hmsInstance;

      // Event Listeners
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, () => {
        console.log('✅ Successfully joined room');
        setIsConnecting(false);
        Alert.alert('Success', 'Joined voice room successfully!');
      });
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, (error: any) => {
        console.error('❌ HMS Error:', error);
        setIsConnecting(false);
        Alert.alert('Error', `HMS Error: ${error.description || error.message}`);
      });

      // Try different HMS joining approaches
      console.log('🔗 Attempting to join with room ID...');
      
      // Try voice chat specific roles first
      const rolesToTry = [
        'listener', 'speaker', 'moderator',  // Voice chat specific roles
        'viewer', 'audience', 'participant', 'user', 'client', 
        'broadcaster', 'publisher', 'subscriber',
        'host', 'peer', 'member', 'attendee'
      ];
      let authToken = '';
      
      for (const role of rolesToTry) {
        try {
          console.log(`📡 Fetching auth token with role: ${role}...`);
          const res = await fetch('http://localhost:3001/get-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              user_id: 'dream-user-001',
              role: role,
              room_id: '687656dfa48ca61c46475db8',
            }),
          });
          
          if (!res.ok) {
            console.log(`❌ HTTP error for role ${role}:`, res.status);
            continue;
          }
          
          const data = await res.json();
          
          if (data.token) {
            authToken = String(data.token);
            console.log(`✅ Got auth token with role ${role}:`, authToken.substring(0, 50) + '...');
            break; // Successfully got token, exit loop
          } else {
            console.log(`❌ No token in response for role ${role}`);
          }
        } catch (roleError: any) {
          console.log(`❌ Role ${role} failed:`, roleError.message || roleError);
          continue; // Try next role
        }
      }
      
      // Also try using template ID instead of room ID for token generation
      if (!authToken) {
        console.log('🔄 Trying with template ID instead of room ID...');
        const templateRoles = ['listener', 'speaker', 'viewer', 'participant', 'user'];
        
        for (const role of templateRoles) {
          try {
            console.log(`📡 Fetching auth token with template ID and role: ${role}...`);
            const res = await fetch('http://localhost:3001/get-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: 'dream-user-001',
                role: role,
                room_id: '687656df03390326e61710d4', // Template ID instead
              }),
            });
            
            if (res.ok) {
              const data = await res.json();
              if (data.token) {
                authToken = String(data.token);
                console.log(`✅ Got auth token with template ID and role ${role}:`, authToken.substring(0, 50) + '...');
                break;
              }
            }
          } catch (templateError: any) {
            console.log(`❌ Template role ${role} failed:`, templateError.message || templateError);
          }
        }
      }
      
      if (!authToken) {
        throw new Error('Could not get authentication token with any role or room/template ID. Check HMS template role configuration.');
      }
      
      // Method 1: Try with ROOM ID + AUTH TOKEN + USERNAME
      try {
        await hmsInstance.join({ 
          roomCode: '687656dfa48ca61c46475db8',
          username: 'Dream User',
          authToken: authToken
        } as any);
        console.log('✅ Joined successfully with room ID + auth token');
        return;
      } catch (roomIdError) {
        console.log('❌ Room ID + auth token failed:', roomIdError);
      }
      
      // Method 2: Try with TEMPLATE ID + AUTH TOKEN + USERNAME
      console.log('🔗 Attempting to join with template ID...');
      try {
        await hmsInstance.join({ 
          roomCode: '687656df03390326e61710d4',
          username: 'Dream User',
          authToken: authToken
        } as any);
        console.log('✅ Joined successfully with template ID + auth token');
        return;
      } catch (templateError) {
        console.log('❌ Template ID + auth token failed:', templateError);
      }
      
      // Method 3: Try with ROOM NAME + AUTH TOKEN + USERNAME
      console.log('🔗 Attempting to join with room name...');
      try {
        await hmsInstance.join({ 
          roomCode: '976e2839-825f-4cbf-be92-e6c22174348',
          username: 'Dream User',
          authToken: authToken
        } as any);
        console.log('✅ Joined successfully with room name + auth token');
        return;
      } catch (roomNameError) {
        console.log('❌ Room name + auth token failed:', roomNameError);
      }
      
      // If all room code methods fail, try with auth token
      console.log('🔗 Attempting to join with auth token as fallback...');
      
      try {
        // GET TOKEN with confirmed room ID from dashboard
        const res = await fetch('http://localhost:3001/get-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: 'dream-user-001',
            role: 'host',
            room_id: '687656dfa48ca61c46475db8', // Confirmed from dashboard
          }),
        });
        const data = await res.json();
        console.log('TOKEN RESPONSE:', data);

        const authToken = String(data.token);
        const HMSConfig = (await import('@100mslive/react-native-hms')).HMSConfig;
        const hmsConfig = new HMSConfig({ 
          authToken: authToken,
          username: 'Dream User' 
        });
        
        await hmsInstance.join(hmsConfig);
        console.log('✅ Joined successfully with auth token');
        return;
        
      } catch (tokenError) {
        console.log('❌ Auth token failed:', tokenError);
        throw new Error('All join methods failed including auth token');
      }

    } catch (err) {
      console.error('❌ Failed to join room:', err);
      setIsConnecting(false);
      Alert.alert('Error', 'Could not join room.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with navigation */}
      <View style={styles.header}>
        <Pressable style={styles.navButton} onPress={() => router.back()}>
          <ArrowLeft color="#4f46e5" size={24} />
          <Text style={styles.navText}>Back</Text>
        </Pressable>
        
        <Text style={styles.title}>Voice Chat Room</Text>
        
        <Pressable style={styles.navButton} onPress={() => router.push('/(tabs)')}>
          <Home color="#4f46e5" size={24} />
          <Text style={styles.navText}>Home</Text>
        </Pressable>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <Button 
          title={isConnecting ? "🔄 Connecting..." : "🔊 Join Voice Room"} 
          onPress={joinRoom} 
          disabled={isConnecting}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  navText: {
    marginLeft: 4,
    color: '#4f46e5',
    fontWeight: '600',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
});

export default function VoiceChatScreen() {
  return <RoomScreen />;
}
