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
  RefreshControl,
  Dimensions
} from 'react-native';
// White background screen (remove global gradient)
import { useRouter } from 'expo-router';
import { useTheme } from '../../lib/ThemeProvider';
import { 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Mic, 
  Star, 
  Clock, 
  TrendingUp,
  Flame,
  Crown,
  Heart,
  Share2,
  MoreHorizontal
} from 'lucide-react-native';
import { supabase } from '../../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../../config/api';

const { width } = Dimensions.get('window');

interface Room {
  id: string;
  name: string;
  description: string;
  host_name: string;
  participant_count: number;
  max_participants: number;
  is_live: boolean;
  category: string;
  tags: string[];
  created_at: string;
  host_avatar?: string;
  banner_image?: string;
  is_trending?: boolean;
  is_premium?: boolean;
  language: string;
  location?: string;
}

interface FilterOption {
  id: string;
  name: string;
  icon: string;
}

export default function ExploreScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories: FilterOption[] = [
    { id: 'all', name: 'الكل', icon: '🔥' },
    { id: 'general', name: 'عام', icon: '💬' },
    { id: 'entertainment', name: 'ترفيه', icon: '🎭' },
    { id: 'education', name: 'تعليم', icon: '📚' },
    { id: 'business', name: 'أعمال', icon: '💼' },
    { id: 'technology', name: 'تقنية', icon: '💻' },
    { id: 'music', name: 'موسيقى', icon: '🎵' },
    { id: 'gaming', name: 'ألعاب', icon: '🎮' },
    { id: 'sports', name: 'رياضة', icon: '⚽' },
    { id: 'health', name: 'صحة', icon: '🏥' }
  ];

  const languages: FilterOption[] = [
    { id: 'all', name: 'جميع اللغات', icon: '🌍' },
    { id: 'arabic', name: 'العربية', icon: '🇸🇦' },
    { id: 'english', name: 'English', icon: '🇺🇸' },
    { id: 'french', name: 'Français', icon: '🇫🇷' },
    { id: 'spanish', name: 'Español', icon: '🇪🇸' }
  ];

  // Sample rooms data
  useEffect(() => {
    const sampleRooms: Room[] = [
      {
        id: '1',
        name: 'أحاديث عامة',
        description: 'غرفة للنقاشات العامة والمواضيع المتنوعة مع أصدقاء من جميع أنحاء العالم',
        host_name: 'أحمد محمد',
        participant_count: 156,
        max_participants: 200,
        is_live: true,
        category: 'general',
        tags: ['عام', 'نقاش', 'متنوع', 'صداقة'],
        created_at: new Date().toISOString(),
        trending_score: 95,
        listeners: 120,
        speakers: 36,
        host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        banner_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
        is_trending: true,
        language: 'arabic',
        location: 'الرياض، السعودية'
      },
      {
        id: '2',
        name: 'قعدة أصدقاء',
        description: 'غرفة للصداقات والمحادثات الودية والمرح مع الأصدقاء',
        host_name: 'فاطمة علي',
        participant_count: 89,
        max_participants: 100,
        is_live: true,
        category: 'entertainment',
        tags: ['أصدقاء', 'ودي', 'مرح', 'ضحك'],
        created_at: new Date().toISOString(),
        trending_score: 87,
        listeners: 65,
        speakers: 24,
        host_avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
        banner_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
        is_trending: true,
        language: 'arabic',
        location: 'جدة، السعودية'
      },
      {
        id: '3',
        name: 'تعلم اللغة العربية',
        description: 'غرفة لتعلم اللغة العربية والنطق الصحيح مع متحدثين أصليين',
        host_name: 'عبدالله خالد',
        participant_count: 234,
        max_participants: 300,
        is_live: true,
        category: 'education',
        tags: ['تعليم', 'لغة', 'عربية', 'نطق'],
        created_at: new Date().toISOString(),
        trending_score: 92,
        listeners: 180,
        speakers: 54,
        host_avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
        banner_image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop',
        is_trending: true,
        language: 'arabic',
        location: 'الدمام، السعودية'
      },
      {
        id: '4',
        name: 'تقنية المستقبل',
        description: 'مناقشة أحدث التقنيات والابتكارات في مجال التكنولوجيا',
        host_name: 'سارة أحمد',
        participant_count: 67,
        max_participants: 80,
        is_live: true,
        category: 'technology',
        tags: ['تقنية', 'ابتكار', 'مستقبل', 'ذكاء اصطناعي'],
        created_at: new Date().toISOString(),
        host_avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b577?w=100&h=100&fit=crop&crop=face',
        banner_image: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop',
        language: 'english',
        location: 'الرياض، السعودية'
      },
      {
        id: '5',
        name: 'أعمال وريادة',
        description: 'نصائح ريادة الأعمال والاستثمار مع خبراء في المجال',
        host_name: 'محمد حسن',
        participant_count: 45,
        max_participants: 60,
        is_live: true,
        category: 'business',
        tags: ['أعمال', 'ريادة', 'استثمار', 'اقتصاد'],
        created_at: new Date().toISOString(),
        host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
        banner_image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=200&fit=crop',
        language: 'arabic',
        location: 'جدة، السعودية'
      },
      {
        id: '6',
        name: 'موسيقى عربية كلاسيكية',
        description: 'استمع إلى أجمل الموسيقى العربية الكلاسيكية مع عشاق الموسيقى',
        host_name: 'ليلى محمد',
        participant_count: 123,
        max_participants: 150,
        is_live: true,
        category: 'music',
        tags: ['موسيقى', 'عربية', 'كلاسيكية', 'فن'],
        created_at: new Date().toISOString(),
        host_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
        banner_image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
        language: 'arabic',
        location: 'مكة، السعودية'
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
          max_participants: 300,
          is_live: true,
          category: r.type || 'general',
          tags: ['عام'],
          created_at: r.created_at || new Date().toISOString(),
          host_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
          banner_image: r.banner_image,
          is_trending: true,
          is_premium: false,
          language: 'arabic',
          location: 'السعودية'
        }));
        if (apiRooms.length > 0) {
          setRooms(apiRooms);
          setFilteredRooms(apiRooms);
          await AsyncStorage.setItem('roomsCache', JSON.stringify(apiRooms));
          return;
        }
        setRooms(sampleRooms);
        setFilteredRooms(sampleRooms);
      } catch (e) {
        try {
          const cached = await AsyncStorage.getItem('roomsCache');
          if (cached) {
            const parsed = JSON.parse(cached);
            setRooms(parsed);
            setFilteredRooms(parsed);
            return;
          }
        } catch {}
        setRooms(sampleRooms);
        setFilteredRooms(sampleRooms);
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

  const filterRooms = () => {
    let filtered = rooms;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(room => room.category === selectedCategory);
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(room => room.language === selectedLanguage);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(room => 
        room.name.toLowerCase().includes(query) ||
        room.description.toLowerCase().includes(query) ||
        room.tags.some(tag => tag.toLowerCase().includes(query)) ||
        room.host_name.toLowerCase().includes(query)
      );
    }

    setFilteredRooms(filtered);
  };

  useEffect(() => {
    filterRooms();
  }, [selectedCategory, selectedLanguage, searchQuery, rooms]);

  const renderFilterButton = (filter: FilterOption, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        isSelected && styles.selectedFilter
      ]}
      onPress={onPress}
    >
      <Text style={styles.filterIcon}>{filter.icon}</Text>
      <Text style={[
        styles.filterText,
        isSelected && styles.selectedFilterText
      ]}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );

  const renderRoomCard = ({ item }: { item: Room }) => (
    <TouchableOpacity 
      style={styles.roomCard}
      onPress={() => navigateToRoom(item)}
    >
      <Image 
        source={{ uri: item.banner_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop' }} 
        style={styles.roomBanner}
      />
      
      {/* Room Badges */}
      <View style={styles.roomBadges}>
        {item.is_trending && (
          <View style={styles.trendingBadge}>
            <Flame size={12} color="#f59e0b" />
            <Text style={styles.badgeText}>ترند</Text>
          </View>
        )}
        {item.is_premium && (
          <View style={styles.premiumBadge}>
            <Crown size={12} color="#fbbf24" />
            <Text style={styles.badgeText}>VIP</Text>
          </View>
        )}
      </View>

      <View style={styles.roomContent}>
        {/* Room Header */}
        <View style={styles.roomHeader}>
          <Text style={styles.roomName} numberOfLines={1}>{item.name}</Text>
          <View style={styles.roomActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Heart size={16} color="#ef4444" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share2 size={16} color="#94a3b8" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <MoreHorizontal size={16} color="#94a3b8" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Room Description */}
        <Text style={styles.roomDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {/* Room Meta */}
        <View style={styles.roomMeta}>
          <View style={styles.hostInfo}>
            <Image 
              source={{ uri: item.host_avatar }} 
              style={styles.hostAvatar}
            />
            <View style={styles.hostDetails}>
              <Text style={styles.hostName}>{item.host_name}</Text>
              {item.location && (
                <View style={styles.locationInfo}>
                  <MapPin size={12} color="#94a3b8" />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.roomStats}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>مباشر</Text>
            </View>
            <View style={styles.participantInfo}>
              <Users size={14} color="#94a3b8" />
              <Text style={styles.participantCount}>
                {item.participant_count}/{item.max_participants}
              </Text>
            </View>
          </View>
        </View>

        {/* Room Tags */}
        <View style={styles.roomTags}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRoomGridCard = ({ item }: { item: Room }) => (
    <TouchableOpacity style={styles.gridCard} onPress={() => navigateToRoom(item)}>
      <Image
        source={{ uri: item.banner_image || 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=200&fit=crop' }}
        style={styles.gridBanner}
      />
      <View style={styles.gridContent}>
        <View style={styles.gridAvatarWrap}>
          <Image source={{ uri: item.host_avatar }} style={styles.gridAvatar} />
        </View>
        <Text style={styles.gridName} numberOfLines={1}>{item.name}</Text>
        <View style={styles.gridMetaRow}>
          <View style={styles.gridMetaPill}>
            <Image source={{ uri: 'https://flagcdn.com/w20/sa.png' }} style={{ width: 16, height: 12, marginLeft: 4 }} />
            <Text style={styles.gridMetaText}>SA</Text>
          </View>
          <View style={styles.gridMetaPill}>
            <Users size={14} color="#111827" />
            <Text style={styles.gridMetaText}>{item.participant_count}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}> 
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>استكشاف الغرف</Text>
          <TouchableOpacity 
            style={styles.filterToggle}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Filter size={24} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* View mode toggle */}
        <View style={styles.toggleWrap}>
          <TouchableOpacity
            onPress={() => setViewMode('grid')}
            style={[styles.toggleBtn, viewMode === 'grid' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, viewMode === 'grid' && styles.toggleTextActive]}>شبكي</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setViewMode('list')}
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>تقليدي</Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Search size={20} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن غرف أو مواضيع أو مضيفين..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            {/* Categories */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>الفئات</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filtersScroll}
              >
                {categories.map((category) => 
                  renderFilterButton(
                    category, 
                    selectedCategory === category.id,
                    () => setSelectedCategory(category.id)
                  )
                )}
              </ScrollView>
            </View>

            {/* Languages */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>اللغات</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.filtersScroll}
              >
                {languages.map((language) => 
                  renderFilterButton(
                    language, 
                    selectedLanguage === language.id,
                    () => setSelectedLanguage(language.id)
                  )
                )}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {filteredRooms.length} غرفة متاحة
          </Text>
          <TouchableOpacity style={styles.sortButton}>
            <Text style={styles.sortButtonText}>ترتيب حسب</Text>
            <TrendingUp size={16} color="#8b5cf6" />
          </TouchableOpacity>
        </View>

        {/* Rooms List */}
        {viewMode === 'grid' ? (
          <FlatList
            data={filteredRooms}
            renderItem={renderRoomGridCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            key={'grid'}
            columnWrapperStyle={{ gap: 12, paddingHorizontal: 20 }}
            style={styles.roomsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
            }
            contentContainerStyle={{ paddingBottom: 20, gap: 12 }}
          />
        ) : (
          <FlatList
            data={filteredRooms}
            renderItem={renderRoomCard}
            keyExtractor={(item) => item.id}
            key={'list'}
            style={styles.roomsList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8b5cf6" />
            }
            contentContainerStyle={styles.roomsContent}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    marginBottom: 20,
  },
  headerTitle: {
    color: '#111827',
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterToggle: {
    padding: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#111827',
    fontSize: 16,
    marginLeft: 12,
    textAlign: 'right',
  },
  filtersContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  filtersScroll: {
    marginBottom: 8,
  },
  filterButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    minWidth: 80,
  },
  selectedFilter: {
    backgroundColor: '#8b5cf6',
  },
  filterIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '500',
  },
  selectedFilterText: {
    color: '#fff',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  resultsTitle: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 12,
  },
  sortButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  roomsList: {
    flex: 1,
  },
  roomsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  roomCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  roomBanner: {
    width: '100%',
    height: 120,
  },
  roomBadges: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  trendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  roomContent: {
    padding: 16,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  roomName: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  roomActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  roomDescription: {
    color: '#6b7280',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  roomMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 4,
  },
  roomStats: {
    alignItems: 'flex-end',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
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
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantCount: {
    color: '#94a3b8',
    fontSize: 12,
    marginLeft: 4,
  },
  roomTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: '#6d28d9',
    fontSize: 10,
    fontWeight: '500',
  },
  toggleWrap: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  toggleBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  toggleBtnActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  toggleText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#ffffff',
  },
  gridCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    flex: 1,
  },
  gridBanner: {
    width: '100%',
    height: 110,
  },
  gridContent: {
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  gridAvatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: '#8b5cf6',
    overflow: 'hidden',
    marginTop: -32,
    backgroundColor: '#fff',
  },
  gridAvatar: {
    width: '100%',
    height: '100%',
  },
  gridName: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  gridMetaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gridMetaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },
  gridMetaText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '600',
  },
});
