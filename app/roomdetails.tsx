import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  TextInput,
  FlatList,
  Dimensions,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  ArrowLeft, 
  Users, 
  Mic, 
  MicOff, 
  Hand, 
  HandRaise, 
  Heart, 
  Share2, 
  MoreHorizontal,
  MessageCircle,
  Send,
  Crown,
  Star,
  Gift,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Clock,
  MapPin,
  Hash,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Room {
  id: string;
  name: string;
  description: string;
  category: string;
  language: string;
  theme: string;
  banner: string;
  host: {
    id: string;
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    isPremium: boolean;
  };
  participants: Participant[];
  maxParticipants: number;
  currentParticipants: number;
  isPrivate: boolean;
  isLive: boolean;
  createdAt: string;
  tags: string[];
  rules: string[];
  currentSong?: {
    title: string;
    artist: string;
    album: string;
    cover: string;
    duration: number;
    currentTime: number;
    isPlaying: boolean;
  };
}

interface Participant {
  id: string;
  name: string;
  username: string;
  avatar: string;
  role: 'host' | 'admin' | 'speaker' | 'listener';
  isSpeaking: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  isOnline: boolean;
  joinTime: string;
  level: number;
  isVerified: boolean;
  isPremium: boolean;
}

interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  message: string;
  timestamp: string;
  type: 'text' | 'gift' | 'system' | 'join' | 'leave';
  giftId?: string;
  giftName?: string;
}

