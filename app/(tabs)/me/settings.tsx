import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import CherryHeader from '../../components/CherryHeader';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PALETTE } from '../../../lib/theme';

type RowProps = {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress?: () => void;
  showAlert?: boolean;
  subLeft?: string;      // small text aligned left (e.g., version)
  last?: boolean;
};

function SettingRow({ label, icon, onPress, showAlert, subLeft, last }: RowProps) {
  return (
    <Pressable onPress={onPress} style={[styles.row, last && { borderBottomWidth: 0 }]}>
      {/* left side (chevron + optional sub text) */}
      <View style={styles.rowLeft}>
        {subLeft ? <Text style={styles.subLeft}>{subLeft}</Text> : null}
        <MaterialCommunityIcons name="chevron-left" size={20} color="#B3B8BF" />
      </View>

      {/* right side (label + icon + optional red alert) */}
      <View style={styles.rowRight}>
        {showAlert ? (
          <View style={styles.alertDot}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#E11D48" />
          </View>
        ) : (
          <View style={{ width: 16, height: 16 }} />
        )}
        <Text style={styles.rowLabel}>{label}</Text>
        <MaterialCommunityIcons name={icon} size={20} color="#111827" />
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
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
          <SettingRow label="سياسة خاصة" icon="file-document-lock-outline" onPress={() => {}} />
          <SettingRow label="سياسة الاسترجاع" icon="cash-refund" onPress={() => {}} />
          <SettingRow label="شروط الخدمة" icon="hand-heart-outline" onPress={() => {}} />
          <SettingRow label="رقم النسخة" icon="information-outline" subLeft="V 2.37.2(984)" last />
        </View>

        {/* Logout */}
        <Pressable style={styles.logoutBtn} onPress={() => {}}>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PALETTE.soft2,
  },
  rowRight: {
    flex: 1,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 10,
  },
  rowLeft: {
    minWidth: 90,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rowLabel: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '800',
    color: '#111827',
  },
  subLeft: {
    color: '#6B7280',
  },
  alertDot: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
  },
  logoutTxt: {
    color: '#E11D48', // strong red similar to screenshot emphasis
    fontWeight: '900',
    fontSize: 16,
  },
});
