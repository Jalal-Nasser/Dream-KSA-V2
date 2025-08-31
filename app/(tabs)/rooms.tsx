import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  TextInput,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Room = {
  id: string;
  title: string;
  cover: string;
  avatar: string;
  listeners: number;
  lang?: string;
  country?: string; // e.g. 'SA'
  category?: string; // e.g. 'UNO'
};

const W = Dimensions.get('window').width;

const ROOMS: Room[] = new Array(12).fill(0).map((_, i) => ({
  id: `room-${i+1}`,
  title: i === 0 ? 'فهد المدلخم 🎉' : i === 1 ? 'وكالة الشامخ' : `غرفة دردشة ${i+1}`,
  cover: `https://picsum.photos/seed/room${i}/1200/600`,
  avatar: `https://i.pravatar.cc/160?img=${(i%60)+1}`,
  listeners: 170 + i * 13,
  lang: i % 2 ? 'AR' : 'EN',
  country: 'SA',
  category: ['All','UNO','Carrom','Ludo'][i % 4],
}));

export default function Rooms() {
  const [query, setQuery] = React.useState('');
  const [mode, setMode] = React.useState<'list' | 'grid'>('list'); // toggle

  const data = React.useMemo(() => {
    const q = query.trim();
    if (!q) return ROOMS;
    return ROOMS.filter((r) => r.title.includes(q));
  }, [query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          {/* Toggle buttons */}
          <View style={styles.toggleWrap}>
            <Pressable
              onPress={() => setMode('list')}
              style={[styles.toggleBtn, mode === 'list' && styles.toggleActive]}
            >
              <MaterialCommunityIcons name="view-list" size={16} />
              <Text style={[styles.toggleTxt, mode === 'list' && styles.toggleTxtActive]}>قائمة</Text>
            </Pressable>
            <Pressable
              onPress={() => setMode('grid')}
              style={[styles.toggleBtn, mode === 'grid' && styles.toggleActive]}
            >
              <MaterialCommunityIcons name="view-grid" size={16} />
              <Text style={[styles.toggleTxt, mode === 'grid' && styles.toggleTxtActive]}>شبكة</Text>
            </Pressable>
          </View>

          <Text style={styles.title}>الغرف</Text>
        </View>

        {/* Categories / chips (design only) */}
        <ScrollChips />

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color="#8E8E93" />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن غرفة"
            placeholderTextColor="#A1A1A1"
            value={query}
            onChangeText={setQuery}
            textAlign="right"
          />
        </View>
      </View>

      {/* Body */}
      {mode === 'list' ? (
        <FlatList
          data={data}
          key={'list'}
          keyExtractor={(r) => r.id}
          contentContainerStyle={{ padding: 12, paddingBottom: 28 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item }) => <RoomCardList room={item} />}
        />
      ) : (
        <FlatList
          data={data}
          key={'grid'}
          keyExtractor={(r) => r.id}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 10, paddingBottom: 28 }}
          columnWrapperStyle={{ gap: 10 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          renderItem={({ item, index }) => <RoomCardGrid room={item} index={index} />}
        />
      )}
    </SafeAreaView>
  );
}

/** ---------- List Card (existing style, kept) ---------- */
function RoomCardList({ room }: { room: Room }) {
  return (
    <View style={styles.cardList}>
      <ImageBackground source={{ uri: room.cover }} style={styles.cover} imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <View style={styles.badgeLive}>
          <Ionicons name="radio" size={12} color="#fff" />
          <Text style={styles.badgeTxt}>{room.listeners} مستمع</Text>
        </View>
        {room.lang && (
          <View style={styles.badgeLang}>
            <Text style={styles.badgeLangTxt}>{room.lang}</Text>
          </View>
        )}
      </ImageBackground>

      <View style={styles.cardBody}>
        <Text style={styles.roomTitle} numberOfLines={1}>{room.title}</Text>

        {/* Speakers mini-avatars (dummy) */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: -10 }}>
          {[0,1,2].map((i) => (
            <Image key={i} source={{ uri: `https://i.pravatar.cc/80?img=${(i*7)%60+1}` }} style={[styles.avatarMini, { zIndex: 10 - i }]} />
          ))}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Pressable style={styles.joinBtn} onPress={() => {}}>
          <MaterialCommunityIcons name="microphone" size={16} color="#fff" />
          <Text style={styles.joinTxt}>انضم</Text>
        </Pressable>
      </View>
    </View>
  );
}

