import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { PALETTE } from '../lib/theme';

export default function MeScreen() {
  const router = useRouter();
  const onMenu = (name: string) => Alert.alert('', `(${name}) قادم لاحقًا`);
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: PALETTE.soft1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerCard}>
          <Pressable style={styles.editIcon} onPress={() => onMenu('تعديل الملف')}>
            <MaterialCommunityIcons name="pencil" size={18} color={PALETTE.textDim} />
          </Pressable>

          <View style={styles.headerTopRow}>
            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <MaterialCommunityIcons name="gender-female" size={16} color={PALETTE.primary} />
                <Text style={styles.name}>مريم</Text>
              </View>
              <View style={styles.idRow}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={14} color={PALETTE.textDim} />
                <Text style={styles.idTxt}>ID: 23733397</Text>
              </View>
            </View>
            <Image source={{ uri: 'https://i.pravatar.cc/120?img=5' }} style={styles.avatar} />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>4</Text>
              <Text style={styles.statLbl}>الزوار</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>0</Text>
              <Text style={styles.statLbl}>المعجبين</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>1</Text>
              <Text style={styles.statLbl}>المتابعين</Text>
            </View>
          </View>

          <Pressable onPress={() => onMenu('VIP')} style={styles.vipBanner}>
            <Text style={styles.vipTitle}>VIP</Text>
            <Text style={styles.vipSub}>استمتع بامتيازات حصرية</Text>
            <View style={{ flex: 1 }} />
            <View style={styles.vipBtn}><Text style={styles.vipBtnTxt}>تفاصيل</Text></View>
          </Pressable>

          <View style={styles.segmentRow}>
            <View style={[styles.segment, styles.segmentActive]}><Text style={styles.segmentTxtActive}>الأوسمة</Text></View>
            <View style={[styles.segment, styles.segmentDim]}><Text style={styles.segmentTxtDim}>مستوى</Text></View>
          </View>

          <View style={styles.badgeArea}>
            <View style={styles.badgeEmpty}>
              <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color={PALETTE.accent} />
              <Text style={styles.badgeEmptyTxt}>0</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <MenuItem icon="wallet" label="محفظة" onPress={() => router.push('/(tabs)/me/wallet')} />
          <MenuItem icon="storefront-outline" label="متجر" onPress={() => router.push('/(tabs)/me/store')} />
          <MenuItem icon="account-tie" label="وكالة" onPress={() => onMenu('وكالة')} />
          <MenuItem icon="calendar-check-outline" label="مهام" onPress={() => router.push('/(tabs)/me/tasks')} isLast />
        </View>

        <View style={styles.card}>
          <MenuItem icon="clock-time-four-outline" label="الزيارات الأخيرة" onPress={() => router.push('/(tabs)/me/recent')} />
          <MenuItem icon="file-document-edit-outline" label="خدمة العملاء" onPress={() => router.push('/(tabs)/me/support')} />
          <MenuItem icon="translate" label="اللغة" onPress={() => router.push('/(tabs)/me/language')} />
          <MenuItem icon="cog-outline" label="إعدادات" onPress={() => router.push('/(tabs)/me/settings')} isLast />
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => onMenu('اول شحنة')}>
        <Ionicons name="cash-outline" size={16} color={PALETTE.primaryDark}/>
        <Text style={styles.fabTxt}>اول شحنة</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function MenuItem({ icon, label, onPress, isLast = false }: { icon: any; label: string; onPress: () => void; isLast?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}>
      <Ionicons name="chevron-back" size={18} color="#B4B8BF" style={{ opacity: 0.8 }} />
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <MaterialCommunityIcons name={icon} size={20} color={PALETTE.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerCard: { backgroundColor: '#FFFFFF', marginTop: 8, marginHorizontal: 12, borderRadius: 16, padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  editIcon: { position: 'absolute', top: 10, left: 10, padding: 6, borderRadius: 999 },
  headerTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  nameBlock: { flex: 1, alignItems: 'flex-end', paddingRight: 8, gap: 6 },
  nameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  name: { fontSize: 18, fontWeight: '700' },
  idRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  idTxt: { color: '#8E8E93' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEE' },
  statsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: PALETTE.soft1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  statBox: { alignItems: 'center', minWidth: 80 },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLbl: { color: '#7C8794', marginTop: 2 },
  vipBanner: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#1E1E1E', padding: 14, borderRadius: 12 },
  vipTitle: { color: '#D4AF37', fontSize: 18, fontWeight: '800', marginLeft: 10 },
  vipSub: { color: '#E5E1C6', opacity: 0.9 },
  vipBtn: { backgroundColor: '#F1E3A7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginLeft: 8 },
  vipBtnTxt: { fontWeight: '700' },
  segmentRow: { flexDirection: 'row-reverse', gap: 10, marginTop: 4 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segmentActive: { backgroundColor: '#FDE7EA' },
  segmentDim: { backgroundColor: PALETTE.soft2 },
  segmentTxtActive: { color: PALETTE.primary, fontWeight: '700' },
  segmentTxtDim: { color: PALETTE.primaryDark, opacity: 0.7, fontWeight: '700' },
  badgeArea: { backgroundColor: '#FFFFFF', paddingVertical: 8, gap: 8 },
  badgeEmpty: { alignSelf: 'flex-end', flexDirection: 'row-reverse', gap: 6, backgroundColor: PALETTE.soft2, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeEmptyTxt: { color: PALETTE.primary, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', marginTop: 12, marginHorizontal: 12, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  menuItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: PALETTE.soft2 },
  menuLabel: { fontSize: 15 },
  fab: { position: 'absolute', right: 12, bottom: 24, backgroundColor: PALETTE.soft2, borderRadius: 18, flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: PALETTE.cherry150 },
  fabTxt: { fontWeight: '700', color: PALETTE.primaryDark },
});
