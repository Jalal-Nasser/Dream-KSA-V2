import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Switch,
  Alert,
  Dimensions,
  TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { 
  Settings, 
  Edit, 
  Crown, 
  Star, 
  Users, 
  Mic, 
  Gift, 
  Heart,
  Bell,
  Shield,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Camera,
  Trash2,
  HelpCircle,
  Info,
  Share2,
  Download,
  Lock,
  Globe,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Smartphone,
  Monitor,
  Trophy
} from 'lucide-react-native';
import { supabase } from '../../../lib/supabase';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
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

interface Setting {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'toggle' | 'select' | 'action';
  value?: boolean | string;
  options?: string[];
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [settings, setSettings] = useState<Setting[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // WhatsApp verification state
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [codeChecking, setCodeChecking] = useState(false);
  const [whatsappStatus, setWhatsappStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Sample user data
  useEffect(() => {
    const sampleUser: User = {
      id: '1',
      name: 'أحمد محمد',
      username: '@ahmed_mohamed',
      email: 'ahmed@example.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
      bio: 'مطور تطبيقات ومحب للتقنية. أحب مشاركة المعرفة مع الآخرين.',
      level: 15,
      experience: 1250,
      coins: 1250,
      followers: 234,
      following: 156,
      roomsCreated: 8,
      totalTimeSpent: 45, // hours
      joinDate: '2023-01-15',
      isVerified: true,
      isPremium: true
    };
    setUser(sampleUser);

    const sampleAchievements: Achievement[] = [
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
      },
      {
        id: '5',
        name: 'المستمع المخلص',
        description: 'استمعت لمدة 100 ساعة',
        icon: '🎧',
        isUnlocked: false,
        progress: 45,
        maxProgress: 100
      }
    ];
    setAchievements(sampleAchievements);

                      const sampleSettings: Setting[] = [
            {
              id: 'settings',
              name: 'الإعدادات المتقدمة',
              description: 'إدارة جميع إعدادات التطبيق',
              icon: <Settings size={20} color="#8b5cf6" />,
              type: 'action'
            },
            {
              id: 'leaderboard',
              name: 'المتصدرين',
              description: 'عرض قائمة أفضل المستخدمين والغرف',
              icon: <Trophy size={20} color="#8b5cf6" />,
              type: 'action'
            },
            {
              id: 'notifications',
              name: 'الإشعارات',
              description: 'استقبال إشعارات من التطبيق',
              icon: <Bell size={20} color="#8b5cf6" />,
              type: 'toggle',
              value: true
            },
            {
              id: 'notifications_screen',
              name: 'عرض الإشعارات',
              description: 'عرض جميع الإشعارات والطلبات',
              icon: <Bell size={20} color="#8b5cf6" />,
              type: 'action'
            },
          {
            id: 'darkMode',
            name: 'الوضع المظلم',
            description: 'تفعيل المظهر المظلم',
            icon: <Moon size={20} color="#8b5cf6" />,
            type: 'toggle',
            value: true
          },
          {
            id: 'sound',
            name: 'الأصوات',
            description: 'تشغيل أصوات التطبيق',
            icon: <Volume2 size={20} color="#8b5cf6" />,
            type: 'toggle',
            value: true
          }
        ];
    setSettings(sampleSettings);
  }, []);

  const handleSettingChange = (settingId: string, value: boolean | string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, value } 
          : setting
      )
    );
  };

  const handleSettingAction = (settingId: string) => {
    switch (settingId) {
      case 'settings':
        router.push('/profile/settings');
        break;
      case 'leaderboard':
        router.push('/leaderboard');
        break;
      case 'notifications_screen':
        router.push('/notifications');
        break;
      case 'privacy':
        Alert.alert('الخصوصية', 'سيتم فتح إعدادات الخصوصية');
        break;
      case 'help':
        Alert.alert('المساعدة', 'سيتم فتح صفحة المساعدة');
        break;
      case 'about':
        Alert.alert('حول التطبيق', 'إصدار 1.0.0 - تطبيق غرف الدردشة الصوتية');
        break;
    }
  };

  const handleWhatsappVerification = async () => {
    if (!whatsappPhone.trim() || !whatsappPhone.startsWith('+')) {
      setWhatsappStatus({ type: 'error', message: 'يرجى إدخال رقم هاتف صحيح يبدأ بـ +' });
      return;
    }

    try {
      setWhatsappLoading(true);
      setWhatsappStatus(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setWhatsappStatus({ type: 'error', message: 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى' });
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL}/wa-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ phone: whatsappPhone.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setShowCodeInput(true);
        setWhatsappStatus({ type: 'success', message: 'تم إرسال رمز التحقق إلى واتساب' });
      } else {
        setWhatsappStatus({ 
          type: 'error', 
          message: `فشل التحقق: ${result.reason || result.error || 'خطأ غير معروف'}` 
        });
      }
    } catch (error: any) {
      setWhatsappStatus({ type: 'error', message: `خطأ في الاتصال: ${error.message}` });
    } finally {
      setWhatsappLoading(false);
    }
  };

  const handleCodeVerification = async () => {
    if (!verificationCode.trim() || verificationCode.length !== 6) {
      setWhatsappStatus({ type: 'error', message: 'يرجى إدخال رمز التحقق المكون من 6 أرقام' });
      return;
    }

    try {
      setCodeChecking(true);
      setWhatsappStatus(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setWhatsappStatus({ type: 'error', message: 'جلسة غير صالحة، يرجى تسجيل الدخول مرة أخرى' });
        return;
      }

      const response = await fetch(`${process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL}/wa-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          phone: whatsappPhone.trim(), 
          code: verificationCode.trim() 
        }),
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setWhatsappStatus({ type: 'success', message: 'تم التحقق بنجاح' });
        setShowCodeInput(false);
        setVerificationCode('');
        setWhatsappPhone('');
        // Refresh profile data if needed
      } else {
        setWhatsappStatus({ 
          type: 'error', 
          message: `فشل التحقق: ${result.reason || result.error || 'خطأ غير معروف'}` 
        });
      }
    } catch (error: any) {
      setWhatsappStatus({ type: 'error', message: `خطأ في الاتصال: ${error.message}` });
    } finally {
      setCodeChecking(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'تسجيل الخروج', 
          style: 'destructive',
          onPress: () => {
            // Handle logout logic
            router.replace('/login');
          }
        }
      ]
    );
  };

  const getLevelProgress = () => {
    if (!user) return 0;
    const currentLevelExp = user.experience % 100;
    return (currentLevelExp / 100) * 100;
  };

  const renderAchievement = (achievement: Achievement) => (
    <View key={achievement.id} style={styles.achievementItem}>
      <View style={[
        styles.achievementIcon,
        achievement.isUnlocked ? styles.unlockedAchievement : styles.lockedAchievement
      ]}>
        <Text style={styles.achievementIconText}>{achievement.icon}</Text>
      </View>
      
      <View style={styles.achievementInfo}>
        <Text style={[
          styles.achievementName,
          achievement.isUnlocked ? styles.unlockedText : styles.lockedText
        ]}>
          {achievement.name}
        </Text>
        <Text style={styles.achievementDescription}>{achievement.description}</Text>
        
        <View style={styles.achievementProgress}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(achievement.progress / achievement.maxProgress) * 100}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.maxProgress}
          </Text>
        </View>
        
        {achievement.isUnlocked && achievement.unlockedAt && (
          <Text style={styles.unlockedDate}>
            تم إنجازه في {new Date(achievement.unlockedAt).toLocaleDateString('ar-SA')}
          </Text>
        )}
      </View>
    </View>
  );

  const renderSetting = (setting: Setting) => (
    <TouchableOpacity 
      key={setting.id} 
      style={styles.settingItem}
      onPress={() => {
        if (setting.type === 'action') {
          handleSettingAction(setting.id);
        }
      }}
    >
      <View style={styles.settingIcon}>
        {setting.icon}
      </View>
      
      <View style={styles.settingInfo}>
        <Text style={styles.settingName}>{setting.name}</Text>
        <Text style={styles.settingDescription}>{setting.description}</Text>
      </View>
      
      {setting.type === 'toggle' && (
        <Switch
          value={setting.value as boolean}
          onValueChange={(value) => handleSettingChange(setting.id, value)}
          trackColor={{ false: '#374151', true: '#8b5cf6' }}
          thumbColor={setting.value ? '#fff' : '#9ca3af'}
        />
      )}
      
      {setting.type === 'select' && (
        <View style={styles.settingValue}>
          <Text style={styles.settingValueText}>{setting.value}</Text>
          <ChevronRight size={16} color="#9ca3af" />
        </View>
      )}
      
      {setting.type === 'action' && (
        <ChevronRight size={20} color="#9ca3af" />
      )}
    </TouchableOpacity>
  );

  if (!user) return null;

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b"]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
              {user.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>✓</Text>
                </View>
              )}
              <TouchableOpacity style={styles.editAvatarButton}>
                <Camera size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{user.name}</Text>
                {user.isPremium && (
                  <View style={styles.premiumBadge}>
                    <Crown size={16} color="#fbbf24" />
                  </View>
                )}
              </View>
              
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.bio}>{user.bio}</Text>
              
              <View style={styles.profileStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.followers}</Text>
                  <Text style={styles.statLabel}>متابع</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.following}</Text>
                  <Text style={styles.statLabel}>متابَع</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statNumber}>{user.roomsCreated}</Text>
                  <Text style={styles.statLabel}>غرفة</Text>
                </View>
              </View>
            </View>
            
            <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => setShowEditProfile(true)}
            >
              <Edit size={16} color="#8b5cf6" />
              <Text style={styles.editProfileText}>تعديل</Text>
            </TouchableOpacity>
          </View>

          {/* Level Progress */}
          <View style={styles.levelSection}>
            <View style={styles.levelHeader}>
              <View style={styles.levelInfo}>
                <Text style={styles.levelText}>المستوى {user.level}</Text>
                <Text style={styles.experienceText}>{user.experience} نقطة خبرة</Text>
              </View>
              <View style={styles.coinDisplay}>
                <Text style={styles.coinIcon}>🪙</Text>
                <Text style={styles.coinAmount}>{user.coins}</Text>
              </View>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[styles.progressFill, { width: `${getLevelProgress()}%` }]} 
                />
              </View>
              <Text style={styles.progressText}>
                {user.experience % 100}/100 للوصول للمستوى التالي
              </Text>
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>إحصائيات سريعة</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Mic size={24} color="#8b5cf6" />
                <Text style={styles.statCardNumber}>{user.totalTimeSpent}</Text>
                <Text style={styles.statCardLabel}>ساعة استماع</Text>
              </View>
              
              <View style={styles.statCard}>
                <Users size={24} color="#10b981" />
                <Text style={styles.statCardNumber}>{user.followers}</Text>
                <Text style={styles.statCardLabel}>متابع</Text>
              </View>
              
              <View style={styles.statCard}>
                <Gift size={24} color="#f59e0b" />
                <Text style={styles.statCardNumber}>32</Text>
                <Text style={styles.statCardLabel}>هدية مرسلة</Text>
              </View>
              
              <View style={styles.statCard}>
                <Heart size={24} color="#ef4444" />
                <Text style={styles.statCardNumber}>156</Text>
                <Text style={styles.statCardLabel}>إعجاب</Text>
              </View>
            </View>
          </View>

          {/* Achievements */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>الإنجازات</Text>
            <View style={styles.achievementsList}>
              {achievements.map(renderAchievement)}
            </View>
          </View>

          {/* Friends */}
          <View style={styles.friendsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>الأصدقاء</Text>
              <TouchableOpacity 
                style={styles.seeAllButton}
                onPress={() => router.push('/friends')}
              >
                <Text style={styles.seeAllText}>عرض الكل</Text>
                <ChevronRight size={16} color="#8b5cf6" />
              </TouchableOpacity>
            </View>
            <View style={styles.friendsPreview}>
              <View style={styles.friendPreviewItem}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face' }} 
                  style={styles.friendPreviewAvatar}
                />
                <Text style={styles.friendPreviewName}>أحمد محمد</Text>
              </View>
              <View style={styles.friendPreviewItem}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face' }} 
                  style={styles.friendPreviewAvatar}
                />
                <Text style={styles.friendPreviewName}>فاطمة علي</Text>
              </View>
              <View style={styles.friendPreviewItem}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face' }} 
                  style={styles.friendPreviewAvatar}
                />
                <Text style={styles.friendPreviewName}>محمد حسن</Text>
              </View>
              <View style={styles.friendPreviewItem}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face' }} 
                  style={styles.friendPreviewAvatar}
                />
                <Text style={styles.friendPreviewName}>سارة أحمد</Text>
              </View>
            </View>
          </View>

          {/* Settings */}
          <View style={styles.settingsSection}>
            <Text style={styles.sectionTitle}>الإعدادات</Text>
            <View style={styles.settingsList}>
              {settings.map(renderSetting)}
            </View>
          </View>

          {/* WhatsApp Verification */}
          <View style={styles.whatsappSection}>
            <View style={styles.whatsappNotice}>
              <Text style={styles.whatsappNoticeText}>
                WhatsApp verification will be enabled after server functions are deployed. Use SMS for now.
              </Text>
            </View>
            <Text style={styles.sectionTitle}>التحقق من الواتساب</Text>
            <View style={styles.whatsappCard}>
              <View style={styles.phoneInputRow}>
                <TextInput
                  style={styles.phoneInput}
                  placeholder="+9665xxxxxxx"
                  placeholderTextColor="#94a3b8"
                  keyboardType="phone-pad"
                  value={whatsappPhone}
                  onChangeText={setWhatsappPhone}
                  maxLength={13}
                />
                <TouchableOpacity 
                  style={styles.verifyButton}
                  onPress={handleWhatsappVerification}
                  disabled={whatsappLoading}
                >
                  <Text style={styles.verifyButtonText}>
                    {whatsappLoading ? 'جاري الإرسال...' : 'تحقق واتساب'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              {showCodeInput && (
                <View style={styles.codeInputRow}>
                  <TextInput
                    style={styles.codeInput}
                    placeholder="أدخل رمز التحقق"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    maxLength={6}
                  />
                  <TouchableOpacity 
                    style={styles.checkCodeButton}
                    onPress={handleCodeVerification}
                    disabled={codeChecking}
                  >
                    <Text style={styles.checkCodeButtonText}>
                      {codeChecking ? 'جاري التحقق...' : 'تحقق'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
              
              {whatsappStatus && (
                <Text style={[styles.statusText, { color: whatsappStatus.type === 'success' ? '#10b981' : '#ef4444' }]}>
                  {whatsappStatus.message}
                </Text>
              )}
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#ef4444" />
            <Text style={styles.logoutText}>تسجيل الخروج</Text>
          </TouchableOpacity>
        </ScrollView>
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
  profileHeader: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  verifiedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#10b981',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 8,
  },
  premiumBadge: {
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    borderRadius: 12,
    padding: 4,
  },
  username: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
  },
  bio: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  profileStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#94a3b8',
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    gap: 4,
  },
  editProfileText: {
    color: '#8b5cf6',
    fontSize: 12,
    fontWeight: '600',
  },
  levelSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  levelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  experienceText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  coinDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  coinIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  coinAmount: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  statsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statCardNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statCardLabel: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  achievementsSection: {
    marginBottom: 24,
  },
  achievementsList: {
    paddingHorizontal: 20,
  },
  achievementItem: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  unlockedAchievement: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
  },
  lockedAchievement: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  achievementIconText: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  unlockedText: {
    color: '#fff',
  },
  lockedText: {
    color: '#94a3b8',
  },
  achievementDescription: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 12,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 3,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 3,
  },
  progressText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  unlockedDate: {
    color: '#10b981',
    fontSize: 12,
    fontStyle: 'italic',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsList: {
    paddingHorizontal: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    color: '#94a3b8',
    fontSize: 14,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValueText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  friendsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  friendsPreview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
  },
  friendPreviewItem: {
    alignItems: 'center',
    flex: 1,
  },
  friendPreviewAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 8,
  },
  friendPreviewName: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // WhatsApp verification styles
  whatsappSection: {
    marginBottom: 24,
  },
  whatsappNotice: {
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  whatsappNoticeText: {
    color: '#ffc107',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  whatsappCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    textAlign: 'right',
    direction: 'rtl',
  },
  verifyButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  codeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  codeInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  checkCodeButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkCodeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  statusText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
});


