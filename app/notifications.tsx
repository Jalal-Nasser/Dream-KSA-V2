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
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  Bell,
  Users,
  Gift,
  Mic,
  Crown,
  Star,
  Heart,
  MessageCircle,
  Settings,
  Check,
  X,
  Clock,
  UserPlus,
  Volume2,
  VolumeX
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Notification {
  id: string;
  type: 'friend_request' | 'room_invite' | 'gift' | 'system' | 'achievement' | 'level_up';
  title: string;
  message: string;
  senderId?: string;
  senderName?: string;
  senderAvatar?: string;
  roomId?: string;
  roomName?: string;
  giftName?: string;
  giftValue?: number;
  timestamp: string;
  isRead: boolean;
  actionRequired: boolean;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'requests'>('all');

  useEffect(() => {
    // Sample notifications data
    const sampleNotifications: Notification[] = [
      {
        id: '1',
        type: 'friend_request',
        title: 'طلب صداقة جديد',
        message: 'أرسل لك أحمد محمد طلب صداقة',
        senderId: 'user1',
        senderName: 'أحمد محمد',
        senderAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        timestamp: '2024-01-15T10:30:00Z',
        isRead: false,
        actionRequired: true
      },
      {
        id: '2',
        type: 'room_invite',
        title: 'دعوة لغرفة جديدة',
        message: 'دعاك فاطمة علي للانضمام إلى غرفة الموسيقى العربية',
        senderId: 'user2',
        senderName: 'فاطمة علي',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        roomId: 'room1',
        roomName: 'غرفة الموسيقى العربية',
        timestamp: '2024-01-15T09:15:00Z',
        isRead: false,
        actionRequired: true
      },
      {
        id: '3',
        type: 'gift',
        title: 'هدية جديدة!',
        message: 'أرسل لك محمد حسن هدية قيمة',
        senderId: 'user3',
        senderName: 'محمد حسن',
        senderAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        giftName: 'تاج ذهبي',
        giftValue: 100,
        timestamp: '2024-01-15T08:45:00Z',
        isRead: true,
        actionRequired: false
      },
      {
        id: '4',
        type: 'achievement',
        title: 'إنجاز جديد!',
        message: 'لقد حققت إنجاز "مستمع نشط"',
        timestamp: '2024-01-15T07:20:00Z',
        isRead: true,
        actionRequired: false
      },
      {
        id: '5',
        type: 'level_up',
        title: 'مستوى جديد!',
        message: 'تهانينا! لقد وصلت إلى المستوى 5',
        timestamp: '2024-01-15T06:30:00Z',
        isRead: true,
        actionRequired: false
      },
      {
        id: '6',
        type: 'system',
        title: 'تحديث التطبيق',
        message: 'تم إصدار تحديث جديد للتطبيق مع ميزات جديدة',
        timestamp: '2024-01-14T18:00:00Z',
        isRead: false,
        actionRequired: false
      }
    ];
    
    setNotifications(sampleNotifications);
  }, []);

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.isRead);
      case 'requests':
        return notifications.filter(n => n.actionRequired);
      default:
        return notifications;
    }
  };

  const handleAcceptFriendRequest = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true, actionRequired: false }
          : n
      )
    );
    Alert.alert('تم القبول', 'تم قبول طلب الصداقة بنجاح');
  };

  const handleRejectFriendRequest = (notificationId: string) => {
    setNotifications(prev => 
      prev.filter(n => n.id !== notificationId)
    );
    Alert.alert('تم الرفض', 'تم رفض طلب الصداقة');
  };

  const handleJoinRoom = (roomId: string, roomName: string) => {
    router.push({
      pathname: '/voicechat',
      params: { roomId, roomName }
    });
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => 
        n.id === notificationId 
          ? { ...n, isRead: true }
          : n
      )
    );
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
        return <UserPlus size={24} color="#10b981" />;
      case 'room_invite':
        return <Mic size={24} color="#8b5cf6" />;
      case 'gift':
        return <Gift size={24} color="#f59e0b" />;
      case 'achievement':
        return <Star size={24} color="#8b5cf6" />;
      case 'level_up':
        return <Crown size={24} color="#f59e0b" />;
      case 'system':
        return <Bell size={24} color="#6b7280" />;
      default:
        return <Bell size={24} color="#6b7280" />;
    }
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'friend_request':
        return '#10b981';
      case 'room_invite':
        return '#8b5cf6';
      case 'gift':
        return '#f59e0b';
      case 'achievement':
        return '#8b5cf6';
      case 'level_up':
        return '#f59e0b';
      case 'system':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <View style={[
      styles.notificationItem,
      !item.isRead && styles.unreadNotification
    ]}>
      <View style={[
        styles.notificationIcon,
        { backgroundColor: `${getNotificationColor(item.type)}20` }
      ]}>
        {getNotificationIcon(item.type)}
      </View>
      
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTime}>
            {new Date(item.timestamp).toLocaleDateString('ar-SA', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
        
        <Text style={styles.notificationMessage}>{item.message}</Text>
        
        {item.senderName && (
          <View style={styles.senderInfo}>
            <Image 
              source={{ uri: item.senderAvatar }} 
              style={styles.senderAvatar}
            />
            <Text style={styles.senderName}>{item.senderName}</Text>
          </View>
        )}
        
        {item.giftName && (
          <View style={styles.giftInfo}>
            <Text style={styles.giftName}>🎁 {item.giftName}</Text>
            <Text style={styles.giftValue}>{item.giftValue} نقطة</Text>
          </View>
        )}
        
        {item.actionRequired && item.type === 'friend_request' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAcceptFriendRequest(item.id)}
            >
              <Check size={16} color="#fff" />
              <Text style={styles.actionButtonText}>قبول</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleRejectFriendRequest(item.id)}
            >
              <X size={16} color="#fff" />
              <Text style={styles.actionButtonText}>رفض</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {item.actionRequired && item.type === 'room_invite' && (
          <TouchableOpacity 
            style={styles.joinRoomButton}
            onPress={() => item.roomId && item.roomName && handleJoinRoom(item.roomId, item.roomName)}
          >
            <Mic size={16} color="#fff" />
            <Text style={styles.joinRoomButtonText}>انضم للغرفة</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {!item.isRead && (
        <TouchableOpacity 
          style={styles.markAsReadButton}
          onPress={() => handleMarkAsRead(item.id)}
        >
          <Text style={styles.markAsReadText}>تحديد كمقروء</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderTabButton = (tab: 'all' | 'unread' | 'requests', label: string, count: number) => (
    <TouchableOpacity 
      style={[
        styles.tabButton,
        activeTab === tab && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[
        styles.tabButtonText,
        activeTab === tab && styles.activeTabButtonText
      ]}>
        {label}
      </Text>
      {count > 0 && (
        <View style={styles.tabBadge}>
          <Text style={styles.tabBadgeText}>{count}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const requestsCount = notifications.filter(n => n.actionRequired).length;

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
          
          <Text style={styles.headerTitle}>الإشعارات</Text>
          
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/profile/settings')}
          >
            <Settings size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {renderTabButton('all', 'الكل', notifications.length)}
          {renderTabButton('unread', 'غير مقروء', unreadCount)}
          {renderTabButton('requests', 'طلبات', requestsCount)}
        </View>

        {/* Notifications List */}
        <FlatList
          data={getFilteredNotifications()}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Bell size={64} color="#6b7280" />
              <Text style={styles.emptyStateTitle}>لا توجد إشعارات</Text>
              <Text style={styles.emptyStateMessage}>
                {activeTab === 'all' && 'ستظهر هنا جميع إشعاراتك'}
                {activeTab === 'unread' && 'لا توجد إشعارات غير مقروءة'}
                {activeTab === 'requests' && 'لا توجد طلبات معلقة'}
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
  settingsButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    position: 'relative',
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
  tabBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  notificationsList: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    position: 'relative',
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: '#8b5cf6',
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  notificationTime: {
    color: '#94a3b8',
    fontSize: 12,
  },
  notificationMessage: {
    color: '#cbd5e1',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  senderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  senderName: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  giftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 12,
  },
  giftName: {
    color: '#f59e0b',
    fontSize: 14,
    fontWeight: '600',
  },
  giftValue: {
    color: '#f59e0b',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  rejectButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  joinRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
    alignSelf: 'flex-start',
  },
  joinRoomButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  markAsReadButton: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  markAsReadText: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '600',
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
