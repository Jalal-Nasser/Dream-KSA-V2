import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Alert, I18nManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { PALETTE } from '../../../lib/theme';
import { getSupabase } from '../../../lib/supabase';
import { resolveDisplayName } from '../../../lib/display';
import { resolveAvatarUrl } from '../../../lib/storage';
import { getCountryFlag } from '../../../lib/countryFlags';
import LuxuryVipBanner from '../../../components/LuxuryVipBanner';

export default function MeScreen() {
  const router = useRouter();
  const { refresh } = useLocalSearchParams();
  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const onMenu = (name: string) => Alert.alert('', `(${name}) قادم لاحقًا`);
  
  const fetch = React.useCallback(async () => {
    try {
      const supabase = getSupabase();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/login');
        return;
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, gender, birthday, country, title, signature')
        .eq('id', user.id)
        .single();
      
      setUser(user);
      setProfile(profile);
    } catch (error) {
      console.warn('[me] fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);
  
  React.useEffect(() => { fetch(); }, [fetch]);
  useFocusEffect(React.useCallback(() => { fetch(); }, [fetch, refresh]));
  
  const displayName = resolveDisplayName(profile, user);
  
  // Derive avatar from stable storage path (no DB column needed)
  const avatarUrl = useMemo(
    () => (user ? resolveAvatarUrl(getSupabase(), `u/${user.id}/avatar`) : null),
    [user?.id]
  );
  const avatarSrc = avatarUrl ? { uri: avatarUrl } : undefined;
  return (
    <LinearGradient
      colors={['#FBE7EF', '#F2CAD6', '#F8D7DA', '#FBE7EF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.headerCard}>
          <Pressable style={styles.editIcon} onPress={() => router.push('/(tabs)/me/profile')}>
            <MaterialCommunityIcons name="pencil" size={18} color={PALETTE.textDim} />
          </Pressable>
          
          <View style={styles.headerContent}>
            <View style={styles.avatarContainer}>
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} style={styles.headerAvatar} />
              ) : (
                <View style={styles.headerAvatarPh}>
                  <Text style={styles.headerAvatarGlyph}>👤</Text>
                </View>
              )}
            </View>
            
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <MaterialCommunityIcons 
                  name={
                    profile?.gender === 'male' ? 'gender-male' :
                    profile?.gender === 'female' ? 'gender-female' :
                    'gender-male-female'
                  } 
                  size={16} 
                  color={PALETTE.primary} 
                />
                <Text style={styles.displayName}>{displayName || 'بدون اسم'}</Text>
                {profile?.country && (
                  <View style={styles.countryFlag}>
                    <Text style={styles.flagEmoji}>{getCountryFlag(profile.country)}</Text>
                  </View>
                )}
              </View>
              <View style={styles.idRow}>
                <MaterialCommunityIcons name="clipboard-text-outline" size={14} color={PALETTE.textDim} />
                <Text style={styles.idText}>ID: 23733397</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>

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

          <LuxuryVipBanner 
            onPress={() => onMenu('VIP')}
            title="VIP"
            subtitle="استمتع بامتيازات حصرية"
            buttonText="تفاصيل"
          />

          <View style={styles.segmentRow}>
            <LinearGradient
              colors={['#FDE7EA', '#F8D7DA', '#FDE7EA']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.segment, styles.segmentActive]}
            >
              <Text style={styles.segmentTxtActive}>الأوسمة</Text>
            </LinearGradient>
            <LinearGradient
              colors={['#F4E4BC', '#E6D3A3', '#F4E4BC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.segment, styles.segmentDim]}
            >
              <Text style={styles.segmentTxtDim}>مستوى</Text>
            </LinearGradient>
          </View>

          <View style={styles.badgeArea}>
            <View style={styles.badgeEmpty}>
              <MaterialCommunityIcons name="emoticon-happy-outline" size={16} color={PALETTE.accent} />
              <Text style={styles.badgeEmptyTxt}>0</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <MenuItem icon="account-edit-outline" label="معلومات شخصية" onPress={() => router.push('/(tabs)/me/profile')} />
          <MenuItem icon="wallet" label="محفظة" onPress={() => router.push('/(tabs)/me/wallet')} />
          <MenuItem icon="storefront-outline" label="متجر" onPress={() => router.push('/(tabs)/me/store')} />
          <MenuItem icon="account-tie" label="وكالة" onPress={() => router.push('/agencies')} />
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
    </LinearGradient>
  );
}

function MenuItem({
  icon,
  label,
  onPress,
  isLast = false,
  iconColor,
}: {
  icon: any;
  label: string;
  onPress: () => void;
  isLast?: boolean;
  iconColor?: string; // if you already pass a color, it will be used
}) {
  return (
    <Pressable onPress={onPress} style={[styles.menuItem, isLast && { borderBottomWidth: 0 }]}>
      {/* LEFTMOST: chevron (arrow) */}
      <Ionicons name="chevron-back" size={18} color="#B4B8BF" style={{ opacity: 0.8 }} />

      {/* MIDDLE: label (RTL, right-aligned) */}
      <View style={{ flex: 1, alignItems: 'flex-end' }}>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>

      {/* RIGHTMOST: icon — KEEP EXISTING COLOR */}
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={iconColor ?? PALETTE.primaryDark}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
    backgroundColor: '#fff',
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 12,
    marginHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  editIcon: { 
    position: 'absolute', 
    top: 12, 
    left: 12, 
    padding: 6, 
    borderRadius: 999,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  userInfo: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 12,
  },
  nameRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  displayName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  countryFlag: {
    marginLeft: 6,
  },
  flagEmoji: {
    fontSize: 16,
  },
  idRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  idText: {
    color: '#8E8E93',
    fontSize: 14,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  headerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#800F2F',
  },
  headerAvatarPh: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FBE7EF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#800F2F',
  },
  headerAvatarGlyph: {
    fontSize: 28,
    color: '#800F2F',
  },
  statsRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: PALETTE.soft1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 16 },
  statBox: { alignItems: 'center', minWidth: 80 },
  statNum: { fontSize: 18, fontWeight: '700' },
  statLbl: { color: '#7C8794', marginTop: 2 },

  segmentRow: { flexDirection: 'row-reverse', gap: 10, marginTop: 4, marginHorizontal: 12 },
  segment: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', minWidth: 80 },
  segmentActive: { /* backgroundColor removed - using LinearGradient */ },
  segmentDim: { /* backgroundColor removed - using LinearGradient */ },
  segmentTxtActive: { color: '#8B4513', fontWeight: '700' },
  segmentTxtDim: { color: '#8B4513', fontWeight: '700' },
  badgeArea: { backgroundColor: '#FFFFFF', paddingVertical: 8, gap: 8 },
  badgeEmpty: { alignSelf: 'flex-end', flexDirection: 'row-reverse', gap: 6, backgroundColor: PALETTE.soft2, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeEmptyTxt: { color: PALETTE.primary, fontWeight: '700' },
  card: { backgroundColor: '#FFFFFF', marginTop: 12, marginHorizontal: 12, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  menuItem: {
    flexDirection: 'row',            // IMPORTANT: no row-reverse
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PALETTE.soft2,
  },
  menuLabel: {
    fontSize: 15,
    textAlign: 'right',              // keep RTL alignment
  },
  fab: { position: 'absolute', left: 12, bottom: 24, backgroundColor: PALETTE.soft2, borderRadius: 18, flexDirection: 'row-reverse', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: PALETTE.cherry150 },
  fabTxt: { fontWeight: '700', color: PALETTE.primaryDark },
});
