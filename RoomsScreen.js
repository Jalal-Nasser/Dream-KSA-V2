import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  TextInput,
  Alert,
  FlatList,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {
  HMSInstance,
  HMSUpdateListenerActions,
  HMSUpdateListener,
} from '@100mslive/react-native-hms';

const hmsInstance = new HMSInstance();

const SAMPLE_ROOMS = [
  {
    id: '1',
    code: '687656dfa48ca61c46475db8',
    title: 'Chill Zone',
    participants: 12,
    image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e',
  },
  {
    id: '2',
    code: 'room2code',
    title: 'Music Lovers',
    participants: 32,
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4',
  },
  {
    id: '3',
    code: 'room3code',
    title: 'Gaming Hub',
    participants: 18,
    image: 'https://images.unsplash.com/photo-1606851092370-476cc8ad8510',
  },
  {
    id: '4',
    code: 'room4code',
    title: 'Study Together',
    participants: 9,
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b',
  },
];

export default function RoomsScreen() {
  const [isJoined, setIsJoined] = useState(false);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const listener = new HMSUpdateListener({
      onJoin: () => {
        setIsJoined(true);
      },
      onLeave: () => {
        setIsJoined(false);
        setCurrentRoom(null);
      },
      onError: (error) => {
        Alert.alert('Error', error?.description || 'Unknown error');
      },
      onPeerUpdate: (type, peer) => {
        console.log('Peer update', type, peer);
      },
    });

    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_JOIN,
      listener.onJoin,
    );
    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_LEAVE,
      listener.onLeave,
    );
    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_ERROR,
      listener.onError,
    );
    hmsInstance.addEventListener(
      HMSUpdateListenerActions.ON_PEER_UPDATE,
      listener.onPeerUpdate,
    );

    return () => {
      hmsInstance.removeAllListeners();
    };
  }, []);

  const joinRoom = async (room) => {
    try {
      await hmsInstance.join({ roomCode: room.code });
      setCurrentRoom(room);
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

  const filteredRooms = SAMPLE_ROOMS.filter((room) =>
    room.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderRoom = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => joinRoom(item)}>
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.cardImage}
        imageStyle={styles.cardImageStyle}
      >
        <View style={styles.overlay} />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardParticipants}>
            {item.participants} online
          </Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Browse Rooms</Text>
      <TextInput
        style={styles.search}
        placeholder="Search rooms"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={filteredRooms}
        renderItem={renderRoom}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
      {isJoined && currentRoom ? (
        <View style={styles.joinedBanner}>
          <Text style={styles.joinedText}>Joined {currentRoom.title}</Text>
          <Button title="Leave" onPress={leaveRoom} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  search: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  list: {
    paddingBottom: 80,
  },
  column: {
    justifyContent: 'space-between',
  },
  card: {
    flex: 1,
    marginBottom: 16,
    marginHorizontal: 4,
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardImageStyle: {
    borderRadius: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  cardContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cardParticipants: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  joinedBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1f2937',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  joinedText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 8,
  },
});

