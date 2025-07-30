import React, { useEffect, useRef } from 'react';
import { View, Text, FlatList, Button, StyleSheet, Alert, Vibration } from 'react-native';
import {
  HMSRoomProvider,
  useHMSActions,
  useHMSStore,
  selectPeers,
  selectLocalPeer
} from '@100mslive/react-native-hms';
import { supabase } from './lib/supabase';

function AdminControls({ navigation }) {
  const hmsActions = useHMSActions();
  const peers = useHMSStore(selectPeers);
  const localPeer = useHMSStore(selectLocalPeer);
  const previousHands = useRef(new Set());

  useEffect(() => {
    const currentHands = new Set(peers.filter(p => p.metadata?.handRaised).map(p => p.peerID));
    for (const peerID of currentHands) {
      if (!previousHands.current.has(peerID)) {
        Vibration.vibrate(200);
        const peer = peers.find(p => p.peerID === peerID);
        if (peer) Alert.alert('Hand Raised', `${peer.name} raised their hand`);
      }
    }
    previousHands.current = currentHands;
  }, [peers]);

  if (localPeer?.roleName !== 'admin') {
    return (
      <View style={styles.container}>
        <Text style={styles.warning}>You are not an admin. Access denied.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  const approveSpeaker = async (peer) => {
    try {
      await hmsActions.changeRole(peer.peerID, 'speaker', true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const kickUser = async (peer) => {
    try {
      await hmsActions.removePeer(peer.peerID, 'You have been removed by the admin.');
      Alert.alert(`${peer.name} has been removed from the room`);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const banUser = async (peer) => {
    try {
      // Add banned user to Supabase "banned_users" table
      const { error } = await supabase.from('banned_users').insert([{ user_id: peer.customerUserID }]);
      if (error) throw error;

      await hmsActions.removePeer(peer.peerID, 'You have been banned by the admin.');
      Alert.alert(`${peer.name} has been banned and cannot rejoin.`);
    } catch (error) {
      Alert.alert('Ban Failed', error.message);
    }
  };

  const promoteAllRaisedHands = async () => {
    const raised = peers.filter(p => p.metadata?.handRaised);
    for (const peer of raised) {
      try {
        await hmsActions.changeRole(peer.peerID, 'speaker', true);
      } catch (error) {
        console.error('Failed to promote', peer.name, error);
      }
    }
    Alert.alert('All raised hands promoted to speakers');
  };

  const demoteAllSpeakers = async () => {
    const speakers = peers.filter(p => p.roleName === 'speaker');
    for (const peer of speakers) {
      try {
        await hmsActions.changeRole(peer.peerID, 'listener', true);
      } catch (error) {
        console.error('Failed to demote', peer.name, error);
      }
    }
    Alert.alert('All speakers moved back to listeners');
  };

  const forceMuteAll = async () => {
    for (const peer of peers) {
      if (!peer.isLocal && peer.roleName !== 'admin') {
        try {
          await hmsActions.setRemoteTracksEnabled(peer.peerID, false, 'audio');
        } catch (error) {
          console.error('Failed to mute', peer.name, error);
        }
      }
    }
    Alert.alert('All participants muted');
  };

  const muteSpeaker = async (peer) => {
    try {
      await hmsActions.setRemoteTracksEnabled(peer.peerID, false, 'audio');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const moveToListener = async (peer) => {
    try {
      await hmsActions.changeRole(peer.peerID, 'listener', true);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const lowerAllHands = async () => {
    const raised = peers.filter(p => p.metadata?.handRaised);
    for (const peer of raised) {
      try {
        await hmsActions.changeMetadata(peer.peerID, { ...peer.metadata, handRaised: false });
      } catch (error) {
        console.error('Failed to lower hand for', peer.name, error);
      }
    }
    Alert.alert('All hands lowered');
  };

  const raisedHands = peers
    .filter(p => p.metadata?.handRaised)
    .sort((a, b) => (a.metadata.handRaisedAt || 0) - (b.metadata.handRaisedAt || 0));
  const speakers = peers.filter(p => p.roleName === 'speaker');

  const renderPeerRow = (peer, showApprove) => (
    <View style={styles.peerRow}>
      <Text style={styles.peerName}>
        {peer.name} {peer.metadata?.handRaised ? '✋' : ''}
      </Text>
      {showApprove && (
        <>
          <Button title="Approve" onPress={() => approveSpeaker(peer)} />
          <Button title="Kick" onPress={() => kickUser(peer)} />
          <Button title="Ban" onPress={() => banUser(peer)} />
        </>
      )}
      {!showApprove && (
        <>
          <Button title="Mute" onPress={() => muteSpeaker(peer)} />
          <Button title="Move to Listener" onPress={() => moveToListener(peer)} />
          <Button title="Kick" onPress={() => kickUser(peer)} />
          <Button title="Ban" onPress={() => banUser(peer)} />
        </>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Controls</Text>
      <Button title="Force Mute All" onPress={forceMuteAll} />

      <Text style={styles.subtitle}>Speaker Queue:</Text>
      {raisedHands.length > 0 && (
        <>
          <Button title="Promote All Raised Hands" onPress={promoteAllRaisedHands} />
          <Button title="Lower All Hands" onPress={lowerAllHands} />
        </>
      )}
      <FlatList
        data={raisedHands}
        keyExtractor={(peer) => peer.peerID}
        renderItem={({ item }) => renderPeerRow(item, true)}
        ListEmptyComponent={<Text>No raised hands</Text>}
      />

      <Text style={styles.subtitle}>Speakers:</Text>
      {speakers.length > 0 && (
        <Button title="Demote All Speakers" onPress={demoteAllSpeakers} />
      )}
      <FlatList
        data={speakers}
        keyExtractor={(peer) => peer.peerID}
        renderItem={({ item }) => renderPeerRow(item, false)}
        ListEmptyComponent={<Text>No active speakers</Text>}
      />

      <Button title="Close" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default function AdminControlsScreen(props) {
  return (
    <HMSRoomProvider>
      <AdminControls {...props} />
    </HMSRoomProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  warning: { fontSize: 16, color: 'red', marginBottom: 10 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  peerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 5 },
  peerName: { fontSize: 14, marginRight: 8 }
});
