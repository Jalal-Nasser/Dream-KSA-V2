import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Room = {
  id: string;
  title: string;
  cover: string;
  speakers: string[]; // avatar urls
  listeners: number;
  lang?: string;
};

const ROOMS: Room[] = new Array(12).fill(0).map((_, i) => ({
  id: `room-${i+1}`,
  title: `غرفة دردشة ${i+1}`,
  cover: `https://picsum.photos/seed/room${i}/900/600`,
  speakers: [
    `https://i.pravatar.cc/80?img=${(i%10)+1}`,
    `https://i.pravatar.cc/80?img=${(i%10)+11}`,
    `https://i.pravatar.cc/80?img=${(i%10)+21}`,
  ],
  listeners: 120 + i * 9,
  lang: i % 2 ? 'AR' : 'EN',
}));

export default function Rooms() {
  const [query, setQuery] = React.useState('');

  const data = React.useMemo(() => {
    const q = query.trim();
    if (!q) return ROOMS;
    return ROOMS.filter(r => r.title.includes(q));
  }, [query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* Header + Search */}
      <View style={styles.header}>
        <Text style={styles.title}>الغرف</Text>
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
        {/* Filters (design only) */}
        <View style={styles.filters}>
          {['الكل', 'متصل', 'أصدقائي', 'جديد'].map((f, idx) => (
            <Pressable key={f} style={[styles.filterPill, idx === 0 && styles.filterActive]}>
              <Text style={[styles.filterTxt, idx === 0 && styles.filterTxtActive]}>{f}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Room list */}
      <FlatList
        data={data}
        keyExtractor={(r) => r.id}
        contentContainerStyle={{ padding: 12, paddingBottom: 28 }}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => <RoomCard room={item} />}
      />
    </SafeAreaView>
  );
}

function RoomCard({ room }: { room: Room }) {
  return (
    <View style={styles.card}>
      <Image source={{ uri: room.cover }} style={styles.cover} />
      <View style={styles.badgeLive}>
        <Ionicons name="radio" size={12} color="#fff" />
        <Text style={styles.badgeTxt}>{room.listeners} مستمع</Text>
      </View>
      {room.lang && (
        <View style={styles.badgeLang}>
          <Text style={styles.badgeLangTxt}>{room.lang}</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.roomTitle} numberOfLines={1}>{room.title}</Text>

        {/* Speakers mini-avatars */}
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: -10 }}>
          {room.speakers.slice(0,3).map((u, i) => (
            <Image key={u} source={{ uri: u }} style={[styles.avatar, { zIndex: 10 - i }]} />
          ))}
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Pressable style={styles.joinBtn} onPress={() => { /* design only */ }}>
          <MaterialCommunityIcons name="microphone" size={16} color="#fff" />
          <Text style={styles.joinTxt}>انضم</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 12, paddingTop: 6, paddingBottom: 10, gap: 8, alignItems: 'flex-end' },
  title: { fontSize: 18, fontWeight: '800' },
  searchBox: { flexDirection: 'row', gap: 8, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, width: '100%', borderWidth: 1, borderColor: '#ECF0F4' },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  filters: { flexDirection: 'row-reverse', gap: 8, width: '100%' },
  filterPill: { backgroundColor: '#EEF2F7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  filterActive: { backgroundColor: '#DDE8FF' },
  filterTxt: { fontWeight: '700', color: '#697586' },
  filterTxtActive: { color: '#2957D2' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
  cover: { width: '100%', height: 120 },
  badgeLive: { position: 'absolute', top: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row-reverse', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeTxt: { color: '#fff', fontSize: 11 },
  badgeLang: { position: 'absolute', top: 8, left: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  badgeLangTxt: { fontWeight: '700' },

  cardBody: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 6, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  roomTitle: { fontWeight: '800', flex: 1, textAlign: 'right', marginLeft: 8 },

  avatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#fff' },

  cardFooter: { paddingHorizontal: 12, paddingBottom: 12, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' },
  joinBtn: { backgroundColor: '#3D82F6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row-reverse', gap: 6, alignItems: 'center' },
  joinTxt: { color: '#fff', fontWeight: '700' },
});
