import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert } from 'react-native';
import {
  HMSInstance,
  HMSUpdateListenerActions,
  HMSUpdateListener,
} from '@100mslive/react-native-hms';

const hmsInstance = new HMSInstance();

export default function RoomsScreen() {
  const [roomCode, setRoomCode] = useState('687656dfa48ca61c46475db8');
  const [isJoined, setIsJoined] = useState(false);

  useEffect(() => {
    const listener = new HMSUpdateListener({
      onJoin: () => {
        console.log('Joined room');
        setIsJoined(true);
      },
      onLeave: () => {
        console.log('Left room');
        setIsJoined(false);
      },
      onError: (error) => {
        Alert.alert('Error', error?.description || 'Unknown error');
      },
      onPeerUpdate: (type, peer) => {
        console.log('Peer update', type, peer);
      },
    });

    hmsInstance.addEventListener(HMSUpdateListenerActions.ON_JOIN, listener.onJoin);
    hmsInstance.addEventListener(HMSUpdateListenerActions.ON_LEAVE, listener.onLeave);
    hmsInstance.addEventListener(HMSUpdateListenerActions.ON_ERROR, listener.onError);
    hmsInstance.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, listener.onPeerUpdate);

    return () => {
      hmsInstance.removeAllListeners();
    };
  }, []);

  const joinRoom = async () => {
    try {
      await hmsInstance.join({ roomCode });
    } catch (e) {
      Alert.alert('Join failed', e.message);
    }
  };

  const leaveRoom = async () => {
    try {
      await hmsInstance.leave();
    } catch (e) {
      Alert.alert('Leave failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Voice Chat Room</Text>
      <TextInput
        style={styles.input}
        value={roomCode}
        onChangeText={setRoomCode}
        placeholder="Enter Room Code"
      />
      {!isJoined ? (
        <Button title="Join Room" onPress={joinRoom} />
      ) : (
        <Button title="Leave Room" onPress={leaveRoom} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    borderRadius: 8,
  },
});
