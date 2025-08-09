import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  SafeAreaView,
  ScrollView,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ArrowLeft,
  User,
  Settings,
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

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);

  const handleSaveProfile = () => {
    setUserProfile(tempProfile);
    setEditingProfile(false);
    Alert.alert('تم الحفظ', 'تم تحديث الملف الشخصي بنجاح');
  };

  const handleCancelEdit = () => {
    setTempProfile(userProfile);
    setEditingProfile(false);
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
          onPress: () => router.replace('/index-login'),
        },
      ],
    );
  };

  const ProfileEditModal = () => (
    <Modal visible={editingProfile} animationType="slide" presentationStyle="pageSheet">
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.modalContainer}>
        <SafeAreaView style={styles.modalContent}>
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
            <View style={styles.avatarSection}>
              <Pressable style={styles.avatarContainer}>
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

            <View style={styles.formSection}>
              <Text style={styles.fieldLabel}>الاسم</Text>
              <TextInput
                style={styles.textInput}
                value={tempProfile.name}
                onChangeText={(text) => setTempProfile((prev) => ({ ...prev, name: text }))}
                placeholder="أدخل اسمك"
                placeholderTextColor="#9ca3af"
                textAlign="right"
              />

              <Text style={styles.fieldLabel}>اسم المستخدم</Text>
              <TextInput
                style={styles.textInput}
                value={tempProfile.username}
                onChangeText={(text) => setTempProfile((prev) => ({ ...prev, username: text }))}
                placeholder="أدخل اسم المستخدم"
                placeholderTextColor="#9ca3af"
                textAlign="right"
              />

              <Text style={styles.fieldLabel}>البريد الإلكتروني</Text>
              <TextInput
                style={styles.textInput}
                value={tempProfile.email}
                onChangeText={(text) => setTempProfile((prev) => ({ ...prev, email: text }))}
                placeholder="أدخل البريد الإلكتروني"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                textAlign="right"
              />

              <Text style={styles.fieldLabel}>النبذة الشخصية</Text>
              <TextInput
                style={[styles.textInput, styles.bioInput]}
                value={tempProfile.bio}
                onChangeText={(text) => setTempProfile((prev) => ({ ...prev, bio: text }))}
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
              <Text style={styles.actionText}>الإعدادات</Text>
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

