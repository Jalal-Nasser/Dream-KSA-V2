// app/rooms/voicechat.tsx

import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Button } from 'react-native';
import { 
  HMSSDK, 
  HMSConfig, 
  HMSUpdateListenerActions 
} from '@100mslive/react-native-hms';

const RoomScreen = () => {
  const hmsInstanceRef = useRef<any>(null);
  const [isConnected, setIsConnected] = useState(false);

  const joinRoom = async () => {
    try {
      // Create HMS instance
      const hmsInstance = await HMSSDK.build();
      hmsInstanceRef.current = hmsInstance;

      // Get token from your server
      const response = await fetch('http://192.168.1.9:4000/get-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'user_' + Date.now(),
          role: 'host',
          room_id: '687656dfa48ca61c46475db8',
        }),
      });

      const { token } = await response.json();

      // Add event listeners
      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, (data: any) => {
        console.log('✅ Successfully joined room');
        setIsConnected(true);
      });

      hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, (error: any) => {
        console.error('❌ HMS Error:', error);
      });

      // Join the room
      const hmsConfig = new HMSConfig({ 
        authToken: token.token, 
        username: 'Dreamer' 
      });
      
      await hmsInstance.join(hmsConfig);

    } catch (error) {
      console.error('❌ Join room failed:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {!isConnected ? (
        <Button title="Join Room" onPress={joinRoom} />
      ) : (
        <Text>✅ Connected to voice room!</Text>
      )}
    </View>
  );
};

export default function VoiceChatPage() {
  return <RoomScreen />;
}
