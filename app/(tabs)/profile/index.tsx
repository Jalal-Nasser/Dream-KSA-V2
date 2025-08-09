import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
  Switch,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Settings,
  Bell,
  Mic,
  Volume2,
  Shield,
  HelpCircle,
  LogOut,
  Edit,
  Camera,
  Check,
  X,
} from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({
    name: 'محمد أحمد',
    username: '@mohammed_ahmed',
    email: 'mohammed@example.com',
    avatar: null,
    bio: 'مرحباً، أحب المشاركة في الأماسي الصوتية!',
  });

  const [settings, setSettings] = useState({
    notifications: {
      roomInvites: true,
      mentions: true,
      newMessages: true,
      roomStart: false,
    },
    audio: {
      autoMute: false,
      noiseReduction: true,
      echoCancellation: true,
      voiceLevel: 75,
    },
    privacy: {
      showOnlineStatus: true,
      allowDirectMessages: true,
      showInSearch: true,
      profileVisibility: 'public', // public, friends, private
    },
    appearance: {
      darkMode: true,
      arabicLanguage: true,
      fontSize: 'medium', // small, medium, large
    },
  });

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleSaveProfile = () => {
    setUserProfile(tempProfile);
    setEditingProfile(false);
    Alert.alert('تم الحفظ', 'تم تحديث الملف الشخصي بنجاح');
  };

  const handleCancelEdit = () => {
    setTempProfile(userProfile);
    setEditingProfile(false);
  };

  const handleSettingChange = (category: keyof typeof settings, setting: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
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
            // Clear user data and navigate to login
            router.replace('/index-login');
          },
        },
      ]
    );
  };

  const ProfileEditModal = () => (
    <Modal
      visible={editingProfile}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <LinearGradient
        colors={['#1F2937', '#111827']}
        style={styles.modalContainer}
      >
        <SafeAreaView style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Pressable onPress={handleCancelEdit}>
              <X color="white" size={24} />
            </Pressable>
            <Text style={styles.modalTitle}>تعديل الملف الشخصي</Text>
            <Pressable onPress={handleSaveProfile}>
              <Check color="#10b981" size={24} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <Pressable
                style={styles.avatarContainer}
                onPress={() => setShowAvatarModal(true)}
              >
                {tempProfile.avatar ? (
                  <Image source={{ uri: tempProfile.avatar }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User color="white" size={40} />
                  </View>
                )}
                <View style={styles.avatarEditButton}>
                  <Camera color="white" size={16} />
                </View>
              </Pressable>
            </View>

            {/* Profile Fields */}
            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>الاسم</Text>
              <TextInput
                style={styles.textInput}
                value={tempProfile.name}
                onChangeText={(text) => setTempProfile(prev => ({ ...prev, name: text }))}
                placeholder="أدخل اسمك"
                placeholderTextColor="#9ca3af"
                textAlign="right"
              />

              <Text style={styles.fieldLabel}>اسم المستخدم</Text>
              <TextInput
                style={styles.textInput}
                value={tempProfile.username}
                onChangeText={(text) => setTempProfile(prev => ({ ...prev, username: text }))}
                placeholder="أدخل اسم المستخدم"
                placeholderTextColor="#9ca3af"
                textAlign="right"
              />

              <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.textInput}
                value={tempProfile.email}
                onChangeText={(text) => setTempProfile(prev => ({ ...prev, email: text }))}
                placeholder="أدخل البريد الإلكتروني"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                textAlign="right"
              />

              <Text style={styles.fieldLabel}>النبذة الشخصية</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={tempProfile.bio}
                onChangeText={(text) => setTempProfile(prev => ({ ...prev, bio: text }))}
                placeholder="أخبرنا عن نفسك"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
                textAlign="right"
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </Modal>
  );

  return (
    <LinearGradient colors={['#1F2937', '#111827', '#0A0E15']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>الملف الشخصي</Text>
          <Pressable style={styles.headerButton} onPress={() => setEditingProfile(true)}>
            <Edit color="white" size={24} />
          </Pressable>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {userProfile.avatar ? (
                <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <User color="white" size={50} />
                </View>
              )}
            </View>
            <Text style={styles.userName}>{userProfile.name}</Text>
            <Text style={styles.userHandle}>{userProfile.username}</Text>
            <Text style={styles.userBio}>{userProfile.bio}</Text>
          </View>

          {/* Notifications Settings */}
          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Bell color="#4f46e5" size={24} />
              <Text style={styles.sectionTitle}>الإشعارات</Text>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>دعوات الغرف</Text>
                <Text style={styles.settingDescription}>تلقي إشعارات عند دعوتك لغرفة</Text>
              </View>
              <Switch
                value={settings.notifications.roomInvites}
                onValueChange={(value) => handleSettingChange('notifications', 'roomInvites', value)}
                trackColor={{ false: '#374151', true: '#4f46e5' }}
                thumbColor={settings.notifications.roomInvites ? '#ffffff' : '#9ca3af'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>الإشارات</Text>
                <Text style={styles.settingDescription}>تلقي إشعارات عند الإشارة إليك</Text>
              </View>
              <Switch
                value={settings.notifications.mentions}
                onValueChange={(value) => handleSettingChange('notifications', 'mentions', value)}
                trackColor={{ false: '#374151', true: '#4f46e5' }}
                thumbColor={settings.notifications.mentions ? '#ffffff' : '#9ca3af'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>الرسائل الجديدة</Text>
                <Text style={styles.settingDescription}>تلقي إشعارات للرسائل الجديدة</Text>
              </View>
              <Switch
                value={settings.notifications.newMessages}
                onValueChange={(value) => handleSettingChange('notifications', 'newMessages', value)}
                trackColor={{ false: '#374151', true: '#4f46e5' }}
                thumbColor={settings.notifications.newMessages ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Audio Settings */}
          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Mic color="#10b981" size={24} />
              <Text style={styles.sectionTitle}>إعدادات الصوت</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>كتم تلقائي عند الدخول</Text>
                <Text style={styles.settingDescription}>كتم الميكروفون تلقائياً عند دخول الغرف</Text>
              </View>
              <Switch
                value={settings.audio.autoMute}
                onValueChange={(value) => handleSettingChange('audio', 'autoMute', value)}
                trackColor={{ false: '#374151', true: '#10b981' }}
                thumbColor={settings.audio.autoMute ? '#ffffff' : '#9ca3af'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>تقليل الضوضاء</Text>
                <Text style={styles.settingDescription}>تقليل الضوضاء في الخلفية</Text>
              </View>
              <Switch
                value={settings.audio.noiseReduction}
                onValueChange={(value) => handleSettingChange('audio', 'noiseReduction', value)}
                trackColor={{ false: '#374151', true: '#10b981' }}
                thumbColor={settings.audio.noiseReduction ? '#ffffff' : '#9ca3af'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إلغاء الصدى</Text>
                <Text style={styles.settingDescription}>إلغاء صدى الصوت أثناء المحادثة</Text>
              </View>
              <Switch
                value={settings.audio.echoCancellation}
                onValueChange={(value) => handleSettingChange('audio', 'echoCancellation', value)}
                trackColor={{ false: '#374151', true: '#10b981' }}
                thumbColor={settings.audio.echoCancellation ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Privacy Settings */}
          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Shield color="#f59e0b" size={24} />
              <Text style={styles.sectionTitle}>الخصوصية</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إظهار الحالة</Text>
                <Text style={styles.settingDescription}>إظهار حالتك متصل/غير متصل للآخرين</Text>
              </View>
              <Switch
                value={settings.privacy.showOnlineStatus}
                onValueChange={(value) => handleSettingChange('privacy', 'showOnlineStatus', value)}
                trackColor={{ false: '#374151', true: '#f59e0b' }}
                thumbColor={settings.privacy.showOnlineStatus ? '#ffffff' : '#9ca3af'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>السماح بالرسائل المباشرة</Text>
                <Text style={styles.settingDescription}>السماح للآخرين بإرسال رسائل مباشرة</Text>
              </View>
              <Switch
                value={settings.privacy.allowDirectMessages}
                onValueChange={(value) => handleSettingChange('privacy', 'allowDirectMessages', value)}
                trackColor={{ false: '#374151', true: '#f59e0b' }}
                thumbColor={settings.privacy.allowDirectMessages ? '#ffffff' : '#9ca3af'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إظهار في البحث</Text>
                <Text style={styles.settingDescription}>السماح للآخرين بالعثور عليك في البحث</Text>
              </View>
              <Switch
                value={settings.privacy.showInSearch}
                onValueChange={(value) => handleSettingChange('privacy', 'showInSearch', value)}
                trackColor={{ false: '#374151', true: '#f59e0b' }}
                thumbColor={settings.privacy.showInSearch ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>

          {/* Action Items */}
          <View style={styles.actionsSection}>
            <Pressable style={styles.actionItem}>
              <HelpCircle color="#6b7280" size={24} />
              <Text style={styles.actionText}>المساعدة والدعم</Text>
            </Pressable>

            <Pressable
              style={styles.actionItem}
              onPress={() => router.push('/profile/settings')}
            >
              <Settings color="#6b7280" size={24} />
              <Text style={styles.actionText}>إعدادات متقدمة</Text>
            </Pressable>

            <Pressable style={[styles.actionItem, styles.logoutItem]} onPress={handleLogout}>
              <LogOut color="#ef4444" size={24} />
              <Text style={[styles.actionText, styles.logoutText]}>تسجيل الخروج</Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <ProfileEditModal />
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4f46e5',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1F2937',
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userHandle: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  userBio: {
    color: '#d1d5db',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 280,
  },
  settingsSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 16,
  },
  settingTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'right',
  },
  settingDescription: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'right',
  },
  actionsSection: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  actionText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  logoutItem: {
    marginTop: 8,
  },
  logoutText: {
    color: '#ef4444',
  },
  bottomSpacer: {
    height: 40,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 16,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  formSection: {
    paddingBottom: 32,
  },
  fieldLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
    textAlign: 'right',
  },
  textInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#4b5563',
  },
  bioInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