/** ---------- Grid Card (Binmo-like) ---------- */
function RoomCardGrid({ room, index }: { room: Room; index: number }) {
  const pastel = ['#FFF1F5', '#EFFFF4', '#EEF5FF', '#FFF6E5'][index % 4];
  return (
    <View style={[styles.cardGrid, { backgroundColor: pastel }]}>
      <View style={styles.gridTopRow}>
        {/* right-aligned "menu" dots, country filter chip at left */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {/* left spacer */}
        </View>
        <MaterialCommunityIcons name="dots-horizontal" size={18} color="#9AA4B2" />
      </View>

      <Image source={{ uri: room.avatar }} style={styles.gridAvatar} />

      <Text style={styles.gridTitle} numberOfLines={1}>{room.title}</Text>

      <View style={styles.gridBottomRow}>
        {/* Country pill */}
        <View style={styles.gridPillCountry}>
          <MaterialCommunityIcons name="flag-variant" size={12} color="#1F9D55" />
          <Text style={styles.gridPillCountryTxt}>{room.country ?? 'SA'}</Text>
        </View>
        {/* Listeners pill */}
        <View style={styles.gridPillCount}>
          <MaterialCommunityIcons name="account-voice" size={12} color="#374151" />
          <Text style={styles.gridPillCountTxt}>{room.listeners}</Text>
        </View>
      </View>
    </View>
  );
}

/** ---------- Chips Row ---------- */
function ScrollChips() {
  const chips = ['All','UNO','Carrom','Ludo','SA'];
  return (
    <View style={styles.chipsRow}>
      {chips.map((c, i) => (
        <Pressable key={c} style={[styles.chip, i === 0 && styles.chipActive]}>
          <Text style={[styles.chipTxt, i === 0 && styles.chipTxtActive]}>{c}</Text>
        </Pressable>
      ))}
      <View style={{ flex: 1 }} />
      <MaterialCommunityIcons name="menu" size={18} color="#6B7280" />
    </View>
  );
}

const styles = StyleSheet.create({
  /* Header */
  header: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10, gap: 8, alignItems: 'flex-end' },
  headerTopRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', width: '100%' },
  title: { fontSize: 18, fontWeight: '800' },

  toggleWrap: { flexDirection: 'row', gap: 6, backgroundColor: '#EFF3F8', padding: 4, borderRadius: 999 },
  toggleBtn: { flexDirection: 'row', gap: 6, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  toggleActive: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, elevation: 1 },
  toggleTxt: { fontWeight: '700', color: '#6B7280' },
  toggleTxtActive: { color: '#111827' },

  chipsRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, width: '100%' },
  chip: { backgroundColor: '#EEF2F7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  chipActive: { backgroundColor: '#DDE8FF' },
  chipTxt: { fontWeight: '700', color: '#697586' },
  chipTxtActive: { color: '#2957D2' },

  searchBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, width: '100%', borderWidth: 1, borderColor: '#ECF0F4' },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },

  /* List card */
  cardList: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
  cover: { width: '100%', height: 120 },
  badgeLive: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { color: '#fff', fontSize: 11 },
  badgeLang: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeLangTxt: { fontWeight: '700' },
  cardBody: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  roomTitle: { fontWeight: '800', flex: 1, textAlign: 'right', marginLeft: 8 },
  avatarMini: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff' },
  cardFooter: { paddingHorizontal: 12, paddingBottom: 12, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  joinBtn: { backgroundColor: '#3D82F6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row-reverse', gap: 6, alignItems: 'center' },
  joinTxt: { color: '#fff', fontWeight: '700' },

  /* Grid card */
  cardGrid: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 168,
  },
  gridTopRow: { position: 'absolute', top: 8, right: 10, left: 10, flexDirection: 'row', justifyContent: 'space-between' },
  gridAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#fff', marginBottom: 8 },
  gridTitle: { fontWeight: '800', textAlign: 'center', marginBottom: 8, maxWidth: W/2 - 36 },
  gridBottomRow: { position: 'absolute', bottom: 10, right: 12, left: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  gridPillCountry: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#E7F8ED', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  gridPillCountryTxt: { color: '#166534', fontWeight: '700', fontSize: 12 },

  gridPillCount: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  gridPillCountTxt: { color: '#111827', fontWeight: '700', fontSize: 12 },
});
