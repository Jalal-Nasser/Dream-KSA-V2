import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  Pressable, 
  Image, 
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/ThemeProvider';
import { useRouter } from 'expo-router';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Crown, 
  Star,
  Flame,
  Mic,
  MicOff,
  Plus,
  Filter,
  MapPin,
  Clock
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/api';

interface Room {
  id: string;
  name: string;
  description: string;
  host_name: string;
  participant_count: number;
  is_live: boolean;
  category: string;
  tags: string[];
  created_at: string;
  host_avatar?: string;
}

interface TrendingRoom extends Room {
  trending_score: number;
  listeners: number;
  speakers: number;
}

export default function HomeScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [trendingRooms, setTrendingRooms] = useState<TrendingRoom[]>([]);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [categories, setCategories] = useState([
    { id: 'all', name: 'الكل', icon: '🔥' },
    { id: 'general', name: 'عام', icon: '💬' },
    { id: 'entertainment', name: 'ترفيه', icon: '🎭' },
    { id: 'education', name: 'تعليم', icon: '📚' },
    { id: 'business', name: 'أعمال', icon: '💼' },
    { id: 'technology', name: 'تقنية', icon: '💻' }
  ]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load rooms from backend/Supabase; fallback to sample
  useEffect(() => {
    const sampleTrendingRooms: TrendingRoom[] = [
      {
        id: '1',
        name: 'أحاديث عامة',
        description: 'غرفة للنقاشات العامة والمواضيع المتنوعة',
        host_name: 'أحمد محمد',
        participant_count: 156,
        is_live: true,
        category: 'general',
        tags: ['عام', 'نقاش', 'متنوع'],
        created_at: new Date().toISOString(),
        trending_score: 95,
        listeners: 120,
        speakers: 36,
        host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: '2',
        name: 'قعدة أصدقاء',
        description: 'غرفة للصداقات والمحادثات الودية',
        host_name: 'فاطمة علي',
        participant_count: 89,
        is_live: true,
        category: 'entertainment',
        tags: ['أصدقاء', 'ودي', 'مرح'],
        created_at: new Date().toISOString(),
        trending_score: 87,
        listeners: 65,
        speakers: 24,
        host_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: '3',
        name: 'تعلم اللغة العربية',
        description: 'غرفة لتعلم اللغة العربية والنطق الصحيح',
        host_name: 'عبدالله خالد',
        participant_count: 234,
        is_live: true,
        category: 'education',
        tags: ['تعليم', 'لغة', 'عربية'],
        created_at: new Date().toISOString(),
        trending_score: 92,
        listeners: 180,
        speakers: 54,
        host_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face'
      }
    ];

    const sampleRecentRooms: Room[] = [
      {
        id: '4',
        name: 'تقنية المستقبل',
        description: 'مناقشة أحدث التقنيات والابتكارات',
        host_name: 'سارة أحمد',
        participant_count: 67,
        is_live: true,
        category: 'technology',
        tags: ['تقنية', 'ابتكار', 'مستقبل'],
        created_at: new Date().toISOString(),
        host_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b577?w=100&h=100&fit=crop&crop=face'
      },
      {
        id: '5',
        name: 'أعمال وريادة',
        description: 'نصائح ريادة الأعمال والاستثمار',
        host_name: 'محمد حسن',
        participant_count: 45,
        is_live: true,
        category: 'business',
        tags: ['أعمال', 'ريادة', 'استثمار'],
        created_at: new Date().toISOString(),
        host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
      }
    ];

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/rooms`);
        const json = await res.json();
        const apiRooms: Room[] = (json?.rooms || []).map((r: any) => ({
          id: r.id || r.hms_room_id,
          name: r.name,
          description: r.description,
          host_name: 'مضيف',
          participant_count: Math.floor(Math.random() * 300) + 1,
          is_live: true,
          category: r.type || 'general',
          tags: ['عام'],
          created_at: r.created_at || new Date().toISOString(),
          host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        }));

        if (apiRooms.length > 0) {
          setTrendingRooms(sampleTrendingRooms);
          setRecentRooms(apiRooms);
          await AsyncStorage.setItem('recentRooms', JSON.stringify(apiRooms));
        } else {
          setTrendingRooms(sampleTrendingRooms);
          setRecentRooms(sampleRecentRooms);
        }
      } catch (e) {
        // Fallback to samples or cache
        try {
          const cached = await AsyncStorage.getItem('recentRooms');
          if (cached) {
            setTrendingRooms(sampleTrendingRooms);
            setRecentRooms(JSON.parse(cached));
            return;
          }
        } catch {}
        setTrendingRooms(sampleTrendingRooms);
        setRecentRooms(sampleRecentRooms);
      }
    })();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const navigateToRoom = (room: Room) => {
    router.push({
      pathname: '/voicechat',
      params: { 
        roomId: room.id, 
        roomName: room.name 
      }
    });
  };

  const navigateToCreateRoom = () => {
    router.push('/createroom');
  };

  const renderTrendingRoom = ({ item, index }: { item: TrendingRoom; index: number }) => (
    <TouchableOpacity 
      style={styles.trendingRoomCard}
      onPress={() => navigateToRoom(item)}
    >
      <LinearGradient
        colors={['rgba(139, 92, 246, 0.1)', 'rgba(59, 130, 246, 0.1)']}
        style={styles.trendingGradient}
      >
        {/* Trending Badge */}
        <View style={styles.trendingBadge}>
          <Flame size={16} color="#f59e0b" />
          <Text style={styles.trendingText}>ترند</Text>
        </View>

        {/* Host Info */}
        <View style={styles.hostInfo}>
          <Image 
            source={{ uri: item.host_avatar }} 
            style={styles.hostAvatar}
          />
          <View style={styles.hostDetails}>
            <Text style={styles.hostName}>{item.host_name}</Text>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>مباشر</Text>
            </View>
          </View>
        </View>

        {/* Room Info */}
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.roomDescription}>{item.description}</Text>

        {/* Stats */}
        <View style={styles.roomStats}>
          <View style={styles.statItem}>
            <Users size={16} color="#94a3b8" />
            <Text style={styles.statText}>{item.participant_count}</Text>
          </View>
          <View style={styles.statItem}>
            <Mic size={16} color="#22c55e" />
            <Text style={styles.statText}>{item.speakers}</Text>
          </View>
          <View style={styles.statItem}>
            <Star size={16} color="#fbbf24" />
            <Text style={styles.statText}>{item.trending_score}</Text>
          </View>
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, tagIndex) => (
            <View key={tagIndex} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderRecentRoom = ({ item }: { item: Room }) => (
    <TouchableOpacity 
      style={styles.recentRoomCard}
      onPress={() => navigateToRoom(item)}
    >
      <View style={styles.recentRoomHeader}>
        <Image 
          source={{ uri: item.host_avatar }} 
          style={styles.recentHostAvatar}
        />
        <View style={styles.recentRoomInfo}>
          <Text style={styles.recentRoomName}>{item.name}</Text>
          <Text style={styles.recentHostName}>{item.host_name}</Text>
        </View>
        <View style={styles.recentRoomStats}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>مباشر</Text>
          </View>
          <Text style={styles.participantCount}>{item.participant_count} مشارك</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>مرحباً بك في</Text>
            <Text style={styles.appName}>Dreams KSA</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }} 
              style={styles.profileAvatar}
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن غرف أو مواضيع..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity style={styles.filterButton}>
            <Filter size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.selectedCategory
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.selectedCategoryText
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Trending Rooms */}
        <View style={styles.sectionHeader}>
          <TrendingUp size={24} color="#fbbf24" />
          <Text style={styles.sectionTitle}>الغرف الرائجة</Text>
        </View>
        
        <FlatList
          data={trendingRooms}
          renderItem={renderTrendingRoom}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.trendingList}
          contentContainerStyle={styles.trendingContent}
        />

        {/* Recent Rooms */}
        <View style={styles.sectionHeader}>
          <Clock size={24} color="#8b5cf6" />
          <Text style={styles.sectionTitle}>أحدث الغرف</Text>
        </View>

        <FlatList
          data={recentRooms}
          renderItem={renderRecentRoom}
          keyExtractor={(item) => item.id}
          style={styles.recentList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8b5cf6"
            />
          }
        />

        {/* Create Room Button */}
        <TouchableOpacity 
          style={styles.createRoomButton}
          onPress={navigateToCreateRoom}
        >
          <LinearGradient
            colors={['#8b5cf6', '#3b82f6']}
            style={styles.createRoomGradient}
          >
            <Plus size={24} color="#fff" />
            <Text style={styles.createRoomText}>إنشاء غرفة جديدة</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    color: '#94a3b8',
    fontSize: 16,
  },
  appName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileButton: {
    padding: 4,
  },
  profileAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#8b5cf6',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    marginLeft: 12,
  },
  filterButton: {
    padding: 4,
  },
  categoriesContainer: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  categoryButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  selectedCategory: {
    backgroundColor: '#8b5cf6',
  },
  categoryIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  categoryText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  trendingList: {
    marginBottom: 32,
  },
  trendingContent: {
    paddingHorizontal: 20,
  },
  trendingRoomCard: {
    width: 280,
    marginRight: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  trendingGradient: {
    padding: 20,
    minHeight: 200,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  trendingText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  hostDetails: {
    flex: 1,
  },
  hostName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: 'bold',
  },
  roomName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  roomDescription: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  roomStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#94a3b8',
    fontSize: 10,
  },
  recentList: {
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  recentRoomCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  recentRoomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recentHostAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  recentRoomInfo: {
    flex: 1,
  },
  recentRoomName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  recentHostName: {
    color: '#94a3b8',
    fontSize: 14,
  },
  recentRoomStats: {
    alignItems: 'flex-end',
  },
  participantCount: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 4,
  },
  createRoomButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  createRoomGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  createRoomText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
