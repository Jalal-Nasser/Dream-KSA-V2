import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bell, Mic, Shield } from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const [settings, setSettings] = useState({
    notifications: {
      roomInvites: true,
      mentions: true,
      newMessages: true,
    },
    audio: {
      autoMute: false,
      noiseReduction: true,
      echoCancellation: true,
    },
    privacy: {
      showOnlineStatus: true,
      allowDirectMessages: true,
      showInSearch: true,
    },
  });

  const handleSettingChange = (
    category: keyof typeof settings,
    setting: string,
    value: any,
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value,
      },
    }));
  };

  return (
    <LinearGradient colors={['#1F2937', '#111827', '#0A0E15']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <ArrowLeft color="white" size={24} />
          </Pressable>
          <Text style={styles.headerTitle}>الإعدادات</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Bell color="#4f46e5" size={24} />
              <Text style={styles.sectionTitle}>الإشعارات</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>دعوات الغرف</Text>
                <Text style={styles.settingDescription}>
                  تلقي إشعارات عند دعوتك لغرفة
                </Text>
              </View>
              <Switch
                value={settings.notifications.roomInvites}
                onValueChange={(value) =>
                  handleSettingChange('notifications', 'roomInvites', value)
                }
                trackColor={{ false: '#374151', true: '#4f46e5' }}
                thumbColor={
                  settings.notifications.roomInvites ? '#ffffff' : '#9ca3af'
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>الإشارات</Text>
                <Text style={styles.settingDescription}>
                  تلقي إشعارات عند الإشارة إليك
                </Text>
              </View>
              <Switch
                value={settings.notifications.mentions}
                onValueChange={(value) =>
                  handleSettingChange('notifications', 'mentions', value)
                }
                trackColor={{ false: '#374151', true: '#4f46e5' }}
                thumbColor={
                  settings.notifications.mentions ? '#ffffff' : '#9ca3af'
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>الرسائل الجديدة</Text>
                <Text style={styles.settingDescription}>
                  تلقي إشعارات للرسائل الجديدة
                </Text>
              </View>
              <Switch
                value={settings.notifications.newMessages}
                onValueChange={(value) =>
                  handleSettingChange('notifications', 'newMessages', value)
                }
                trackColor={{ false: '#374151', true: '#4f46e5' }}
                thumbColor={
                  settings.notifications.newMessages ? '#ffffff' : '#9ca3af'
                }
              />
            </View>
          </View>

          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Mic color="#10b981" size={24} />
              <Text style={styles.sectionTitle}>إعدادات الصوت</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>كتم تلقائي عند الدخول</Text>
                <Text style={styles.settingDescription}>
                  كتم الميكروفون تلقائياً عند دخول الغرف
                </Text>
              </View>
              <Switch
                value={settings.audio.autoMute}
                onValueChange={(value) =>
                  handleSettingChange('audio', 'autoMute', value)
                }
                trackColor={{ false: '#374151', true: '#10b981' }}
                thumbColor={settings.audio.autoMute ? '#ffffff' : '#9ca3af'}
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>تقليل الضوضاء</Text>
                <Text style={styles.settingDescription}>
                  تقليل الضوضاء في الخلفية
                </Text>
              </View>
              <Switch
                value={settings.audio.noiseReduction}
                onValueChange={(value) =>
                  handleSettingChange('audio', 'noiseReduction', value)
                }
                trackColor={{ false: '#374151', true: '#10b981' }}
                thumbColor={
                  settings.audio.noiseReduction ? '#ffffff' : '#9ca3af'
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إلغاء الصدى</Text>
                <Text style={styles.settingDescription}>
                  إلغاء صدى الصوت أثناء المحادثة
                </Text>
              </View>
              <Switch
                value={settings.audio.echoCancellation}
                onValueChange={(value) =>
                  handleSettingChange('audio', 'echoCancellation', value)
                }
                trackColor={{ false: '#374151', true: '#10b981' }}
                thumbColor={
                  settings.audio.echoCancellation ? '#ffffff' : '#9ca3af'
                }
              />
            </View>
          </View>

          <View style={styles.settingsSection}>
            <View style={styles.sectionHeader}>
              <Shield color="#f59e0b" size={24} />
              <Text style={styles.sectionTitle}>الخصوصية</Text>
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إظهار الحالة</Text>
                <Text style={styles.settingDescription}>
                  إظهار حالتك متصل/غير متصل للآخرين
                </Text>
              </View>
              <Switch
                value={settings.privacy.showOnlineStatus}
                onValueChange={(value) =>
                  handleSettingChange('privacy', 'showOnlineStatus', value)
                }
                trackColor={{ false: '#374151', true: '#f59e0b' }}
                thumbColor={
                  settings.privacy.showOnlineStatus ? '#ffffff' : '#9ca3af'
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>السماح بالرسائل المباشرة</Text>
                <Text style={styles.settingDescription}>
                  السماح للآخرين بإرسال رسائل مباشرة
                </Text>
              </View>
              <Switch
                value={settings.privacy.allowDirectMessages}
                onValueChange={(value) =>
                  handleSettingChange('privacy', 'allowDirectMessages', value)
                }
                trackColor={{ false: '#374151', true: '#f59e0b' }}
                thumbColor={
                  settings.privacy.allowDirectMessages ? '#ffffff' : '#9ca3af'
                }
              />
            </View>

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingTitle}>إظهار في البحث</Text>
                <Text style={styles.settingDescription}>
                  السماح للآخرين بالعثور عليك في البحث
                </Text>
              </View>
              <Switch
                value={settings.privacy.showInSearch}
                onValueChange={(value) =>
                  handleSettingChange('privacy', 'showInSearch', value)
                }
                trackColor={{ false: '#374151', true: '#f59e0b' }}
                thumbColor={
                  settings.privacy.showInSearch ? '#ffffff' : '#9ca3af'
                }
              />
            </View>
          </View>

          <View style={styles.bottomSpacer} />
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
  bottomSpacer: {
    height: 40,
  },
});

