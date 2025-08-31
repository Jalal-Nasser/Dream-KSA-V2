import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../_binmo-theme';
import { useRouter } from 'expo-router';

// A single row in the stats bar, now with notification support
function Stat({ label, value, notificationCount }: { label: string; value: number | string; notificationCount?: number }) {
  return (
    <View style={styles.statItem}>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        {notificationCount && (
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationText}>{notificationCount}</Text>
          </View>
        )}
      </View>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// A single row in one of the list cards
function ListRow({ title, icon, onPress, leftContent }: { title: string; icon: React.ReactNode; onPress?: () => void, leftContent?: React.ReactNode }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.row} onPress={onPress}>
      {/* Right side group: Icon and Title */}
      <View style={styles.rowRight}>
        <Text style={styles.rowTitle}>{title}</Text>
        <View style={styles.rowIcon}>{icon}</View>
      </View>

      {/* Left side: Chevron or custom content */}
      <View style={styles.rowLeft}>
        {leftContent ? leftContent : <Ionicons name="chevron-back" size={18} color="#C7CDD5" />}
      </View>
    </TouchableOpacity>
  );
}

export default function Me() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 80, paddingTop: 8 }}>
        {/* Top-left edit icon */}
        <View style={styles.pageTopRow}>
          <TouchableOpacity onPress={() => router.push('/profile/edit')} activeOpacity={0.85}>
            <Ionicons name="create-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Header: Avatar on right, text block on left */}
        <View style={styles.header}>
          <View>
            <View style={styles.avatar}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>J</Text>
            </View>
          </View>
          <View style={styles.headerLeft}>
            <View style={styles.nameRow}>
              <Ionicons name="male" size={18} color="#3B82F6" />
              <Text style={styles.name}> Jalal JJ </Text>
              <Text>🇸🇦</Text>
            </View>
            <View style={styles.idRow}>
              <Text style={styles.idText}>ID: 2373397 </Text>
              <Ionicons name="copy-outline" size={14} color="#9CA3AF" />
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat label="المتابعين" value={1} />
          <Stat label="المعجبين" value={0} />
          <Stat label="الزوار" value={4} notificationCount={2} />
        </View>

        {/* VIP banner */}
        <View style={styles.vipBanner}>
          <TouchableOpacity activeOpacity={0.9} style={styles.vipBtn}>
            <Text style={styles.vipBtnTxt}>تفاصيل</Text>
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.vipTitle}>VIP</Text>
            <Text style={styles.vipSub}>استمتع بامتيازات حصرية</Text>
          </View>
          <View style={styles.vipBadge}>
            <MaterialCommunityIcons name="crown" size={20} color="#E9C46A" />
          </View>
        </View>

        {/* Level / Badges tabs */}
        <View style={styles.ribbonRow}>
          <View style={[styles.ribbon, { backgroundColor: '#FBE7EC' }]}>
            <Text style={styles.ribbonTxt}>الأوسمة ›</Text>
          </View>
          <View style={[styles.ribbon, { backgroundColor: '#FDECCE' }]}>
            <Text style={styles.ribbonTxt}>مستوى ›</Text>
          </View>
        </View>

        {/* First card */}
        <View style={styles.card}>
          <TouchableOpacity style={styles.coinsRow}>
            <Text style={{ marginLeft: 6 }}>🪙</Text>
            <Text style={{ color: colors.text, fontWeight: '800' }}>0</Text>
            <Ionicons name="chevron-back" size={18} color="#C7CDD5" />
          </TouchableOpacity>

          <ListRow title="محفظة" icon={<Ionicons name="card" size={18} color="#F59E0B" />} />
          <ListRow title="متجر" icon={<Ionicons name="storefront" size={18} color="#22C55E" />} />
          <ListRow title="وكالة" icon={<Ionicons name="person" size={18} color="#06B6D4" />} />
          <ListRow
            title="مهام"
            icon={<Ionicons name="calendar-outline" size={18} color="#3B82F6" />}
            leftContent={<View style={styles.rewardsPill}><Text style={styles.rewardsText}>🎁 مكافآت</Text></View>}
          />
          <ListRow title="دعوة مستخدم جديد" icon={<Ionicons name="person-add" size={18} color="#10B981" />} />
          <View style={styles.firstChargeBadge}><Text style={styles.firstChargeTxt}>أول شحنة</Text></View>
        </View>

        {/* Second card */}
        <View style={styles.card}>
          <ListRow title="الزيارات الأخيرة" icon={<Ionicons name="time" size={18} color="#6B7280" />} />
          <ListRow title="خدمة العملاء" icon={<Ionicons name="create" size={18} color="#6B7280" />} />
          <ListRow title="اللغة" icon={<Ionicons name="globe" size={18} color="#6B7280" />} />
          <ListRow title="إعدادات" icon={<Ionicons name="settings" size={18} color="#6B7280" />} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pageTopRow: { paddingHorizontal: 20, paddingBottom: 4, alignItems: 'flex-start' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 6, gap: 16 },
  headerLeft: { alignItems: 'flex-start' },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#00C853', alignItems: 'center', justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { color: colors.text, fontSize: 18, fontWeight: '900' },
  idRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  idText: { color: '#9CA3AF', fontWeight: '700' },

  statsRow: { flexDirection: 'row-reverse', justifyContent: 'space-around', paddingVertical: 10, marginHorizontal: 20 },
  statItem: { alignItems: 'center' },
  statValue: { color: colors.text, fontWeight: '900', fontSize: 18 },
  statLabel: { color: colors.textMuted, marginTop: 2 },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -12, // Adjusted for RTL
    backgroundColor: '#FF4D4F',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  notificationText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  vipBanner: { marginHorizontal: 20, marginTop: 6, backgroundColor: '#101418', borderRadius: 14, padding: 10, flexDirection: 'row-reverse', alignItems: 'center' },
  vipBtn: { backgroundColor: '#EADBC8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginLeft: 10 },
  vipBtnTxt: { color: '#1F2937', fontWeight: '800', fontSize: 13 },
  vipTitle: { color: '#FFD166', fontWeight: '900', fontSize: 16 },
  vipSub: { color: '#E5E7EB', marginTop: 2, fontSize: 12 },
  vipBadge: { backgroundColor: '#1F2937', padding: 8, borderRadius: 10, marginRight: 6 },

  ribbonRow: { flexDirection: 'row-reverse', gap: 12, paddingHorizontal: 20, marginTop: 12 },
  ribbon: { flex: 1, height: 64, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  ribbonTxt: { color: '#4B5563', fontWeight: '900' },

  card: { backgroundColor: '#fff', marginHorizontal: 20, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: colors.border, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  coinsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },

  row: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowIcon: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2F6FA' },
  rowTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },
  rowLeft: { minWidth: 20, alignItems: 'flex-start' },

  rewardsPill: { backgroundColor: '#FFEDD5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  rewardsText: { color: '#C2410C', fontWeight: '900' },

  firstChargeBadge: { position: 'absolute', left: 10, bottom: -10, backgroundColor: '#E7F7EF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#B8E7C2' },
  firstChargeTxt: { color: '#00A651', fontWeight: '900' },
});

