import React from 'react';
import { StyleSheet, Text, View, Pressable, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Mic,
  Share2,
  Gift,
  Plus,
  Send,
  Star,
  MessageCircle,
  Settings,
  Users,
} from 'lucide-react-native';
import * as Progress from 'react-native-progress';
import { MotiView } from 'moti';

// Placeholder for the custom UI elements
const MemberCard = ({ user, isHost }) => (
  <View style={voiceRoomStyles.memberCard}>
    <View style={voiceRoomStyles.memberImageContainer}>
      <Image source={{ uri: user.avatar }} style={voiceRoomStyles.memberImage} />
      {isHost && (
        <View style={voiceRoomStyles.hostBadge}>
          <Star color="#FBBF24" size={12} />
        </View>
      )}
    </View>
    <Text style={voiceRoomStyles.memberName}>{user.name}</Text>
    {user.isSpeaking && (
      <MotiView
        from={{ scale: 1 }}
        animate={{ scale: 1.1 }}
        transition={{ loop: true, type: 'timing', duration: 800 }}
        style={voiceRoomStyles.speakingIndicator}
      />
    )}
  </View>
);

const ChatBubble = ({ message }) => (
  <View style={voiceRoomStyles.chatBubbleContainer}>
    <Text style={voiceRoomStyles.chatBubbleText}>{message.text}</Text>
  </View>
);

export default function VoiceRoom() {
  const insets = useSafeAreaInsets();

  // Dummy data for demonstration
  const members = [
    { id: 1, name: 'عبدالله', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face', isHost: true, isSpeaking: false },
    { id: 2, name: 'سارة', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c58c?w=128&h=128&fit=crop&crop=face', isHost: false, isSpeaking: true },
    { id: 3, name: 'علي', avatar: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936791?w=128&h=128&fit=crop&crop=face', isHost: false, isSpeaking: false },
    { id: 4, name: 'فاطمة', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=128&h=128&fit=crop&crop=face', isHost: false, isSpeaking: false },
    { id: 5, name: 'محمد', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=face', isHost: false, isSpeaking: false },
  ];

  const messages = [
    { id: 1, text: 'مرحبا بكم في الغرفة!' },
    { id: 2, text: 'نقاش ممتع!' },
    { id: 3, text: 'ممكن أحد يشرح الفكرة أكثر؟' },
  ];

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      style={[voiceRoomStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Header */}
      <View style={voiceRoomStyles.header}>
        <Pressable style={voiceRoomStyles.headerButton}>
          <X color="white" size={24} />
        </Pressable>
        <View style={voiceRoomStyles.headerCenter}>
          <Text style={voiceRoomStyles.roomName}>غرفة نقاش التقنية</Text>
          <Text style={voiceRoomStyles.roomSubtitle}>معادلة النمو</Text>
        </View>
        <Pressable style={voiceRoomStyles.headerButton}>
          <Share2 color="white" size={24} />
        </Pressable>
      </View>

      {/* Room Details */}
      <View style={voiceRoomStyles.roomDetails}>
        <View style={voiceRoomStyles.roomTags}>
          <View style={voiceRoomStyles.tag}>
            <Text style={voiceRoomStyles.tagText}>#تقنية</Text>
          </View>
          <View style={voiceRoomStyles.tag}>
            <Text style={voiceRoomStyles.tagText}>#مجتمع</Text>
          </View>
        </View>
        <View style={voiceRoomStyles.roomStats}>
          <Users color="#9ca3af" size={16} />
          <Text style={voiceRoomStyles.roomStatsText}>45</Text>
          <Mic color="#9ca3af" size={16} style={{ marginLeft: 16 }} />
          <Text style={voiceRoomStyles.roomStatsText}>4</Text>
        </View>
      </View>

      {/* Members List */}
      <ScrollView horizontal contentContainerStyle={voiceRoomStyles.membersScroll}>
        {members.map((member) => (
          <MemberCard key={member.id} user={member} isHost={member.isHost} />
        ))}
      </ScrollView>

      {/* Gifts & Progress */}
      <View style={voiceRoomStyles.giftContainer}>
        <Pressable style={voiceRoomStyles.giftButton}>
          <Gift color="white" size={24} />
        </Pressable>
        <View style={voiceRoomStyles.progressContainer}>
          <Text style={voiceRoomStyles.progressText}>مستوى الغرفة</Text>
          <Progress.Bar progress={0.5} width={null} color="#3b82f6" unfilledColor="#374151" borderColor="transparent" height={8} />
          <Text style={voiceRoomStyles.progressLevel}>50%</Text>
        </View>
      </View>

      {/* Chat Section */}
      <ScrollView style={voiceRoomStyles.chatContainer}>
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
      </ScrollView>

      {/* Controls & Input */}
      <View style={voiceRoomStyles.footer}>
        <View style={voiceRoomStyles.controls}>
          <Pressable style={voiceRoomStyles.controlButton}>
            <Mic color="white" size={24} />
          </Pressable>
          <Pressable style={voiceRoomStyles.controlButton}>
            <Settings color="white" size={24} />
          </Pressable>
          <Pressable style={voiceRoomStyles.controlButton}>
            <Star color="white" size={24} />
          </Pressable>
        </View>
        <View style={voiceRoomStyles.chatInputContainer}>
          <Pressable style={voiceRoomStyles.chatSendButton}>
            <Send color="white" size={24} />
          </Pressable>
          <TextInput
            style={voiceRoomStyles.chatInput}
            placeholder="أرسل رسالة..."
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const voiceRoomStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  roomName: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  roomSubtitle: {
    color: '#9ca3af',
    fontSize: 14,
  },
  roomDetails: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  roomTags: {
    flexDirection: 'row-reverse',
  },
  tag: {
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginLeft: 8,
  },
  tagText: {
    color: '#e5e7eb',
    fontSize: 12,
  },
  roomStats: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginLeft: 16,
  },
  roomStatsText: {
    color: '#9ca3af',
    fontSize: 12,
    marginLeft: 4,
  },
  membersScroll: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  memberCard: {
    alignItems: 'center',
    marginHorizontal: 12,
  },
  memberImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberImage: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  hostBadge: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#374151',
    padding: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FBBF24',
  },
  memberName: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
  },
  speakingIndicator: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    position: 'absolute',
    opacity: 0.5,
  },
  giftContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  giftButton: {
    backgroundColor: '#374151',
    borderRadius: 24,
    padding: 12,
    marginLeft: 16,
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    color: '#e5e7eb',
    fontSize: 12,
    marginBottom: 4,
  },
  progressLevel: {
    color: '#3b82f6',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatBubbleContainer: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 12,
    alignSelf: 'flex-end',
    marginBottom: 8,
    maxWidth: '80%',
  },
  chatBubbleText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'right',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  controlButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatInputContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#374151',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    color: 'white',
    textAlign: 'right',
    marginRight: 8,
  },
  chatSendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 24,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});