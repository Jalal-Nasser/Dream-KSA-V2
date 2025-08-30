import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { colors } from '../_binmo-theme';

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ListRow({ title, icon, iconColor = '#6B7280', onPress }: { title: string; icon: React.ReactNode; iconColor?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.row} onPress={onPress}>
      <Text style={styles.rowTitle}>{title}</Text>
      <View style={styles.rowRight}>
        <View style={[styles.rowIcon, { backgroundColor: '#F2F6FA' }]}>
          {icon}
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function Me() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Top profile header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.nameRow}>
              <Text style={styles.name}>Jaz</Text>
              <Text> </Text>
              <Ionicons name="checkmark-circle" size={16} color="#2DC96B" />
              <Text> 🇸🇦</Text>
            </Text>
            <View style={styles.idRow}>
              <Ionicons name="copy-outline" size={14} color="#9CA3AF" />
              <Text style={styles.idText}> ID: 2373397</Text>
            </View>
          </View>
          <View>
            <View style={styles.avatar}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 18 }}>J</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <Stat label="الزوار" value={6} />
          <Stat label="المعجبين" value={0} />
          <Stat label="المتابعين" value={1} />
        </View>

        {/* VIP banner */}
        <View style={styles.vipBanner}>
          <TouchableOpacity activeOpacity={0.9} style={styles.vipBtn}>
            <Text style={styles.vipBtnTxt}>تفاصيل</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.vipTitle}>VIP</Text>
            <Text style={styles.vipSub}>استمتع بامتيازات حصرية</Text>
          </View>
          <View style={styles.vipBadge}>
            <MaterialCommunityIcons name="crown" size={22} color="#E9C46A" />
          </View>
        </View>

        {/* Level / Badges tabs */}
        <View style={styles.ribbonRow}>
          <View style={[styles.ribbon, { backgroundColor: '#FFEFEA' }]}>
            <Text style={styles.ribbonTxt}>مستوى</Text>
          </View>
          <View style={[styles.ribbon, { backgroundColor: '#F7EAFE' }]}>
            <Text style={styles.ribbonTxt}>الأوسمة</Text>
          </View>
        </View>

        {/* First card */}
        <View style={styles.card}>
          <View style={styles.coinsRow}>
            <Text style={{ color: colors.text, fontWeight: '800' }}>0</Text>
            <Text style={{ marginLeft: 6 }}>🪙</Text>
          </View>

          <ListRow title="محفظة" icon={<Ionicons name="card" size={18} color="#F59E0B" />} />
          <ListRow title="متجر" icon={<Ionicons name="storefront" size={18} color="#22C55E" />} />
          <ListRow title="وكالة" icon={<Ionicons name="person" size={18} color="#06B6D4" />} />
          <ListRow title="العلاقة" icon={<Ionicons name="heart" size={18} color="#EF4444" />} />
          <ListRow title="مهام" icon={<Ionicons name="calendar" size={18} color="#3B82F6" />} />
          <ListRow title="دعوة مستخدم جديد" icon={<Ionicons name="person-add" size={18} color="#10B981" />} />

          {/* floating badge (أول شحنة) */}
          <View style={styles.firstChargeBadge}>
            <Text style={styles.firstChargeTxt}>أول شحنة</Text>
          </View>
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
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 },
  headerLeft: { flex: 1, alignItems: 'flex-end' },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#00C853', alignItems: 'center', justifyContent: 'center' },
  nameRow: { color: colors.text, fontSize: 18, fontWeight: '900' },
  name: { color: colors.text, fontSize: 18, fontWeight: '900' },
  idRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: 4 },
  idText: { color: '#6B7280', fontWeight: '700' },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  statItem: { alignItems: 'center' },
  statValue: { color: colors.text, fontWeight: '900', fontSize: 18 },
  statLabel: { color: colors.textMuted, marginTop: 2 },

  vipBanner: {
    marginHorizontal: 16,
    marginTop: 6,
    backgroundColor: '#101418',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  vipBtn: { backgroundColor: '#EADBC8', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, marginLeft: 10 },
  vipBtnTxt: { color: '#1F2937', fontWeight: '900' },
  vipTitle: { color: '#FFD166', fontWeight: '900', fontSize: 18 },
  vipSub: { color: '#E5E7EB', marginTop: 2 },
  vipBadge: { backgroundColor: '#1F2937', padding: 10, borderRadius: 12, marginRight: 6 },

  ribbonRow: { flexDirection: 'row-reverse', gap: 12, paddingHorizontal: 16, marginTop: 12 },
  ribbon: { flex: 1, height: 64, borderRadius: 14, alignItems: 'flex-end', justifyContent: 'center', paddingHorizontal: 14 },
  ribbonTxt: { color: '#4B5563', fontWeight: '900' },

  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  coinsRow: { alignSelf: 'flex-start', flexDirection: 'row-reverse', alignItems: 'center', marginTop: 8, marginBottom: 4, marginHorizontal: 12, backgroundColor: '#F8FAFC', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },

  row: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 14 },
  rowRight: { flexDirection: 'row', alignItems: 'center' },
  rowIcon: { width: 28, height: 28, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { color: colors.text, fontWeight: '800', fontSize: 15 },

  firstChargeBadge: { position: 'absolute', left: 10, bottom: -10, backgroundColor: '#E7F7EF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: '#B8E7C2' },
  firstChargeTxt: { color: '#00A651', fontWeight: '900' },
});

