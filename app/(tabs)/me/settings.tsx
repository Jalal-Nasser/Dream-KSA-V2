import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import CherryHeader from '../../components/CherryHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PALETTE } from '../../../lib/theme';
import { getSupabase } from '../../../lib/supabase';
import { useRouter } from 'expo-router';
import { getVersionLabel } from '../../../lib/version';

type RowProps = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress?: () => void;
  showAlert?: boolean;  // red exclamation
  subLeft?: string;     // e.g. version text on the far left
  last?: boolean;
};

function SettingRow({ label, icon, onPress, showAlert, subLeft, last }: RowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      {/* LEFT: version / alert / chevron (LTR left side) */}
      <View style={styles.rowLeft}>
        {subLeft ? <Text style={styles.subLeft}>{subLeft}</Text> : null}
        {showAlert ? (
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#E11D48" />
        ) : null}
        <MaterialCommunityIcons name="chevron-left" size={20} color="#B3B8BF" />
      </View>

      {/* RIGHT: icon THEN label (RTL order) */}
      <View style={styles.rowRight}>
        <MaterialCommunityIcons name={icon} size={20} color={PALETTE.primaryDark} />
        <Text style={styles.rowLabel} numberOfLines={1}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const router = useRouter();
  const supabase = getSupabase();
  const version = React.useMemo(() => getVersionLabel(), []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.soft1 }}>
      <CherryHeader title="إعدادات" />
      <ScrollView contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 28 }}>
        {/* Group 1 */}
        <View style={styles.group}>
          <SettingRow label="إدارة الحساب" icon="account-cog-outline" showAlert onPress={() => {}} />
          <SettingRow label="امتيازات VIP" icon="crown-outline" onPress={() => {}} />
          <SettingRow label="إعدادات الرسائل" icon="cog-outline" last onPress={() => {}} />
        </View>

        {/* Group 2 */}
        <View style={styles.group}>
          <SettingRow label="خدمة العملاء" icon="headset" onPress={() => {}} />
          <SettingRow label="معلومات عنا" icon="information-outline" onPress={() => {}} />
          <SettingRow label="اتصل بنا" icon="phone-outline" onPress={() => {}} />
          <SettingRow label="سياسة خاصة" icon="file-lock-outline" onPress={() => {}} />
          <SettingRow label="سياسة الاسترجاع" icon="cash-refund" onPress={() => {}} />
          <SettingRow label="شروط الخدمة" icon="hand-heart-outline" onPress={() => {}} />
          <SettingRow label="رقم النسخة" icon="tag-outline" subLeft={version} last />
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutTxt}>خروج</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row', // main container stays LTR; we handle RTL inside rowRight
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PALETTE.soft2,
  },
  /* RIGHT side (icon ➜ label) */
  rowRight: {
    flex: 1,
    flexDirection: 'row-reverse',  // so first child appears on the far right
    alignItems: 'center',
    gap: 10,
  },
  rowLabel: {
    textAlign: 'right',
    fontWeight: '800',
    color: '#111827',
  },

  /* LEFT side (version / alert / chevron) */
  rowLeft: {
    minWidth: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  subLeft: {
    color: '#6B7280',
  },

  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutTxt: {
    color: '#E11D48',
    fontWeight: '900',
    fontSize: 16,
  },
});
