import React, { useState } from 'react';
import { USE_FIGMA_SCREENS } from '@/lib/featureFlags';
import FigmaRNProfile from '@/components/figma-rn/Profile';
import { Platform, ScrollView, Dimensions } from 'react-native';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  Settings, 
  LogOut, 
  User, 
  Bell, 
  Crown, 
  Gift, 
  Users, 
  Mic, 
  Heart, 
  Star, 
  Edit3, 
  Camera,
  Shield,
  HelpCircle,
  Info,
  Share2,
  Copy,
  Mail,
  Phone,
  Globe,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Lock,
  Key,
  Trash2,
  AlertTriangle,
  Clock
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface UserStats {
  totalRooms: number;
  totalGifts: number;
  totalFriends: number;
  totalHours: number;
  level: number;
  experience: number;
  nextLevelExp: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface Friend {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  isOnline: boolean;
  lastSeen?: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showStats, setShowStats] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);
  const [showFriends, setShowFriends] = useState(true);

  if (USE_FIGMA_SCREENS && Platform.OS !== 'web') {
    return <FigmaRNProfile onBack={() => {}} />;
  }

  // Mock data
  const userStats: UserStats = {
    totalRooms: 47,
    totalGifts: 156,
    totalFriends: 23,
    totalHours: 89,
    level: 8,
    experience: 1250,
    nextLevelExp: 1500,
  };

  const achievements: Achievement[] = [
    { id: '1', title: 'أول غرفة', description: 'أنشئ غرفة صوتية لأول مرة', icon: '🎉', isUnlocked: true, progress: 1, maxProgress: 1 },
    { id: '2', title: 'مضيف نشط', description: 'استضف 10 غرف', icon: '🏠', isUnlocked: true, progress: 10, maxProgress: 10 },
    { id: '3', title: 'صديق اجتماعي', description: 'أضف 20 صديق', icon: '👥', isUnlocked: false, progress: 23, maxProgress: 20 },
    { id: '4', title: 'محسن سخي', description: 'أرسل 100 هدية', icon: '🎁', isUnlocked: false, progress: 156, maxProgress: 100 },
    { id: '5', title: 'مستمع مخلص', description: 'اقضِ 100 ساعة في الغرف', icon: '⏰', isUnlocked: false, progress: 89, maxProgress: 100 },
  ];

  const friends: Friend[] = [
    { id: '1', name: 'سارة أحمد', avatar: '', status: 'online', isOnline: true },
    { id: '2', name: 'محمد علي', avatar: '', status: 'online', isOnline: true },
    { id: '3', name: 'فاطمة حسن', avatar: '', status: 'away', isOnline: false, lastSeen: 'منذ 5 دقائق' },
    { id: '4', name: 'علي محمود', avatar: '', status: 'offline', isOnline: false, lastSeen: 'منذ ساعة' },
    { id: '5', name: 'نور الدين', avatar: '', status: 'online', isOnline: true },
  ];

  const renderAchievement = ({ item }: { item: Achievement }) => (
    <View style={[styles.achievementCard, !item.isUnlocked && styles.achievementLocked]}>
      <Text style={styles.achievementIcon}>{item.icon}</Text>
      <View style={styles.achievementContent}>
        <Text style={[styles.achievementTitle, !item.isUnlocked && styles.achievementTitleLocked]}>
          {item.title}
        </Text>
        <Text style={[styles.achievementDescription, !item.isUnlocked && styles.achievementDescriptionLocked]}>
          {item.description}
        </Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(item.progress / item.maxProgress) * 100}%` }]} />
        </View>
        <Text style={[styles.progressText, !item.isUnlocked && styles.progressTextLocked]}>
          {item.progress}/{item.maxProgress}
        </Text>
      </View>
      {item.isUnlocked && <Crown size={20} color="#fbbf24" style={styles.achievementBadge} />}
    </View>
  );

  const renderFriend = ({ item }: { item: Friend }) => (
    <View style={styles.friendCard}>
      <View style={styles.friendAvatar}>
        <User size={24} color="#fff" />
        <View style={[styles.statusDot, { backgroundColor: item.isOnline ? '#10b981' : '#6b7280' }]} />
      </View>
      <View style={styles.friendInfo}>
        <Text style={styles.friendName}>{item.name}</Text>
        <Text style={styles.friendStatus}>
          {item.isOnline ? 'متصل الآن' : item.lastSeen || 'غير متصل'}
        </Text>
      </View>
      <TouchableOpacity style={styles.friendAction}>
        <Mic size={20} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  );

  const renderStatsCard = (icon: React.ReactNode, value: string, label: string, color: string) => (
    <View style={styles.statsCard}>
      <View style={[styles.statsIcon, { backgroundColor: color }]}>
        {icon}
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </View>
  );

  return (
    <LinearGradient colors={["#1F2937", "#111827", "#0A0E15"]} style={{ flex: 1 }}>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20 }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>الملف الشخصي</Text>
            <TouchableOpacity style={styles.editButton}>
              <Edit3 size={20} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <User size={40} color="#fff" />
              </View>
              <TouchableOpacity style={styles.cameraButton}>
                <Camera size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>أحمد محمد</Text>
            <Text style={styles.userStatus}>متصل الآن</Text>
            
            {/* Level Progress */}
            <View style={styles.levelContainer}>
              <View style={styles.levelInfo}>
                <Crown size={16} color="#fbbf24" />
                <Text style={styles.levelText}>المستوى {userStats.level}</Text>
              </View>
              <View style={styles.levelProgressBar}>
                <View style={[styles.levelProgressFill, { width: `${(userStats.experience / userStats.nextLevelExp) * 100}%` }]} />
              </View>
              <Text style={styles.levelProgressText}>
                {userStats.experience}/{userStats.nextLevelExp} XP
              </Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setShowStats(!showStats)}
            >
              <Text style={styles.sectionTitle}>الإحصائيات</Text>
              <Text style={styles.sectionToggle}>{showStats ? 'إخفاء' : 'إظهار'}</Text>
            </TouchableOpacity>
            
            {showStats && (
              <View style={styles.statsGrid}>
                {renderStatsCard(<Mic size={20} color="#fff" />, userStats.totalRooms.toString(), 'الغرف', '#3b82f6')}
                {renderStatsCard(<Gift size={20} color="#fff" />, userStats.totalGifts.toString(), 'الهدايا', '#f59e0b')}
                {renderStatsCard(<Users size={20} color="#fff" />, userStats.totalFriends.toString(), 'الأصدقاء', '#10b981')}
                {renderStatsCard(<Clock size={20} color="#fff" />, `${userStats.totalHours}h`, 'الساعات', '#8b5cf6')}
              </View>
            )}
          </View>

          {/* Achievements Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setShowAchievements(!showAchievements)}
            >
              <Text style={styles.sectionTitle}>الإنجازات</Text>
              <Text style={styles.sectionToggle}>{showAchievements ? 'إخفاء' : 'إظهار'}</Text>
            </TouchableOpacity>
            
            {showAchievements && (
              <FlatList
                data={achievements}
                renderItem={renderAchievement}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.achievementsList}
              />
            )}
          </View>

          {/* Friends Section */}
          <View style={styles.section}>
            <TouchableOpacity 
              style={styles.sectionHeader}
              onPress={() => setShowFriends(!showFriends)}
            >
              <Text style={styles.sectionTitle}>الأصدقاء</Text>
              <Text style={styles.sectionToggle}>{showFriends ? 'إخفاء' : 'إظهار'}</Text>
            </TouchableOpacity>
            
            {showFriends && (
              <FlatList
                data={friends}
                renderItem={renderFriend}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.friendsList}
              />
            )}
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => router.push('/settings')}
            >
              <View style={styles.menuItemLeft}>
                <Settings size={24} color="#fff" />
                <Text style={styles.menuItemText}>الإعدادات</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Bell size={24} color="#fff" />
                <Text style={styles.menuItemText}>الإشعارات</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Shield size={24} color="#fff" />
                <Text style={styles.menuItemText}>الخصوصية والأمان</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <HelpCircle size={24} color="#fff" />
                <Text style={styles.menuItemText}>المساعدة والدعم</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Info size={24} color="#fff" />
                <Text style={styles.menuItemText}>حول التطبيق</Text>
              </View>
              <Text style={styles.menuItemArrow}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <Share2 size={24} color="#fff" />
                <Text style={styles.menuItemText}>مشاركة التطبيق</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuItemLeft}>
                <LogOut size={24} color="#e11d48" />
                <Text style={[styles.menuItemText, { color: '#e11d48' }]}>تسجيل الخروج</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'right',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1f2937',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  userStatus: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 20,
  },
  levelContainer: {
    width: '100%',
    alignItems: 'center',
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
    marginLeft: 8,
  },
  levelProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginBottom: 8,
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
    borderRadius: 3,
  },
  levelProgressText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  sectionToggle: {
    fontSize: 14,
    color: '#3b82f6',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statsCard: {
    width: (width - 60) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
  },
  statsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statsLabel: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
  },
  achievementsList: {
    marginBottom: 0,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  achievementLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  achievementTitleLocked: {
    color: '#6b7280',
  },
  achievementDescription: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  achievementDescriptionLocked: {
    color: '#6b7280',
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  progressTextLocked: {
    color: '#6b7280',
  },
  achievementBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  friendsList: {
    marginBottom: 0,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  friendAvatar: {
    position: 'relative',
    marginRight: 16,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  friendStatus: {
    fontSize: 14,
    color: '#94a3b8',
  },
  friendAction: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  menuSection: {
    marginBottom: 20,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    marginBottom: 12,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: 18,
    color: '#fff',
    marginLeft: 16,
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#94a3b8',
  },
});


