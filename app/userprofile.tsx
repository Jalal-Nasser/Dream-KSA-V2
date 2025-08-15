import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
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
  Gift, 
  Heart, 
  Share2, 
  MoreHorizontal,
  Crown,
  Star,
  Trophy,
  Clock,
  MapPin,
  MessageCircle,
  UserPlus,
  UserCheck,
  UserX,
  Camera,
  Edit3,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Calendar,
  Hash,
  TrendingUp,
  Award,
  Target,
  Zap
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  banner: string;
  bio: string;
  level: number;
  experience: number;
  coins: number;
  followers: number;
  following: number;
  roomsCreated: number;
  totalTimeSpent: number;
  joinDate: string;
  isVerified: boolean;
  isPremium: boolean;
  isOnline: boolean;
  lastSeen?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  badges: Badge[];
  achievements: Achievement[];
  recentRooms: RecentRoom[];
  mutualFriends: MutualFriend[];
  relationshipStatus: 'none' | 'friend' | 'pending_sent' | 'pending_received' | 'blocked';
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  earnedAt: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedAt?: string;
}

interface RecentRoom {
  id: string;
  name: string;
  category: string;
  participantCount: number;
  maxParticipants: number;
  isLive: boolean;
  joinedAt: string;
}

interface MutualFriend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
}

