import React from 'react';
import { StyleSheet, Text, View, Image, Pressable } from 'react-native';
import { Users, Mic, Star, Heart } from 'lucide-react-native';

const RoomCard = ({ room }) => {
  return (
    <Pressable style={roomCardStyles.cardContainer}>
      {/* Header */}
      <View style={roomCardStyles.cardHeader}>
        <View style={roomCardStyles.usersCount}>
          <Users size={12} color="#fff" />
          <Text style={roomCardStyles.usersCountText}>+45</Text>
        </View>
        <View style={roomCardStyles.liveBadge}>
          <View style={roomCardStyles.liveDot} />
          <Text style={roomCardStyles.liveText}>مباشر</Text>
        </View>
      </View>

      {/* Profile Image */}
      <View style={roomCardStyles.profileImageContainer}>
        {/*
          Note: This assumes 'image' is a property of the room object.
          Replace the uri with the correct image URL from your data.
        */}
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
          style={roomCardStyles.profileImage}
        />
      </View>
      
      {/* Footer */}
      <View style={roomCardStyles.cardFooter}>
        <Text style={roomCardStyles.roomName}>{room?.name || 'نقاش تقني'}</Text>
        <View style={roomCardStyles.tagsContainer}>
          <View style={roomCardStyles.tag}>
            <Text style={roomCardStyles.tagText}>نقاش</Text>
          </View>
          <View style={roomCardStyles.tag}>
            <Text style={roomCardStyles.tagText}>عام</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const roomCardStyles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#1f2937',
    width: 160,
    height: 220,
    borderRadius: 24,
    padding: 12,
    marginHorizontal: 8,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  usersCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  usersCountText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginRight: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  profileImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: '#fff',
  },
  cardFooter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
    marginBottom: 4,
  },
  tagText: {
    color: '#fff',
    fontSize: 10,
  },
});

export default RoomCard;