export default function RoomDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const roomId = params.roomId as string;
  
  const [activeTab, setActiveTab] = useState<'participants' | 'chat'>('participants');
  const [message, setMessage] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showChat, setShowChat] = useState(false);
  
  // Mock data - in real app, fetch from API
  const [roomInfo, setRoomInfo] = useState<Room | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    // Simulate fetching room data
    const mockRoom: Room = {
      id: roomId || '1',
      name: 'غرفة التطوير والتقنية',
      description: 'مناقشة أحدث التقنيات وأفضل الممارسات في تطوير التطبيقات',
      category: 'التقنية',
      language: 'العربية',
      theme: 'تطوير البرمجيات',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
      host: {
        id: '1',
        name: 'أحمد محمد',
        username: '@ahmed_dev',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        isVerified: true,
        isPremium: true
      },
      participants: [],
      maxParticipants: 50,
      currentParticipants: 23,
      isPrivate: false,
      isLive: true,
      createdAt: '2024-01-15T10:00:00Z',
      tags: ['تطوير', 'تقنية', 'برمجة', 'تطبيقات'],
      rules: [
        'احترم جميع المشاركين',
        'لا تتداخل مع المتحدث الحالي',
        'استخدم زر رفع اليد للحديث',
        'حافظ على المحتوى مناسب'
      ],
      currentSong: {
        title: 'Lofi Coding',
        artist: 'Chill Beats',
        album: 'Programming Focus',
        cover: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200&h=200&fit=crop',
        duration: 180,
        currentTime: 45,
        isPlaying: true
      }
    };
    
    setRoomInfo(mockRoom);
    
    const mockParticipants: Participant[] = [
      {
        id: '1',
        name: 'أحمد محمد',
        username: '@ahmed_dev',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        role: 'host',
        isSpeaking: true,
        isMuted: false,
        isHandRaised: false,
        isOnline: true,
        joinTime: '2024-01-15T10:00:00Z',
        level: 15,
        isVerified: true,
        isPremium: true
      },
      {
        id: '2',
        name: 'سارة أحمد',
        username: '@sara_tech',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
        role: 'speaker',
        isSpeaking: false,
        isMuted: false,
        isHandRaised: true,
        isOnline: true,
        joinTime: '2024-01-15T10:05:00Z',
        level: 12,
        isVerified: true,
        isPremium: false
      },
      {
        id: '3',
        name: 'محمد علي',
        username: '@mohamed_ali',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        role: 'admin',
        isSpeaking: false,
        isMuted: true,
        isHandRaised: false,
        isOnline: true,
        joinTime: '2024-01-15T10:10:00Z',
        level: 18,
        isVerified: true,
        isPremium: true
      }
    ];
    
    setParticipants(mockParticipants);
    
    const mockChat: ChatMessage[] = [
      {
        id: '1',
        userId: '1',
        username: 'أحمد محمد',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        message: 'مرحباً بكم جميعاً في غرفة التطوير والتقنية!',
        timestamp: '2024-01-15T10:00:00Z',
        type: 'text'
      },
      {
        id: '2',
        userId: '2',
        username: 'سارة أحمد',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
        message: 'أهلاً وسهلاً! متحمسة للمشاركة في النقاش',
        timestamp: '2024-01-15T10:01:00Z',
        type: 'text'
      },
      {
        id: '3',
        userId: '3',
        username: 'محمد علي',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        message: 'شكراً على إنشاء هذه الغرفة المفيدة',
        timestamp: '2024-01-15T10:02:00Z',
        type: 'text'
      }
    ];
    
    setChatMessages(mockChat);
  }, [roomId]);

  const handleJoinRoom = () => {
    if (isJoined) {
      Alert.alert(
        'مغادرة الغرفة',
        'هل أنت متأكد من مغادرة الغرفة؟',
        [
          { text: 'إلغاء', style: 'cancel' },
          { 
            text: 'مغادرة', 
            style: 'destructive',
            onPress: () => {
              setIsJoined(false);
              setIsMuted(false);
              setIsHandRaised(false);
            }
          }
        ]
      );
    } else {
      setIsJoined(true);
      router.push(`/voicechat?roomId=${roomId}`);
    }
  };

  const handleLeaveRoom = () => {
    Alert.alert(
      'مغادرة الغرفة',
      'هل أنت متأكد من مغادرة الغرفة؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'مغادرة', 
          style: 'destructive',
          onPress: () => {
            setIsJoined(false);
            setIsMuted(false);
            setIsHandRaised(false);
            router.back();
          }
        }
      ]
    );
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        userId: 'current_user',
        username: 'أنا',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        message: message.trim(),
        timestamp: new Date().toISOString(),
        type: 'text'
      };
      
      setChatMessages(prev => [newMessage, ...prev]);
      setMessage('');
    }
  };

  const renderParticipant = ({ item }: { item: Participant }) => (
    <View style={styles.participantItem}>
      <View style={styles.participantAvatar}>
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
        {item.isOnline && <View style={styles.onlineIndicator} />}
        {item.role === 'host' && <Crown size={16} color="#fbbf24" style={styles.roleIcon} />}
        {item.role === 'admin' && <Star size={16} color="#8b5cf6" style={styles.roleIcon} />}
      </View>
      
      <View style={styles.participantInfo}>
        <View style={styles.participantHeader}>
          <Text style={styles.participantName}>{item.name}</Text>
          {item.isVerified && <Text style={styles.verifiedBadge}>✓</Text>}
          {item.isPremium && <Text style={styles.premiumBadge}>⭐</Text>}
        </View>
        <Text style={styles.participantUsername}>{item.username}</Text>
        <Text style={styles.participantLevel}>المستوى {item.level}</Text>
      </View>
      
      <View style={styles.participantStatus}>
        {item.isSpeaking && <View style={styles.speakingIndicator} />}
        {item.isMuted && <MicOff size={20} color="#ef4444" />}
        {item.isHandRaised && <HandRaise size={20} color="#f59e0b" />}
        <Text style={styles.joinTime}>
          {new Date(item.joinTime).toLocaleTimeString('ar-SA', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  const renderChatMessage = ({ item }: { item: ChatMessage }) => (
    <View style={styles.chatMessage}>
      <Image source={{ uri: item.avatar }} style={styles.chatAvatar} />
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatUsername}>{item.username}</Text>
          <Text style={styles.chatTimestamp}>
            {new Date(item.timestamp).toLocaleTimeString('ar-SA', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
        <Text style={styles.chatText}>{item.message}</Text>
      </View>
    </View>
  );

  if (!roomInfo) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>جاري التحميل...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#ffffff" />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <Text style={styles.roomName} numberOfLines={1}>
              {roomInfo.name}
            </Text>
            <Text style={styles.roomCategory}>{roomInfo.category}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Share2 size={20} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <MoreHorizontal size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Room Banner */}
          <View style={styles.bannerContainer}>
            <Image source={{ uri: roomInfo.banner }} style={styles.banner} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.bannerOverlay}
            >
              <View style={styles.bannerContent}>
                <View style={styles.bannerInfo}>
                  <Text style={styles.bannerTitle}>{roomInfo.name}</Text>
                  <Text style={styles.bannerDescription}>{roomInfo.description}</Text>
                  <View style={styles.bannerMeta}>
                    <View style={styles.metaItem}>
                      <MapPin size={16} color="#94a3b8" />
                      <Text style={styles.metaText}>{roomInfo.language}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Hash size={16} color="#94a3b8" />
                      <Text style={styles.metaText}>{roomInfo.theme}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Clock size={16} color="#94a3b8" />
                      <Text style={styles.metaText}>
                        {new Date(roomInfo.createdAt).toLocaleDateString('ar-SA')}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.bannerStats}>
                  <View style={styles.statItem}>
                    <Users size={20} color="#94a3b8" />
                    <Text style={styles.statText}>
                      {roomInfo.currentParticipants}/{roomInfo.maxParticipants}
                    </Text>
                  </View>
                  <View style={styles.statItem}>
                    {roomInfo.isLive ? (
                      <View style={styles.liveIndicator}>
                        <Text style={styles.liveText}>مباشر</Text>
                      </View>
                    ) : (
                      <Text style={styles.offlineText}>غير مباشر</Text>
                    )}
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* Current Song (if available) */}
          {roomInfo.currentSong && (
            <View style={styles.currentSongContainer}>
              <Image source={{ uri: roomInfo.currentSong.cover }} style={styles.songCover} />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{roomInfo.currentSong.title}</Text>
                <Text style={styles.songArtist}>{roomInfo.currentSong.artist}</Text>
                <Text style={styles.songAlbum}>{roomInfo.currentSong.album}</Text>
              </View>
              <View style={styles.songControls}>
                <TouchableOpacity style={styles.controlButton}>
                  <SkipBack size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}>
                  {roomInfo.currentSong.isPlaying ? (
                    <Pause size={24} color="#ffffff" />
                  ) : (
                    <Play size={24} color="#ffffff" />
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton}>
                  <SkipForward size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'participants' && styles.activeTab]}
              onPress={() => setActiveTab('participants')}
            >
              <Users size={20} color={activeTab === 'participants' ? '#8b5cf6' : '#94a3b8'} />
              <Text style={[styles.tabText, activeTab === 'participants' && styles.activeTabText]}>
                المشاركون ({participants.length})
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
              onPress={() => setActiveTab('chat')}
            >
              <MessageCircle size={20} color={activeTab === 'chat' ? '#8b5cf6' : '#94a3b8'} />
              <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>
                الدردشة ({chatMessages.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'participants' ? (
            <View style={styles.participantsContainer}>
              <FlatList
                data={participants}
                renderItem={renderParticipant}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : (
            <View style={styles.chatContainer}>
              <FlatList
                data={chatMessages}
                renderItem={renderChatMessage}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                inverted
              />
            </View>
          )}

          {/* Chat Input */}
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="اكتب رسالة..."
              placeholderTextColor="#64748b"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity 
              style={styles.sendButton}
              onPress={handleSendMessage}
            >
              <Send size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Action Bar */}
        <View style={styles.bottomBar}>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, isMuted && styles.actionButtonActive]}
              onPress={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <MicOff size={20} color="#ffffff" /> : <Mic size={20} color="#ffffff" />}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, isHandRaised && styles.actionButtonActive]}
              onPress={() => setIsHandRaised(!isHandRaised)}
            >
              <HandRaise size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Heart size={20} color="#ffffff" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <Gift size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.joinButton, isJoined && styles.leaveButton]}
            onPress={isJoined ? handleLeaveRoom : handleJoinRoom}
          >
            <Text style={styles.joinButtonText}>
              {isJoined ? 'مغادرة الغرفة' : 'انضم للغرفة'}
            </Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  gradient: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  backButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  roomName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  roomCategory: {
    color: '#94a3b8',
    fontSize: 14,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  bannerContainer: {
    height: 200,
    margin: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  banner: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
    justifyContent: 'flex-end',
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    padding: 16,
  },
  bannerInfo: {
    flex: 1,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bannerDescription: {
    color: '#e2e8f0',
    fontSize: 14,
    marginBottom: 8,
  },
  bannerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 4,
  },
  bannerStats: {
    alignItems: 'flex-end',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statText: {
    color: '#e2e8f0',
    fontSize: 14,
    marginLeft: 8,
  },
  liveIndicator: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  offlineText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  currentSongContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
  },
  songCover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songArtist: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 2,
  },
  songAlbum: {
    color: '#64748b',
    fontSize: 12,
  },
  songControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    padding: 8,
    marginLeft: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#334155',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#8b5cf6',
  },
  participantsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  participantAvatar: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  roleIcon: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  participantInfo: {
    flex: 1,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  participantName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
  },
  verifiedBadge: {
    color: '#3b82f6',
    fontSize: 16,
    marginRight: 4,
  },
  premiumBadge: {
    color: '#fbbf24',
    fontSize: 16,
  },
  participantUsername: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 2,
  },
  participantLevel: {
    color: '#64748b',
    fontSize: 12,
  },
  participantStatus: {
    alignItems: 'center',
  },
  speakingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginBottom: 4,
  },
  joinTime: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  chatContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  chatMessage: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chatAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatUsername: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
  },
  chatTimestamp: {
    color: '#64748b',
    fontSize: 12,
  },
  chatText: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#1e293b',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
    maxHeight: 80,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#1e293b',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  joinButton: {
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  leaveButton: {
    backgroundColor: '#ef4444',
  },
  joinButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
