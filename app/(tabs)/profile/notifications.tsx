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
  RefreshControl,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  Bell,
  BellOff,
  Check,
  X,
  Heart,
  Gift,
  Users,
  Mic,
  MessageCircle,
  Crown,
  Star,
  TrendingUp,
  Settings,
  Filter,
  Trash2,
  MoreHorizontal
} from 'lucide-react-native';

interface Notification {
  id: string;
  type: 'friend_request' | 'gift' | 'room_invite' | 'achievement' | 'system' | 'like' | 'comment';
  title: string;
  message: string;
  sender?: {
    id: string;
    name: string;
    avatar: string;
  };
  room?: {
    id: string;
    name: string;
  };
  gift?: {
    id: string;
    name: string;
    icon: string;
  };
  timestamp: string;
  isRead: boolean;
  isActionable: boolean;
  actions?: {
    accept?: () => void;
    decline?: () => void;
    view?: () => void;
  };
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Sample notifications data
  useEffect(() => {
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'friend_request',
        title: 'طلب صداقة جديد',
        message: 'أرسل لك طلب صداقة',
        sender: {
          id: '1',
          name: 'فاطمة علي',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face'
        },
        timestamp: new Date(Date.now() - 300000).toISOString(),
        isRead: false,
        isActionable: true,
        actions: {
          accept: () => handleAcceptFriend('1'),
          decline: () => handleDeclineFriend('1')
        }
      },
      {
        id: '2',
        type: 'gift',
        title: 'هدية جديدة!',
        message: 'أرسل لك هدية جميلة',
        sender: {
          id: '2',
          name: 'محمد حسن',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face'
        },
        gift: {
          id: '1',
          name: 'قلب نابض',
          icon: '❤️'
        },
        timestamp: new Date(Date.now() - 900000).toISOString(),
        isRead: false,
        isActionable: false
      }
    ];

    setNotifications(sampleNotifications);
    setFilteredNotifications(sampleNotifications);
  }, []);

  const filterNotifications = (filterType: string) => {
    setSelectedFilter(filterType);
    if (filterType === 'all') {
      setFilteredNotifications(notifications);
    } else {
      setFilteredNotifications(notifications.filter(n => n.type === filterType));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
    setFilteredNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setFilteredNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert(
      'حذف الإشعار',
      'هل أنت متأكد من حذف هذا الإشعار؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'حذف', 
          style: 'destructive',
          onPress: () => {
            setNotifications(prev => prev.filter(n => n.id !== notificationId));
            setFilteredNotifications(prev => prev.filter(n => n.id !== notificationId));
          }
        }
      ]
    );
  };

  const handleAcceptFriend = (userId: string) => {
    Alert.alert('تم القبول', 'تم قبول طلب الصداقة بنجاح!');
    setNotifications(prev => prev.filter(n => n.id !== '1'));
    setFilteredNotifications(prev => prev.filter(n => n.id !== '1'));
  };

  const handleDeclineFriend = (userId: string) => {
    Alert.alert('تم الرفض', 'تم رفض طلب الصداقة');
    setNotifications(prev => prev.filter(n => n.id !== '1'));
    setFilteredNotifications(prev => prev.filter(n => n.id !== '1'));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return <Users size={24} color="#10b981" />;
      case 'gift': return <Gift size={24} color="#f59e0b" />;
      case 'room_invite': return <Mic size={24} color="#3b82f6" />;
      case 'achievement': return <Star size={24} color="#8b5cf6" />;
      case 'like': return <Heart size={24} color="#ef4444" />;
      case 'comment': return <MessageCircle size={24} color="#8b5cf6" />;
      case 'system': return <Settings size={24} color="#94a3b8" />;
      default: return <Bell size={24} color="#94a3b8" />;
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'الآن';
    if (diffInMinutes < 60) return `منذ ${diffInMinutes} دقيقة`;
    if (diffInMinutes < 1440) return `منذ ${Math.floor(diffInMinutes / 60)} ساعة`;
    return `منذ ${Math.floor(diffInMinutes / 1440)} يوم`;
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[
      styles.notificationItem,
      !item.isRead && styles.unreadNotification
    ]}>
      <View style={styles.notificationIcon}>
        {getNotificationIcon(item.type)}
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>{getTimeAgo(item.timestamp)}</Text>
        </View>
        
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        {item.sender && (
          <View style={styles.senderInfo}>
            <Image source={{ uri: item.sender.avatar }} style={styles.senderAvatar} />
            <Text style={styles.senderName}>{item.sender.name}</Text>
          </View>
        )}
        
        {item.gift && (
          <View style={styles.giftInfo}>
            <Text style={styles.giftIcon}>{item.gift.icon}</Text>
            <Text style={styles.giftName}>{item.gift.name}</Text>
          </View>
        )}
        
        {item.isActionable && item.actions && (
          <View style={styles.notificationActions}>
            {item.actions.accept && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={item.actions.accept}
              >
                <Check size={16} color="#fff" />
                <Text style={styles.actionButtonText}>قبول</Text>
              </TouchableOpacity>
            )}
            {item.actions.decline && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.declineButton]}
                onPress={item.actions.decline}
              >
                <X size={16} color="#fff" />
                <Text style={styles.actionButtonText}>رفض</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      
      <View style={styles.notificationActions}>
        <TouchableOpacity 
          style={styles.markReadButton}
          onPress={() => markAsRead(item.id)}
        >
          {item.isRead ? <Check size={16} color="#10b981" /> : <Bell size={16} color="#94a3b8" />}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.deleteButton}
          onPress={() => deleteNotification(item.id)}
        >
          <Trash2 size={16} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderFilterButton = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.activeFilterButton
      ]}
      onPress={() => filterNotifications(filter.id)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === filter.id && styles.activeFilterText
      ]}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );

  const filters = [
    { id: 'all', name: 'الكل' },
    { id: 'friend_request', name: 'طلبات الصداقة' },
    { id: 'gift', name: 'الهدايا' },
    { id: 'room_invite', name: 'دعوات الغرف' },
    { id: 'achievement', name: 'الإنجازات' },
    { id: 'system', name: 'النظام' }
  ];

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b"]}
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
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>الإشعارات</Text>
            <Text style={styles.headerSubtitle}>
              {filteredNotifications.filter(n => !n.isRead).length} إشعار جديد
            </Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={markAllAsRead}
            >
              <Check size={20} color="#8b5cf6" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} color="#8b5cf6" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersList}
            >
              {filters.map(renderFilterButton)}
            </ScrollView>
          </View>
        )}

        {/* Notifications List */}
        <FlatList
          data={filteredNotifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8b5cf6"
            />
          }
          contentContainerStyle={styles.notificationsContent}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <BellOff size={64} color="#94a3b8" />
              <Text style={styles.emptyStateTitle}>لا توجد إشعارات</Text>
              <Text style={styles.emptyStateMessage}>
                عندما تحصل على إشعارات جديدة، ستظهر هنا
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
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    color: '#94a3b8',
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  filtersContainer: {
    marginBottom: 20,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: '#8b5cf6',
  },
  filterText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#fff',
  },
  notificationsList: {
    flex: 1,
  },
  notificationsContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  unreadNotification: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  notificationTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  notificationTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  notificationMessage: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  senderName: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '500',
  },
  giftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    marginBottom: 8,
  },
  giftIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  giftName: {
    color: '#fbbf24',
    fontSize: 14,
    fontWeight: '500',
  },
  notificationActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  markReadButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    color: '#94a3b8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
