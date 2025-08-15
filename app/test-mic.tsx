import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';

// Test HMS SDK availability
let HMSSDK: any;
let hmsAvailable = false;

// try {
//   const hms = require('@100mslive/react-native-hms');
//   HMSSDK = hms.HMSSDK;
//   hmsAvailable = true;
//   console.log('✅ HMS SDK is available!');
// } catch (error) {
//   console.log('❌ HMS SDK not found:', error);
// }

export default function TestMicScreen() {
  const [hmsStatus, setHmsStatus] = useState('Checking...');
  const [hmsInstance, setHmsInstance] = useState<any>(null);

  useEffect(() => {
    testHMS();
  }, []);

  const testHMS = async () => {
    if (hmsAvailable && HMSSDK) {
      try {
        console.log('🔍 Testing HMS SDK initialization...');
        const instance = await HMSSDK.build();
        setHmsInstance(instance);
        setHmsStatus('✅ HMS SDK Ready - Real microphone available!');
        console.log('✅ HMS instance created successfully');
      } catch (error) {
        setHmsStatus('❌ HMS SDK Error: ' + error);
        console.error('❌ HMS initialization failed:', error);
      }
    } else {
      setHmsStatus('❌ HMS SDK not available - Simulation mode only');
    }
  };

  const testMicrophone = async () => {
    if (hmsInstance) {
      try {
        // Try to access local peer (this would work in a real room)
        Alert.alert('Microphone Test', 'HMS SDK is ready! Join a room to test real microphone.');
      } catch (error) {
        Alert.alert('Error', 'Microphone test failed: ' + error);
      }
    } else {
      Alert.alert('No HMS', 'HMS SDK not initialized');
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
        HMS Microphone Test
      </Text>
      
      <Text style={{ marginBottom: 20, textAlign: 'center' }}>
        {hmsStatus}
      </Text>
      
      <Button title="Test Microphone" onPress={testMicrophone} />
      
      <Text style={{ marginTop: 30, fontSize: 12, color: 'gray', textAlign: 'center' }}>
        HMS Available: {hmsAvailable ? 'Yes' : 'No'}{'\n'}
        HMS Instance: {hmsInstance ? 'Created' : 'None'}
      </Text>
    </View>
  );
}
