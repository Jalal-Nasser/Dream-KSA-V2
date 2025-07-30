import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function RoomsScreen({ navigation }) {
  const testRoom = {
    id: 'test-room-123',
    name: 'Test Room',
  };

  const joinTestRoom = () => {
    navigation.navigate('VoiceChatScreen', { room: testRoom });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Rooms</Text>
      <Button title="Join Test Room" onPress={joinTestRoom} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, marginBottom: 20 },
});
