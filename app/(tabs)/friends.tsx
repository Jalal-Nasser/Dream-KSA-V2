import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Search,
  UserPlus,
  Users,
  UserCheck,
  UserX,
  MoreHorizontal,
  MessageCircle,
  Phone,
  Video,
  Crown,
  Star,
  Gift,
  Heart,
  Clock,
  Filter,
  ChevronRight,
  X,
  Check,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Friend {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isOnline: boolean;
  lastSeen?: string;
  isVerified: boolean;
  isPremium: boolean;
  level: number;
  mutualFriends: number;
  status: 'online' | 'offline' | 'away' | 'busy';
  currentRoom?: string;
  isInRoom: boolean;
}

interface FriendRequest {
  id: string;
  user: Friend;
  sentAt: string;
  message?: string;
}

interface FriendCategory {
  id: string;
  name: string;
  count: number;
  icon: React.ReactNode;
}

const FriendsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'suggestions'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // Sample data
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [filteredFriends, setFilteredFriends] = useState<Friend[]>([]);

  useEffect(() => {
    // Initialize sample data
    const sampleFriends: Friend[] = [
      {
        id: '1',
        name: 'أحمد محمد',
        username: '@ahmed_mohamed',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
        isOnline: true,
        isVerified: true,
        isPremium: true,
        level: 15,
        mutualFriends: 12,
        status: 'online',
        currentRoom: 'غرفة التقنية',
        isInRoom: true,
      },
      {
        id: '2',
        name: 'فاطمة علي',
        username: '@fatima_ali',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face',
        isOnline: true,
        isVerified: false,
        isPremium: false,
        level: 8,
        mutualFriends: 8,
        status: 'online',
        isInRoom: false,
      },
      {
        id: '3',
        name: 'محمد حسن',
        username: '@mohamed_hassan',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face',
        isOnline: false,
        lastSeen: '2 hours ago',
        isVerified: true,
        isPremium: false,
        level: 22,
        mutualFriends: 15,
        status: 'offline',
        isInRoom: false,
      },
      {
        id: '4',
        name: 'سارة أحمد',
        username: '@sara_ahmed',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face',
        isOnline: true,
        isVerified: false,
        isPremium: true,
        level: 12,
        mutualFriends: 6,
        status: 'away',
        currentRoom: 'غرفة الموسيقى',
        isInRoom: true,
      },
      {
        id: '5',
        name: 'علي محمود',
        username: '@ali_mahmoud',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
        isOnline: false,
        lastSeen: '1 day ago',
        isVerified: false,
        isPremium: false,
        level: 5,
        mutualFriends: 3,
        status: 'offline',
        isInRoom: false,
      },
    ];

    const sampleRequests: FriendRequest[] = [
      {
        id: '1',
        user: {
          id: '6',
          name: 'ليلى كريم',
          username: '@layla_karim',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
          isOnline: true,
          isVerified: false,
          isPremium: false,
          level: 7,
          mutualFriends: 4,
          status: 'online',
          isInRoom: false,
        },
        sentAt: '2 hours ago',
        message: 'مرحباً! أود أن أكون صديقتك',
      },
      {
        id: '2',
        user: {
          id: '7',
          name: 'كريم سعد',
          username: '@karim_saad',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
          isOnline: false,
          lastSeen: '5 hours ago',
          isVerified: true,
          isPremium: false,
          level: 18,
          mutualFriends: 9,
          status: 'offline',
          isInRoom: false,
        },
        sentAt: '1 day ago',
        message: 'أحب محتواك! دعنا نتواصل',
      },
    ];

    setFriends(sampleFriends);
    setFriendRequests(sampleRequests);
    setFilteredFriends(sampleFriends);
  }, []);

  useEffect(() => {
    // Filter friends based on search and filters
    let filtered = friends;
    
    if (searchQuery) {
      filtered = filtered.filter(friend =>
        friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        friend.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(friend => friend.status === selectedStatus);
    }
    
    if (selectedLevel !== 'all') {
      const levelNum = parseInt(selectedLevel);
      if (levelNum === 0) {
        filtered = filtered.filter(friend => friend.level < 10);
      } else if (levelNum === 10) {
        filtered = filtered.filter(friend => friend.level >= 10 && friend.level < 20);
      } else if (levelNum === 20) {
        filtered = filtered.filter(friend => friend.level >= 20);
      }
    }
    
    setFilteredFriends(filtered);
  }, [searchQuery, selectedStatus, selectedLevel, friends]);

  const handleAcceptRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      // Add to friends list
      setFriends(prev => [...prev, request.user]);
      // Remove from requests
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      Alert.alert('تم القبول', `تم إضافة ${request.user.name} إلى قائمة الأصدقاء`);
    }
  };

  const handleRejectRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      setFriendRequests(prev => prev.filter(r => r.id !== requestId));
      Alert.alert('تم الرفض', `تم رفض طلب ${request.user.name}`);
    }
  };

  const handleRemoveFriend = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    if (friend) {
      Alert.alert(
        'إزالة الصديق',
        `هل أنت متأكد من إزالة ${friend.name} من قائمة الأصدقاء؟`,
        [
          { text: 'إلغاء', style: 'cancel' },
          {
            text: 'إزالة',
            style: 'destructive',
            onPress: () => {
              setFriends(prev => prev.filter(f => f.id !== friendId));
              Alert.alert('تم الإزالة', `تم إزالة ${friend.name} من قائمة الأصدقاء`);
            },
          },
        ]
      );
    }
  };

  const handleJoinRoom = (roomName: string) => {
    // Navigate to room
    router.push(`/roomdetails?room=${encodeURIComponent(roomName)}`);
  };

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendInfo}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View style={[
            styles.statusIndicator,
            { backgroundColor: item.isOnline ? '#10B981' : '#6B7280' }
          ]} />
          {item.isVerified && (
            <View style={styles.verifiedBadge}>
              <Check size={12} color="#FFFFFF" />
            </View>
          )}
        </View>
        
        <View style={styles.friendDetails}>
          <View style={styles.nameRow}>
            <Text style={styles.friendName}>{item.name}</Text>
            {item.isPremium && (
              <Crown size={16} color="#F59E0B" />
            )}
          </View>
          
          <Text style={styles.username}>{item.username}</Text>
          
          <View style={styles.friendStats}>
            <View style={styles.statItem}>
              <Star size={14} color="#F59E0B" />
              <Text style={styles.statText}>المستوى {item.level}</Text>
            </View>
            <View style={styles.statItem}>
              <Users size={14} color="#8B5CF6" />
              <Text style={styles.statText}>{item.mutualFriends} صديق مشترك</Text>
            </View>
          </View>
          
          {item.isInRoom && item.currentRoom && (
            <TouchableOpacity
              style={styles.roomIndicator}
              onPress={() => handleJoinRoom(item.currentRoom!)}
            >
              <Text style={styles.roomText}>🎤 في {item.currentRoom}</Text>
              <ChevronRight size={14} color="#3B82F6" />
            </TouchableOpacity>
          )}
          
          {!item.isOnline && item.lastSeen && (
            <Text style={styles.lastSeen}>آخر ظهور: {item.lastSeen}</Text>
          )}
        </View>
      </View>
      
      <View style={styles.friendActions}>
        <TouchableOpacity style={styles.actionButton}>
          <MessageCircle size={20} color="#3B82F6" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Phone size={20} color="#10B981" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionButton}>
          <Video size={20} color="#8B5CF6" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleRemoveFriend(item.id)}
        >
          <UserX size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <Image source={{ uri: item.user.avatar }} style={styles.requestAvatar} />
        
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>{item.user.name}</Text>
          <Text style={styles.requestUsername}>{item.user.username}</Text>
          {item.message && (
            <Text style={styles.requestMessage}>{item.message}</Text>
          )}
          <Text style={styles.requestTime}>{item.sentAt}</Text>
        </View>
      </View>
      
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={[styles.requestButton, styles.acceptButton]}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Check size={16} color="#FFFFFF" />
          <Text style={styles.acceptButtonText}>قبول</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.requestButton, styles.rejectButton]}
          onPress={() => handleRejectRequest(item.id)}
        >
          <X size={16} color="#FFFFFF" />
          <Text style={styles.rejectButtonText}>رفض</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTabButton = (tab: 'friends' | 'requests' | 'suggestions', label: string, count: number) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabButtonText]}>
        {label}
      </Text>
      <View style={[styles.tabBadge, activeTab === tab && styles.activeTabBadge]}>
        <Text style={[styles.tabBadgeText, activeTab === tab && styles.activeTabBadgeText]}>
          {count}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderFilterOption = (value: string, label: string, isSelected: boolean) => (
    <TouchableOpacity
      key={value}
      style={[styles.filterOption, isSelected && styles.selectedFilterOption]}
      onPress={() => {
        if (value === 'status') {
          setSelectedStatus(selectedStatus === 'all' ? 'online' : 'all');
        } else if (value === 'level') {
          setSelectedLevel(selectedLevel === 'all' ? '0' : 'all');
        }
      }}
    >
      <Text style={[styles.filterOptionText, isSelected && styles.selectedFilterOptionText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#1F2937', '#111827']}
      style={styles.container}
    >
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Users size={24} color="#3B82F6" />
          <Text style={styles.headerTitle}>الأصدقاء</Text>
        </View>
        
        <TouchableOpacity style={styles.addFriendButton}>
          <UserPlus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="البحث عن الأصدقاء..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} color={showFilters ? '#3B82F6' : '#9CA3AF'} />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>الحالة:</Text>
            <View style={styles.filterOptions}>
              {renderFilterOption('status', 'متصل', selectedStatus !== 'all')}
              {renderFilterOption('status', 'غير متصل', selectedStatus === 'offline')}
            </View>
          </View>
          
          <View style={styles.filterSection}>
            <Text style={styles.filterLabel}>المستوى:</Text>
            <View style={styles.filterOptions}>
              {renderFilterOption('level', 'مبتدئ', selectedLevel === '0')}
              {renderFilterOption('level', 'متوسط', selectedLevel === '10')}
              {renderFilterOption('level', 'متقدم', selectedLevel === '20')}
            </View>
          </View>
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {renderTabButton('friends', 'الأصدقاء', friends.length)}
        {renderTabButton('requests', 'الطلبات', friendRequests.length)}
        {renderTabButton('suggestions', 'اقتراحات', 5)}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'friends' && (
          <FlatList
            data={filteredFriends}
            renderItem={renderFriend}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Users size={48} color="#6B7280" />
                <Text style={styles.emptyStateText}>لا يوجد أصدقاء</Text>
                <Text style={styles.emptyStateSubtext}>ابدأ بإضافة أصدقاء جدد</Text>
              </View>
            }
          />
        )}
        
        {activeTab === 'requests' && (
          <FlatList
            data={friendRequests}
            renderItem={renderFriendRequest}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <UserPlus size={48} color="#6B7280" />
                <Text style={styles.emptyStateText}>لا توجد طلبات</Text>
                <Text style={styles.emptyStateSubtext}>جميع طلبات الصداقة تمت معالجتها</Text>
              </View>
            }
          />
        )}
        
        {activeTab === 'suggestions' && (
          <View style={styles.emptyState}>
            <Users size={48} color="#6B7280" />
            <Text style={styles.emptyStateText}>قريباً</Text>
            <Text style={styles.emptyStateSubtext}>سيتم إضافة اقتراحات الأصدقاء قريباً</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  addFriendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    marginLeft: 12,
    fontSize: 16,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filtersContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  filterSection: {
    marginBottom: 16,
  },
  filterLabel: {
    color: '#F3F4F6',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'right',
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedFilterOption: {
    backgroundColor: '#3B82F6',
  },
  filterOptionText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  selectedFilterOptionText: {
    color: '#FFFFFF',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: '#3B82F6',
  },
  tabButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '600',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  tabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  activeTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  tabBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  friendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  verifiedBadge: {
    position: 'absolute',
    top: -2,
    left: -2,
    backgroundColor: '#10B981',
    borderRadius: 8,
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  friendName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  username: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  friendStats: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  roomIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  roomText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
  lastSeen: {
    color: '#6B7280',
    fontSize: 12,
    fontStyle: 'italic',
  },
  friendActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  requestCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  requestAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  requestUsername: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 8,
  },
  requestMessage: {
    color: '#D1D5DB',
    fontSize: 14,
    marginBottom: 4,
  },
  requestTime: {
    color: '#6B7280',
    fontSize: 12,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  requestButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default FriendsScreen;
