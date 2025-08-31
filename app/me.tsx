import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { createClient } from '@supabase/supabase-js';

const supabase = (() => {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL!;
  const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, anon);
})();

type Profile = {
  display_name?: string | null;
  avatar_url?: string | null;
  visitors_count?: number | null;
  likes_count?: number | null;
  followers_count?: number | null;
  gender?: 'male' | 'female' | null;
};

export default function MeScreen() {
  const [loading, setLoading] = React.useState(true);
  const [userId, setUserId] = React.useState<string | null>(null);
  const [name, setName] = React.useState('مريم'); // default to مريم per request
  const [gender, setGender] = React.useState<'male' | 'female'>('female'); // keep female icon by default
  const [avatar, setAvatar] = React.useState<string | undefined>(undefined);
  const [visitors, setVisitors] = React.useState(4);
  const [likes, setLikes] = React.useState(0);
  const [followers, setFollowers] = React.useState(1);

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data: { user }, error: uerr } = await supabase.auth.getUser();
        if (uerr) throw uerr;
        if (!user) { setLoading(false); return; }
        if (!isMounted) return;

        setUserId(user.id);

        // Prefer profiles row if exists
        const { data: prof, error: perr } = await supabase
          .from('profiles')
          .select('display_name, avatar_url, visitors_count, likes_count, followers_count, gender')
          .eq('id', user.id)
          .maybeSingle();

        if (!isMounted) return;

        const metaName =
          (user.user_metadata?.full_name as string | undefined) ||
          (user.user_metadata?.name as string | undefined) ||
          (user.email ?? undefined);

        const displayName = (prof?.display_name || metaName || 'مريم').toString();
        setName(displayName);

        // gender: prefer profile; else metadata.gender; default 'female'
        const g =
          (prof?.gender as 'male'|'female'|null) ||
          (user.user_metadata?.gender as 'male'|'female'|undefined) ||
          'female';
        setGender(g);

        // avatar fallbacks
        const metaAvatar =
          (user.user_metadata?.avatar_url as string | undefined) ||
          (user.user_metadata?.picture as string | undefined);
        const resolvedAvatar = prof?.avatar_url || metaAvatar || `https://i.pravatar.cc/120?u=${user.id}`;
        setAvatar(resolvedAvatar);

        // counts (fallback to existing static values if null/undefined)
        setVisitors(typeof prof?.visitors_count === 'number' ? prof!.visitors_count! : visitors);
        setLikes(typeof prof?.likes_count === 'number' ? prof!.likes_count! : likes);
        setFollowers(typeof prof?.followers_count === 'number' ? prof!.followers_count! : followers);
      } catch (e) {
        // keep safe UI; just log to console
        console.warn('[Me] load error', e);
      } finally {
        isMounted && setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const onMenu = (name: string) => Alert.alert('', `(${name}) قادم لاحقًا`);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F2F5F7' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header card */}
        <View style={styles.headerCard}>
          <Pressable style={styles.editIcon} onPress={() => onMenu('تعديل الملف')}>
            <MaterialCommunityIcons name="pencil" size={18} color="#8B8B8B" />
          </Pressable>

          <View style={styles.headerTopRow}>
            <View style={styles.nameBlock}>
              <View style={styles.nameRow}>
                <MaterialCommunityIcons
                  name={gender === 'male' ? 'gender-male' : 'gender-female'}
                  size={16}
                  color={gender === 'male' ? '#3A83F1' : '#C35E6E'}
                />
                <Text style={styles.name} numberOfLines={1}>{
                  loading ? '...' : name
                }</Text>
              </View>
              <View style={styles.idRow}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={14} color="#8E8E93" />
                <Text style={styles.idTxt}>ID: {userId ? userId.slice(0, 8) : '—'}</Text>
              </View>
            </View>

            <Image
              source={{ uri: avatar || 'https://i.pravatar.cc/120?img=5' }}
              style={styles.avatar}
            />
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{visitors}</Text>
              <Text style={styles.statLbl}>الزوار</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{likes}</Text>
              <Text style={styles.statLbl}>المعجبين</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{followers}</Text>
              <Text style={styles.statLbl}>المتابعين</Text>
            </View>
          </View>

          {/* VIP banner */}
          <Pressable onPress={() => onMenu('VIP')} style={styles.vipBanner}>
            <Text style={styles.vipTitle}>VIP</Text>
            <Text style={styles.vipSub}>استمتع بامتيازات حصرية</Text>
            <View style={{ flex: 1 }} />
            <View style={styles.vipBtn}>
              <Text style={styles.vipBtnTxt}>تفاصيل</Text>
            </View>
          </Pressable>

          {/* Segments */}
          <View style={styles.segmentRow}>
            <View style={[styles.segment, styles.segmentActive]}>
              <Text style={styles.segmentTxtActive}>الأوسمة</Text>
            </View>
            <View style={[styles.segment, styles.segmentDim]}>
              <Text style={styles.segmentTxtDim}>مستوى</Text>
            </View>
          </View>

          {/* Badges preview */}
          <View style={styles.badgeArea}>
            <View style={styles.badgeEmpty}>
              <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color="#FFB300" />
              <Text style={styles.badgeEmptyTxt}>0</Text>
            </View>
          </View>
        </View>

        {/* Menu card */}
        <View style={styles.card}>
          <MenuItem icon="wallet" label="محفظة" onPress={() => onMenu('محفظة')} />
          <MenuItem icon="storefront-outline" label="متجر" onPress={() => onMenu('متجر')} />
          <MenuItem icon="account-tie" label="وكالة" onPress={() => onMenu('وكالة')} />
          <MenuItem icon="calendar-check-outline" label="مهام" onPress={() => onMenu('مهام')} isLast />
        </View>

        {/* Sections */}
        <View style={styles.card}>
          <MenuItem icon="clock-time-four-outline" label="الزيارات الأخيرة" onPress={() => onMenu('الزيارات الأخيرة')} />
          <MenuItem icon="file-document-edit-outline" label="خدمة العملاء" onPress={() => onMenu('خدمة العملاء')} />
          <MenuItem icon="translate" label="اللغة" onPress={() => onMenu('اللغة')} />
          <MenuItem icon="cog-outline" label="إعدادات" onPress={() => onMenu('إعدادات')} isLast />
        </View>

        {loading && (
          <View style={{ paddingTop: 16 }}>
            <ActivityIndicator />
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Floating promo */}
      <Pressable style={styles.fab} onPress={() => onMenu('اول شحنة')}>
        <Ionicons name="cash-outline" size={16} />
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
      <MaterialCommunityIcons name={icon} size={20} color="#6FAD97" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 8,
    marginHorizontal: 12,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  editIcon: { position: 'absolute', top: 10, left: 10, padding: 6, borderRadius: 999 },
  headerTopRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  nameBlock: { flex: 1, alignItems: 'flex-end', paddingRight: 8, gap: 6 },
  nameRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  name: { fontSize: 18, fontWeight: '700', maxWidth: 180 },
  idRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  idTxt: { color: '#8E8E93' },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#EEE' },

  statsRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    backgroundColor: '#F7F9FA',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
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
  segmentDim: { backgroundColor: '#F7F4E8' },
  segmentTxtActive: { color: '#C35E6E', fontWeight: '700' },
  segmentTxtDim: { color: '#C3A34F', fontWeight: '700' },

  badgeArea: { backgroundColor: '#FFFFFF', paddingVertical: 8, gap: 8 },
  badgeEmpty: { alignSelf: 'flex-end', flexDirection: 'row-reverse', gap: 6, backgroundColor: '#FFF8E1', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeEmptyTxt: { color: '#FFB300', fontWeight: '700' },

  card: { backgroundColor: '#FFFFFF', marginTop: 12, marginHorizontal: 12, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  menuItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E8EDF3' },
  menuLabel: { fontSize: 15 },

  fab: {
    position: 'absolute',
    right: 12,
    bottom: 24,
    backgroundColor: '#E9F8EC',
    borderRadius: 18,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#BDE6C5',
  },
  fabTxt: { fontWeight: '700' },
});