export default function UserProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const userId = params.userId as string;
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'rooms' | 'friends'>('overview');
  const [isFollowing, setIsFollowing] = useState(false);
  const [showMoreActions, setShowMoreActions] = useState(false);

  useEffect(() => {
    // Simulate fetching user profile data
    const mockUserProfile: UserProfile = {
      id: userId || '1',
      name: 'أحمد محمد',
      username: '@ahmed_dev',
      email: 'ahmed@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      banner: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=400&fit=crop',
      bio: 'مطور تطبيقات ومحب للتقنية. أحب مشاركة المعرفة مع الآخرين. متخصص في React Native و Node.js',
      level: 15,
      experience: 1250,
      coins: 1250,
      followers: 234,
      following: 156,
      roomsCreated: 8,
      totalTimeSpent: 45, // hours
      joinDate: '2023-01-15',
      isVerified: true,
      isPremium: true,
      isOnline: true,
      lastSeen: '2024-01-15T10:00:00Z',
      location: 'الرياض، المملكة العربية السعودية',
      website: 'https://ahmed-dev.com',
      socialLinks: {
        twitter: '@ahmed_dev',
        instagram: '@ahmed_dev',
        linkedin: 'ahmed-mohamed'
      },
      badges: [
        {
          id: '1',
          name: 'المضيف الأول',
          description: 'أنشأت أول غرفة صوتية',
          icon: '🎤',
          color: '#fbbf24',
          earnedAt: '2023-01-20'
        },
        {
          id: '2',
          name: 'المتحدث النشط',
          description: 'تحدثت في 10 غرف مختلفة',
          icon: '💬',
          color: '#8b5cf6',
          earnedAt: '2023-02-15'
        },
        {
          id: '3',
          name: 'صانع الأصدقاء',
          description: 'حصلت على 100 متابع',
          icon: '👥',
          color: '#10b981',
          earnedAt: '2023-03-10'
        }
      ],
      achievements: [
        {
          id: '1',
          name: 'المضيف الأول',
          description: 'أنشأت أول غرفة صوتية',
          icon: '🎤',
          isUnlocked: true,
          progress: 1,
          maxProgress: 1,
          unlockedAt: '2023-01-20'
        },
        {
          id: '2',
          name: 'المتحدث النشط',
          description: 'تحدثت في 10 غرف مختلفة',
          icon: '💬',
          isUnlocked: true,
          progress: 10,
          maxProgress: 10,
          unlockedAt: '2023-02-15'
        },
        {
          id: '3',
          name: 'صانع الأصدقاء',
          description: 'حصلت على 100 متابع',
          icon: '👥',
          isUnlocked: true,
          progress: 100,
          maxProgress: 100,
          unlockedAt: '2023-03-10'
        },
        {
          id: '4',
          name: 'المحسن',
          description: 'أرسلت 50 هدية',
          icon: '🎁',
          isUnlocked: false,
          progress: 32,
          maxProgress: 50
        }
      ],
      recentRooms: [
        {
          id: '1',
          name: 'غرفة التطوير والتقنية',
          category: 'التقنية',
          participantCount: 23,
          maxParticipants: 50,
          isLive: true,
          joinedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'أحاديث عامة',
          category: 'عام',
          participantCount: 45,
          maxParticipants: 100,
          isLive: false,
          joinedAt: '2024-01-14T15:30:00Z'
        }
      ],
      mutualFriends: [
        {
          id: '1',
          name: 'سارة أحمد',
          username: '@sara_tech',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
          isOnline: true
        },
        {
          id: '2',
          name: 'محمد علي',
          username: '@mohamed_ali',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
          isOnline: false
        }
      ],
      relationshipStatus: 'none'
    };
    
    setUserProfile(mockUserProfile);
  }, [userId]);

  const handleFollow = () => {
    if (isFollowing) {
      Alert.alert(
        'إلغاء المتابعة',
        `هل أنت متأكد من إلغاء متابعة ${userProfile?.name}؟`,
        [
          { text: 'إلغاء', style: 'cancel' },
          { 
            text: 'إلغاء المتابعة', 
            style: 'destructive',
            onPress: () => setIsFollowing(false)
          }
        ]
      );
    } else {
      setIsFollowing(true);
      Alert.alert('تمت المتابعة', `أنت الآن تتابع ${userProfile?.name}`);
    }
  };

  const handleSendMessage = () => {
    // Navigate to chat or create new conversation
    Alert.alert('إرسال رسالة', 'سيتم فتح محادثة جديدة');
  };

  const handleSendGift = () => {
    // Navigate to gift selection
    router.push('/gifts');
  };

  const handleJoinRoom = (roomId: string) => {
    router.push(`/roomdetails?roomId=${roomId}`);
  };

  const renderBadge = ({ item }: { item: Badge }) => (
    <View style={styles.badgeItem}>
      <View style={[styles.badgeIcon, { backgroundColor: item.color }]}>
        <Text style={styles.badgeIconText}>{item.icon}</Text>
      </View>
      <View style={styles.badgeInfo}>
        <Text style={styles.badgeName}>{item.name}</Text>
        <Text style={styles.badgeDescription}>{item.description}</Text>
        <Text style={styles.badgeDate}>
          {new Date(item.earnedAt).toLocaleDateString('ar-SA')}
        </Text>
      </View>
    </View>
  );

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <View style={styles.achievementItem}>
      <View style={[
        styles.achievementIcon,
        item.isUnlocked ? styles.unlockedAchievement : styles.lockedAchievement
      ]}>
        <Text style={styles.achievementIconText}>{item.icon}</Text>
      </View>
      
      <View style={styles.achievementInfo}>
        <Text style={[
          styles.achievementName,
          item.isUnlocked ? styles.unlockedText : styles.lockedText
        ]}>
          {item.name}
        </Text>
        <Text style={styles.achievementDescription}>{item.description}</Text>
        
        <View style={styles.achievementProgress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(item.progress / item.maxProgress) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {item.progress}/{item.maxProgress}
          </Text>
        </View>
        
        {item.isUnlocked && item.unlockedAt && (
          <Text style={styles.unlockedDate}>
            تم إنجازه في {new Date(item.unlockedAt).toLocaleDateString('ar-SA')}
          </Text>
        )}
      </View>
    </View>
  );

  const renderRecentRoom = ({ item }: { item: RecentRoom }) => (
    <TouchableOpacity 
      style={styles.roomItem}
      onPress={() => handleJoinRoom(item.id)}
    >
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomCategory}>{item.category}</Text>
        <Text style={styles.roomParticipants}>
          {item.participantCount}/{item.maxParticipants} مشارك
        </Text>
      </View>
      
      <View style={styles.roomStatus}>
        {item.isLive ? (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>مباشر</Text>
          </View>
        ) : (
          <Text style={styles.offlineText}>غير مباشر</Text>
        )}
        <Text style={styles.roomDate}>
          {new Date(item.joinedAt).toLocaleDateString('ar-SA')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderMutualFriend = ({ item }: { item: MutualFriend }) => (
    <TouchableOpacity style={styles.friendItem}>
      <Image source={{ uri: item.avatar }} style={styles.friendAvatar} />
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendUsername}>{item.username}</Text>
      </View>
      <View style={[
        styles.onlineIndicator,
        { backgroundColor: item.isOnline ? '#10b981' : '#94a3b8' }
      ]} />
    </TouchableOpacity>
  );

  if (!userProfile) {
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
            <Text style={styles.headerTitle} numberOfLines={1}>
              {userProfile.name}
            </Text>
            <Text style={styles.headerSubtitle}>{userProfile.username}</Text>
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
          {/* Profile Banner */}
          <View style={styles.bannerContainer}>
            <Image source={{ uri: userProfile.banner }} style={styles.banner} />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.bannerOverlay}
            />
          </View>

          {/* Profile Info */}
          <View style={styles.profileInfo}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
              {userProfile.isOnline && <View style={styles.onlineIndicator} />}
              {userProfile.isVerified && <View style={styles.verifiedBadge}>✓</View>}
              {userProfile.isPremium && <View style={styles.premiumBadge}>⭐</View>}
            </View>
            
            <View style={styles.profileDetails}>
              <Text style={styles.profileName}>{userProfile.name}</Text>
              <Text style={styles.profileUsername}>{userProfile.username}</Text>
              <Text style={styles.profileBio}>{userProfile.bio}</Text>
              
              <View style={styles.profileMeta}>
                {userProfile.location && (
                  <View style={styles.metaItem}>
                    <MapPin size={16} color="#94a3b8" />
                    <Text style={styles.metaText}>{userProfile.location}</Text>
                  </View>
                )}
                <View style={styles.metaItem}>
                  <Calendar size={16} color="#94a3b8" />
                  <Text style={styles.metaText}>
                    انضم في {new Date(userProfile.joinDate).toLocaleDateString('ar-SA')}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.level}</Text>
              <Text style={styles.statLabel}>المستوى</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.followers}</Text>
              <Text style={styles.statLabel}>المتابعون</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.following}</Text>
              <Text style={styles.statLabel}>يتبع</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userProfile.roomsCreated}</Text>
              <Text style={styles.statLabel}>الغرف</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {userProfile.relationshipStatus === 'none' ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.followButton]}
                onPress={handleFollow}
              >
                <UserPlus size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>متابعة</Text>
              </TouchableOpacity>
            ) : userProfile.relationshipStatus === 'friend' ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.friendButton]}
                onPress={handleFollow}
              >
                <UserCheck size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>صديق</Text>
              </TouchableOpacity>
            ) : userProfile.relationshipStatus === 'pending_sent' ? (
              <TouchableOpacity 
                style={[styles.actionButton, styles.pendingButton]}
                onPress={handleFollow}
              >
                <Clock size={20} color="#ffffff" />
                <Text style={styles.actionButtonText}>في الانتظار</Text>
              </TouchableOpacity>
            ) : null}
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.messageButton]}
              onPress={handleSendMessage}
            >
              <MessageCircle size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>رسالة</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.giftButton]}
              onPress={handleSendGift}
            >
              <Gift size={20} color="#ffffff" />
              <Text style={styles.actionButtonText}>هدية</Text>
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabsContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
              onPress={() => setActiveTab('overview')}
            >
              <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
                نظرة عامة
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
              onPress={() => setActiveTab('achievements')}
            >
              <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
                الإنجازات
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'rooms' && styles.activeTab]}
              onPress={() => setActiveTab('rooms')}
            >
              <Text style={[styles.tabText, activeTab === 'rooms' && styles.activeTabText]}>
                الغرف
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
              onPress={() => setActiveTab('friends')}
            >
              <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
                الأصدقاء المشتركون
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <View style={styles.tabContent}>
              {/* Badges */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>الشارات</Text>
                <FlatList
                  data={userProfile.badges}
                  renderItem={renderBadge}
                  keyExtractor={(item) => item.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.badgesList}
                />
              </View>

              {/* Level Progress */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>تقدم المستوى</Text>
                <View style={styles.levelProgress}>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelText}>المستوى {userProfile.level}</Text>
                    <Text style={styles.experienceText}>
                      {userProfile.experience} / {userProfile.level * 100} خبرة
                    </Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${(userProfile.experience % 100) / 100 * 100}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'achievements' && (
            <View style={styles.tabContent}>
              <FlatList
                data={userProfile.achievements}
                renderItem={renderAchievement}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {activeTab === 'rooms' && (
            <View style={styles.tabContent}>
              <FlatList
                data={userProfile.recentRooms}
                renderItem={renderRecentRoom}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}

          {activeTab === 'friends' && (
            <View style={styles.tabContent}>
              <FlatList
                data={userProfile.mutualFriends}
                renderItem={renderMutualFriend}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          )}
        </ScrollView>
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
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
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
    height: 150,
    position: 'relative',
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
  },
  profileInfo: {
    paddingHorizontal: 16,
    marginTop: -50,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#0f172a',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#0f172a',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fbbf24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileDetails: {
    alignItems: 'center',
  },
  profileName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileUsername: {
    color: '#94a3b8',
    fontSize: 16,
    marginBottom: 8,
  },
  profileBio: {
    color: '#e2e8f0',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 12,
  },
  profileMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  metaText: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 16,
    backgroundColor: '#1e293b',
    borderRadius: 16,
    marginTop: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#334155',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    minWidth: 100,
    justifyContent: 'center',
  },
  followButton: {
    backgroundColor: '#8b5cf6',
  },
  friendButton: {
    backgroundColor: '#10b981',
  },
  pendingButton: {
    backgroundColor: '#f59e0b',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
  },
  giftButton: {
    backgroundColor: '#f97316',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
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
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#334155',
  },
  tabText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#8b5cf6',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  badgesList: {
    paddingRight: 16,
  },
  badgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginRight: 12,
    minWidth: 200,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  badgeIconText: {
    fontSize: 24,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  badgeDescription: {
    color: '#94a3b8',
    fontSize: 12,
    marginBottom: 4,
  },
  badgeDate: {
    color: '#64748b',
    fontSize: 10,
  },
  levelProgress: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
  },
  levelInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  levelText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  experienceText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  unlockedAchievement: {
    backgroundColor: '#8b5cf6',
  },
  lockedAchievement: {
    backgroundColor: '#334155',
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementDescription: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    color: '#64748b',
    fontSize: 12,
    marginLeft: 8,
  },
  unlockedDate: {
    color: '#10b981',
    fontSize: 12,
    marginTop: 4,
  },
  roomItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  roomCategory: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 4,
  },
  roomParticipants: {
    color: '#64748b',
    fontSize: 12,
  },
  roomStatus: {
    alignItems: 'flex-end',
  },
  liveIndicator: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
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
  roomDate: {
    color: '#64748b',
    fontSize: 10,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  friendUsername: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
