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
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  Crown,
  Trophy,
  Star,
  Gift,
  Mic,
  Users,
  Heart,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  ChevronRight,
  BookOpen,
  Hash
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface TopUser {
  id: string;
  name: string;
  username: string;
  avatar: string;
  rank: number;
  score: number;
  level: number;
  category: 'active' | 'gifts' | 'rooms' | 'popularity';
  stats: {
    totalTime?: number;
    giftsReceived?: number;
    roomsCreated?: number;
    followers?: number;
  };
}

interface TopRoom {
  id: string;
  name: string;
  host: {
    name: string;
    avatar: string;
  };
  category: string;
  participantCount: number;
  maxParticipants: number;
  rank: number;
  score: number;
  isLive: boolean;
  tags: string[];
}

export default function LeaderboardScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'users' | 'rooms'>('users');
  const [activeCategory, setActiveCategory] = useState<'active' | 'gifts' | 'rooms' | 'popularity'>('active');
  const [timeFilter, setTimeFilter] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('weekly');

  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [topRooms, setTopRooms] = useState<TopRoom[]>([]);

  useEffect(() => {
    // Sample top users data
    const sampleTopUsers: TopUser[] = [
      {
        id: '1',
        name: 'أحمد محمد',
        username: '@ahmed_mohamed',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        rank: 1,
        score: 9850,
        level: 25,
        category: 'active',
        stats: { totalTime: 156 }
      },
      {
        id: '2',
        name: 'فاطمة علي',
        username: '@fatima_ali',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        rank: 2,
        score: 8740,
        level: 23,
        category: 'active',
        stats: { totalTime: 142 }
      },
      {
        id: '3',
        name: 'محمد حسن',
        username: '@mohamed_hassan',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        rank: 3,
        score: 7890,
        level: 21,
        category: 'active',
        stats: { totalTime: 128 }
      },
      {
        id: '4',
        name: 'سارة أحمد',
        username: '@sara_ahmed',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        rank: 4,
        score: 7230,
        level: 20,
        category: 'active',
        stats: { totalTime: 115 }
      },
      {
        id: '5',
        name: 'علي محمود',
        username: '@ali_mahmoud',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        rank: 5,
        score: 6890,
        level: 19,
        category: 'active',
        stats: { totalTime: 108 }
      }
    ];

    // Sample top rooms data
    const sampleTopRooms: TopRoom[] = [
      {
        id: '1',
        name: 'غرفة الموسيقى العربية',
        host: {
          name: 'أحمد محمد',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        },
        category: 'موسيقى',
        participantCount: 45,
        maxParticipants: 50,
        rank: 1,
        score: 9850,
        isLive: true,
        tags: ['موسيقى عربية', 'كلاسيكي', 'مشهور']
      },
      {
        id: '2',
        name: 'غرفة الشعر والأدب',
        host: {
          name: 'فاطمة علي',
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        category: 'أدب',
        participantCount: 38,
        maxParticipants: 40,
        rank: 2,
        score: 8740,
        isLive: true,
        tags: ['شعر', 'أدب', 'ثقافة']
      },
      {
        id: '3',
        name: 'غرفة الألعاب والترفيه',
        host: {
          name: 'محمد حسن',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
        },
        category: 'ترفيه',
        participantCount: 52,
        maxParticipants: 60,
        rank: 3,
        score: 7890,
        isLive: true,
        tags: ['ألعاب', 'ترفيه', 'ضحك']
      }
    ];

    setTopUsers(sampleTopUsers);
    setTopRooms(sampleTopRooms);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'موسيقى':
        return <Mic size={20} color="#8b5cf6" />;
      case 'أدب':
        return <BookOpen size={20} color="#10b981" />;
      case 'ترفيه':
        return <Heart size={20} color="#f59e0b" />;
      default:
        return <Hash size={20} color="#6b7280" />;
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown size={24} color="#fbbf24" />;
      case 2:
        return <Trophy size={24} color="#c0c0c0" />;
      case 3:
        return <Star size={24} color="#cd7f32" />;
      default:
        return <Text style={styles.rankNumber}>{rank}</Text>;
    }
  };

  const renderTopUser = ({ item, index }: { item: TopUser; index: number }) => (
    <View style={styles.leaderboardItem}>
      <View style={styles.rankSection}>
        {getRankIcon(item.rank)}
      </View>
      
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userUsername}>{item.username}</Text>
        <View style={styles.userStats}>
          <Text style={styles.userLevel}>المستوى {item.level}</Text>
          {item.stats.totalTime && (
            <Text style={styles.userTime}>{item.stats.totalTime} ساعة</Text>
          )}
        </View>
      </View>
      
      <View style={styles.scoreSection}>
        <Text style={styles.scoreValue}>{item.score.toLocaleString()}</Text>
        <Text style={styles.scoreLabel}>نقطة</Text>
      </View>
    </View>
  );

  const renderTopRoom = ({ item, index }: { item: TopRoom; index: number }) => (
    <TouchableOpacity 
      style={styles.leaderboardItem}
      onPress={() => router.push({
        pathname: '/roomdetails',
        params: { roomId: item.id, roomName: item.name }
      })}
    >
      <View style={styles.rankSection}>
        {getRankIcon(item.rank)}
      </View>
      
      <View style={styles.roomInfo}>
        <Text style={styles.roomName}>{item.name}</Text>
        <View style={styles.roomHost}>
          <Image source={{ uri: item.host.avatar }} style={styles.hostAvatar} />
          <Text style={styles.hostName}>{item.host.name}</Text>
        </View>
        <View style={styles.roomStats}>
          <View style={styles.roomCategory}>
            {getCategoryIcon(item.category)}
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <View style={styles.roomParticipants}>
            <Users size={16} color="#94a3b8" />
            <Text style={styles.participantText}>
              {item.participantCount}/{item.maxParticipants}
            </Text>
          </View>
        </View>
        <View style={styles.roomTags}>
          {item.tags.slice(0, 2).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>
      </View>
      
      <View style={styles.scoreSection}>
        <Text style={styles.scoreValue}>{item.score.toLocaleString()}</Text>
        <Text style={styles.scoreLabel}>نقطة</Text>
        {item.isLive && (
          <View style={styles.liveIndicator}>
            <Text style={styles.liveText}>مباشر</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderTabButton = (tab: 'users' | 'rooms', label: string, icon: React.ReactNode) => (
    <TouchableOpacity 
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      {icon}
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderCategoryButton = (category: 'active' | 'gifts' | 'rooms' | 'popularity', label: string, icon: React.ReactNode) => (
    <TouchableOpacity 
      style={[
        styles.categoryButton,
        activeCategory === category && styles.activeCategoryButton
      ]}
      onPress={() => setActiveCategory(category)}
    >
      {icon}
      <Text style={[
        styles.categoryButtonText,
        activeCategory === category && styles.activeCategoryButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTimeFilterButton = (filter: 'daily' | 'weekly' | 'monthly' | 'all', label: string) => (
    <TouchableOpacity 
      style={[
        styles.timeFilterButton,
        timeFilter === filter && styles.activeTimeFilterButton
      ]}
      onPress={() => setTimeFilter(filter)}
    >
      <Text style={[
        styles.timeFilterButtonText,
        timeFilter === filter && styles.activeTimeFilterButtonText
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1e293b', '#0f172a']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>المتصدرون</Text>
          
          <View style={styles.headerIcon}>
            <Trophy size={24} color="#fbbf24" />
          </View>
        </View>

        {/* Time Filter */}
        <View style={styles.timeFilterContainer}>
          {renderTimeFilterButton('daily', 'اليوم')}
          {renderTimeFilterButton('weekly', 'الأسبوع')}
          {renderTimeFilterButton('monthly', 'الشهر')}
          {renderTimeFilterButton('all', 'الكل')}
        </View>

        {/* Main Tabs */}
        <View style={styles.tabContainer}>
          {renderTabButton('users', 'المستخدمون', <Users size={20} color="#94a3b8" />)}
          {renderTabButton('rooms', 'الغرف', <Mic size={20} color="#94a3b8" />)}
        </View>

        {/* Category Filters (for users) */}
        {activeTab === 'users' && (
          <View style={styles.categoryContainer}>
            {renderCategoryButton('active', 'الأكثر نشاطاً', <TrendingUp size={20} color="#94a3b8" />)}
            {renderCategoryButton('gifts', 'أكثر هدايا', <Gift size={20} color="#94a3b8" />)}
            {renderCategoryButton('rooms', 'أكثر غرف', <Mic size={20} color="#94a3b8" />)}
            {renderCategoryButton('popularity', 'الأكثر شعبية', <Heart size={20} color="#94a3b8" />)}
          </View>
        )}

        {/* Leaderboard List */}
        <FlatList
          data={activeTab === 'users' ? topUsers : topRooms}
          renderItem={activeTab === 'users' ? renderTopUser : renderTopRoom}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.leaderboardList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.listHeaderTitle}>
                {activeTab === 'users' ? 'أفضل المستخدمين' : 'أفضل الغرف'}
              </Text>
              <Text style={styles.listHeaderSubtitle}>
                {timeFilter === 'daily' && 'اليوم'}
                {timeFilter === 'weekly' && 'هذا الأسبوع'}
                {timeFilter === 'monthly' && 'هذا الشهر'}
                {timeFilter === 'all' && 'جميع الأوقات'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerIcon: {
    padding: 8,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  timeFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  activeTimeFilterButton: {
    backgroundColor: '#8b5cf6',
  },
  timeFilterButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTimeFilterButtonText: {
    color: '#fff',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#8b5cf6',
  },
  tabButtonText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  activeCategoryButton: {
    backgroundColor: '#8b5cf6',
  },
  categoryButtonText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  activeCategoryButtonText: {
    color: '#fff',
  },
  leaderboardList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  listHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  listHeaderTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listHeaderSubtitle: {
    color: '#94a3b8',
    fontSize: 14,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rankSection: {
    width: 40,
    alignItems: 'center',
    marginRight: 16,
  },
  rankNumber: {
    color: '#94a3b8',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  userUsername: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  userStats: {
    flexDirection: 'row',
    gap: 16,
  },
  userLevel: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '600',
  },
  userTime: {
    color: '#10b981',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreSection: {
    alignItems: 'center',
  },
  scoreValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  scoreLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  roomInfo: {
    flex: 1,
    marginRight: 16,
  },
  roomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roomHost: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hostAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  hostName: {
    color: '#94a3b8',
    fontSize: 14,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  roomCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  roomParticipants: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  roomTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#8b5cf6',
    fontSize: 10,
    fontWeight: '600',
  },
  liveIndicator: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
