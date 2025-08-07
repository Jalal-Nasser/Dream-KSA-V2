// app/rooms/index.tsx
import React, { useState, useRef } from 'react';
import { Button, Alert, SafeAreaView } from 'react-native';
import { 
  HMSSDK, 
  HMSConfig, 
  HMSUpdateListenerActions 
} from '@100mslive/react-native-hms';

const RoomScreen = () => {
  const hmsInstanceRef = useRef<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const joinRoom = async () => {
    try {
      setIsConnecting(true);
      const hmsInstance = await HMSSDK.build();
      hmsInstanceRef.current = hmsInstance;

      // GET TOKEN
      const res = await fetch('http://192.168.1.9:4000/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'dream-user-001',
          role: 'host',
          room_id: '687656dfa48ca61c46475db8',
        }),
      });
      const data = await res.json();
      console.log('TOKEN RESPONSE:', data);

      // Defensive: handle string or nested token object
      let authToken = null;
      if (typeof data.token === 'string') {
        authToken = data.token;
      } else if (data.token && typeof data.token.token === 'string') {
        authToken = data.token.token;
      }

      if (!authToken) throw new Error('No token received');

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

      const hmsConfig = new HMSConfig({ 
        authToken,
        username: 'Dream User',
        
      });
      await hmsInstance.join(hmsConfig);

    } catch (err) {
      console.error('❌ Failed to join room:', err);
      setIsConnecting(false);
      Alert.alert('Error', 'Could not join room.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Button 
        title={isConnecting ? "🔄 Connecting..." : "🔊 Join Voice Room"} 
        onPress={joinRoom} 
        disabled={isConnecting}
      />
    </SafeAreaView>
  );
};

export default function () {
  return <RoomScreen />;
}
