import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/lib/ThemeProvider';
import { Appearance, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { 
  ArrowLeft,
  User,
  Bell,
  Shield,
  Eye,
  Volume2,
  Moon,
  Sun,
  Globe,
  Lock,
  Key,
  Trash2,
  AlertTriangle,
  HelpCircle,
  Info,
  Share2,
  Copy,
  Mail,
  Phone,
  Settings as SettingsIcon,
  ChevronRight,
  Check,
  X,
  Gift,
  Users,
  Mic,
  LogOut
} from 'lucide-react-native';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  type: 'toggle' | 'navigate' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  danger?: boolean;
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme, setMode } = useTheme();
  
  // State for various settings
  const [notifications, setNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const scheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'system' | 'light' | 'dark'>('system');
  const [autoJoin, setAutoJoin] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [allowGifts, setAllowGifts] = useState(true);
  const [allowFriendRequests, setAllowFriendRequests] = useState(true);
  const [language, setLanguage] = useState('العربية');

  const handleLogout = () => {
    Alert.alert(
      'تسجيل الخروج',
      'هل أنت متأكد من أنك تريد تسجيل الخروج؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'تسجيل الخروج', style: 'destructive', onPress: () => router.push('/') }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'حذف الحساب',
      'هذا الإجراء لا يمكن التراجع عنه. سيتم حذف جميع بياناتك نهائياً.',
      [
        { text: 'إلغاء', style: 'cancel' },
        { text: 'حذف', style: 'destructive', onPress: () => Alert.alert('تم حذف الحساب') }
      ]
    );
  };

  const accountSettings: SettingItem[] = [
    {
      id: 'profile',
      title: 'تعديل الملف الشخصي',
      subtitle: 'تغيير الصورة والاسم والمعلومات',
      icon: <User size={24} color="#fff" />,
      type: 'navigate',
      onPress: () => router.push('/profile')
    },
    {
      id: 'password',
      title: 'تغيير كلمة المرور',
      subtitle: 'تحديث كلمة المرور الخاصة بك',
      icon: <Key size={24} color="#fff" />,
      type: 'navigate',
      onPress: () => Alert.alert('تغيير كلمة المرور', 'سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني')
    },
    {
      id: 'email',
      title: 'البريد الإلكتروني',
      subtitle: 'ahmed@example.com',
      icon: <Mail size={24} color="#fff" />,
      type: 'navigate',
      onPress: () => Alert.alert('تغيير البريد الإلكتروني', 'أدخل البريد الإلكتروني الجديد')
    },
    {
      id: 'phone',
      title: 'رقم الهاتف',
      subtitle: '+966 50 123 4567',
      icon: <Phone size={24} color="#fff" />,
      type: 'navigate',
      onPress: () => Alert.alert('تغيير رقم الهاتف', 'أدخل رقم الهاتف الجديد')
    }
  ];

  const privacySettings: SettingItem[] = [
    {
      id: 'onlineStatus',
      title: 'إظهار حالة الاتصال',
      subtitle: 'السماح للآخرين برؤية أنك متصل',
      icon: <Eye size={24} color="#fff" />,
      type: 'toggle',
      value: showOnlineStatus,
      onToggle: setShowOnlineStatus
    },
    {
      id: 'allowGifts',
      title: 'استقبال الهدايا',
      subtitle: 'السماح للآخرين بإرسال هدايا لك',
      icon: <Gift size={24} color="#fff" />,
      type: 'toggle',
      value: allowGifts,
      onToggle: setAllowGifts
    },
    {
      id: 'friendRequests',
      title: 'طلبات الصداقة',
      subtitle: 'السماح للآخرين بإرسال طلبات صداقة',
      icon: <Users size={24} color="#fff" />,
      type: 'toggle',
      value: allowFriendRequests,
      onToggle: setAllowFriendRequests
    },
    {
      id: 'autoJoin',
      title: 'الانضمام التلقائي',
      subtitle: 'الانضمام تلقائياً للغرف المفضلة',
      icon: <Mic size={24} color="#fff" />,
      type: 'toggle',
      value: autoJoin,
      onToggle: setAutoJoin
    }
  ];

  const notificationSettings: SettingItem[] = [
    {
      id: 'notifications',
      title: 'الإشعارات',
      subtitle: 'تفعيل الإشعارات العامة',
      icon: <Bell size={24} color="#fff" />,
      type: 'toggle',
      value: notifications,
      onToggle: setNotifications
    },
    {
      id: 'sound',
      title: 'الأصوات',
      subtitle: 'تفعيل أصوات الإشعارات',
      icon: <Volume2 size={24} color="#fff" />,
      type: 'toggle',
      value: soundEnabled,
      onToggle: setSoundEnabled
    }
  ];

  const appearanceSettings: SettingItem[] = [
    {
      id: 'theme',
      title: 'المظهر',
      subtitle: themeMode === 'system' ? 'حسب النظام' : themeMode === 'light' ? 'فاتح' : 'داكن',
      icon: <Sun size={24} color="#fff" />,
      type: 'navigate',
      onPress: () => {
        Alert.alert('اختيار المظهر', '', [
          { text: 'فاتح', onPress: () => { setThemeMode('light'); setMode('light'); } },
          { text: 'داكن', onPress: () => { setThemeMode('dark'); setMode('dark'); } },
          { text: 'حسب النظام', onPress: () => { setThemeMode('system'); setMode('system'); }, style: 'cancel' },
        ]);
      }
    },
    {
      id: 'language',
      title: 'اللغة',
      subtitle: language,
      icon: <Globe size={24} color="#fff" />,
      type: 'navigate',
      onPress: () => Alert.alert('تغيير اللغة', 'اختر اللغة المفضلة')
    }
  ];

  const supportSettings: SettingItem[] = [
    {
      id: 'help',
      title: 'المساعدة والدعم',
      subtitle: 'الدليل والأسئلة الشائعة',
      icon: <HelpCircle size={24} color="#fff" />,
      type: 'navigate',
      onPress: () => Alert.alert('المساعدة', 'سيتم فتح صفحة المساعدة')
    },
    {
      id: 'about',
      title: 'حول التطبيق',
      subtitle: 'الإصدار 1.0.0',
      icon: <Info size={24} color="#fff" />,
      type: 'navigate',
      onPress: () => Alert.alert('حول التطبيق', 'Dreams KSA - تطبيق الغرف الصوتية')
    },
    {
      id: 'share',
      title: 'مشاركة التطبيق',
      subtitle: 'شارك التطبيق مع الأصدقاء',
      icon: <Share2 size={24} color="#fff" />,
      type: 'action',
      onPress: () => Alert.alert('مشاركة التطبيق', 'تم نسخ رابط التطبيق')
    }
  ];

  const dangerSettings: SettingItem[] = [
    {
      id: 'logout',
      title: 'تسجيل الخروج',
      subtitle: 'تسجيل الخروج من الحساب',
      icon: <LogOut size={24} color="#e11d48" />,
      type: 'action',
      onPress: handleLogout,
      danger: true
    },
    {
      id: 'deleteAccount',
      title: 'حذف الحساب',
      subtitle: 'حذف الحساب نهائياً',
      icon: <Trash2 size={24} color="#e11d48" />,
      type: 'action',
      onPress: handleDeleteAccount,
      danger: true
    }
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.settingItem, item.danger && styles.settingItemDanger]}
      onPress={item.onPress}
      disabled={item.type === 'toggle'}
    >
      <View style={styles.settingItemLeft}>
        <View style={[styles.settingIcon, item.danger && styles.settingIconDanger]}>
          {item.icon}
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, item.danger && styles.settingTitleDanger]}>
            {item.title}
          </Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, item.danger && styles.settingSubtitleDanger]}>
              {item.subtitle}
        </Text>
          )}
          </View>
        </View>

      {item.type === 'toggle' && (
              <Switch
          value={item.value}
          onValueChange={item.onToggle}
          trackColor={{ false: '#374151', true: '#3b82f6' }}
          thumbColor={item.value ? '#fff' : '#9ca3af'}
        />
      )}
      
      {item.type === 'navigate' && (
        <ChevronRight size={20} color="#9ca3af" />
      )}
      
      {item.type === 'action' && item.danger && (
        <AlertTriangle size={20} color="#e11d48" />
      )}
    </TouchableOpacity>
  );

  const renderSettingsSection = (title: string, items: SettingItem[]) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map(renderSettingItem)}
            </View>
          </View>
  );

  return (
    <LinearGradient colors={["#1F2937", "#111827", "#0A0E15"]} style={{ flex: 1 }}>
      <View style={{ paddingTop: insets.top, flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>الإعدادات</Text>
          <View style={styles.headerRight} />
        </View>

        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderSettingsSection('الحساب', accountSettings)}
          {renderSettingsSection('الخصوصية والأمان', privacySettings)}
          {renderSettingsSection('الإشعارات', notificationSettings)}
          {renderSettingsSection('المظهر', appearanceSettings)}
          {renderSettingsSection('الدعم', supportSettings)}
          {renderSettingsSection('خطر', dangerSettings)}
      </ScrollView>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerRight: {
    width: 40,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9ca3af',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingItemDanger: {
    borderBottomColor: 'rgba(239,68,68,0.2)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingIconDanger: {
    backgroundColor: 'rgba(239,68,68,0.2)',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 2,
  },
  settingTitleDanger: {
    color: '#e11d48',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
  },
  settingSubtitleDanger: {
    color: '#f87171',
  },
});
