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

/** Tiny embedded PNG gradients (diagonal) — no extra packages */
const GRADS = [
  // pink → lilac
  'iVBORw0KGgoAAAANSUhEUgAAANwAAACqCAYAAADGISFdAAAH20lEQVR4nO3dQXCbMBAGYFfR1H0oQ6Kxw9GfV1iJmFrTQ2t3K1yH8u6aWo77oO1aW/4mA0oOXx+fPp1b2+vYJwC8r9yJj8gqWv7mWJ0Wwz3Y6P9/8m9dnYq2p7bq6euVw1b2ctn9nqfGvXb0rYJ2i2Qq8L1gk1QkAtJw0c8eC1Qwq4Q9Zf8V0r8r1o9oN5j3V0e+9dGxLYN1BvFQz1q3H1u9C2xK0hQ5dW8k6Q2Z7kQ5Rz7m1I0m3X7Yq1m7y9yT3eG3v1w1W4G0m8y2b/3yK2t9J9Y0a6fO1cV2iV1d4bQ2b2yOeYl9O2mY8c1tV2bYF8b0O+0Eo0QGx3d7v3jy2kGx0Zb1fB0b9yJp2wK9m7X8a0S0r9j2dG3fY0mE0f9j8eXo1b0vW1c2i5S7bGkq3h9F4Z8a2m9f7X2m9q3d6r2k3c1f6+0b9v0a9t7Z7eWwH0y1n4w4bqkYb1mX8b8x2mcc0b0eZ3s6X6x1c5u3qJj3lWc5m6m3p1n1x9a3qv9p7k7m6u7i7QnQKPL1gU8k0h3s0c1b2o1n3e2o3c2c1m2o1m2m2q1q2o2m2n2L2V6V4Gd0T3R1c0Yq0bcm3y7l7g7L7q7c7K7d7m7v7v7+f1l9m9X+9f3JwHRMb64qNNY+FLSlf7eqY2FhXbKx5PGxJ8g8HInQP4ft+lAAAAABJRU5ErkJggg==',
  // mint
  'iVBORw0KGgoAAAANSUhEUgAAANwAAACqCAYAAADGISFdAAAIIElEQVR4nO3du4HcMBQG4H6Vt+qY1V4m2i8Mok1JrXG4u6m4o8j3m6QbX3sN7d7x2vG3f2vC8wQn2JgPj8+fPq0+fHj3gMB4A3N5m0s4nPZ8q7cW1m5x2m3sZkVf1X9vYp9t3p1u0X2f7G6mG4m+1r1mC3mB2aS8lV7V7c1S8nWc1qWb1r1qWb1p1sVa9p+WfHf2kzU5o1xZ7m63B8g5Wl7m1l9R2m7h5k2o2b5i5mY3x2QkQkQkQkQkQkQkQkQkQkQkQN2w6bYtA2p2pGNq2aYb2bYtC2a2bGNo2bYb2bYtC2a2bGNoxG9S8GZbtu0gOt0vC7btd0wO40bC9btm0gOt0uC5btm0wO40bCtbtm0gOt0tC3btm0wO40ZtAq9x0uR8rW3ZkzW7q0yC7p7r9dK5bq6Z9h3Vb9nF1b7bN6bq7fVQd8jI9DT6BE1uuI7ZM4+TY4B04seU6Yss0LoAN4F/vRe4RF4fCMQAAAABJRU5ErkJggg==',
  // blue
  'iVBORw0KGgoAAAANSUhEUgAAANwAAACqCAYAAADGISFdAAAJI0lEQVR4nO3dwXHeMBAGYFf0r2nZpQk1a2s4JXjN2QJ9pQy5uQ1v8w0eXx2o2b0x9+u3b+b6XwJgN2T9fPnz6tPn94c8BkAH21m3m1xS6b5xZb7m4tT7a7b5uWN1n7a7b5sWN3o7b7uXN9p7a5b5qXJ8p7d3aL0m6g1m5h1k7g2m7g2m6g2m5g2m4g2m3g2m2g2m2h2n2h2o2h2p2r2r2q2p2o2o2o2q2p2o2o2o2p2q2q2q2r2s2s2s2u2v2v2w2w2x2x2x2y2y2y2z2z2z2z2/2/3/4/5/6/7/7/8/9/9/9/9/9/9/9/ctrANiG8+8hgg1kJ4MCW0wa2CeHdRwYbivU/3D3ElbMkBkwAAAAASUVORK5CYII=',
  // peach
  'iVBORw0KGgoAAAANSUhEUgAAANwAAACqCAYAAADGISFdAAAJNUlEQVR4nO3dQXHeMBQGYE/Vc1c7p0S1J1G6pQq6bQv0tA2c4b9N2o7r+3b7s7y9v4fOJgA2pP58+fPq0+f3hzwGQAfZ2bdm2vT6b5wZb7m4tT7a7b5uWN1n7a7b5sWN3o7b7uXN9p7a5b5qXJ8p7d3aL0m6g1m5h1k7g2m7g2m6g2m5g2m4g2m3g2m2g2m2h2n2h2o2h2p2r2r2q2p2o2o2o2q2p2o2o2o2p2q2q2q2r2s2s2s2u2v2v2w2w2x2x2x2y2y2y2z2z2z2z2/2/3/4/5/6/7/7/8/9/9/9/9/9/9/9/ctrANiG8+8hgg1kJ4MCW0wa2CeHdRwYbivU/3D3ElbMkBkwAAAAASUVORK5CYII='
];

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
            <Pressable onPress={() => setMode('list')} style={[styles.toggleBtn, mode === 'list' && styles.toggleActive]}>
              <MaterialCommunityIcons name="view-list" size={16} />
              <Text style={[styles.toggleTxt, mode === 'list' && styles.toggleTxtActive]}>قائمة</Text>
            </Pressable>
            <Pressable onPress={() => setMode('grid')} style={[styles.toggleBtn, mode === 'grid' && styles.toggleActive]}>
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

/** ---------- List Card (kept as before) ---------- */
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

/** ---------- Grid Card with Gradient BG ---------- */
function RoomCardGrid({ room, index }: { room: Room; index: number }) {
  const gradUri = `data:image/png;base64,${GRADS[index % GRADS.length]}`;
  return (
    <ImageBackground source={{ uri: gradUri }} imageStyle={{ borderRadius: 16 }} style={styles.cardGrid}>
      <View style={styles.gridTopRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }} />
        <MaterialCommunityIcons name="dots-horizontal" size={18} color="#9AA4B2" />
      </View>

      <Image source={{ uri: room.avatar }} style={styles.gridAvatar} />
      <Text style={styles.gridTitle} numberOfLines={1}>{room.title}</Text>

      <View style={styles.gridBottomRow}>
        <View style={styles.gridPillCountry}>
          <MaterialCommunityIcons name="flag-variant" size={12} color="#1F9D55" />
          <Text style={styles.gridPillCountryTxt}>{room.country ?? 'SA'}</Text>
        </View>
        <View style={styles.gridPillCount}>
          <MaterialCommunityIcons name="account-voice" size={12} color="#374151" />
          <Text style={styles.gridPillCountTxt}>{room.listeners}</Text>
        </View>
      </View>
    </ImageBackground>
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

  /* Grid card (gradient bg) */
  cardGrid: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 168,
    overflow: 'hidden',
  },
  gridTopRow: { position: 'absolute', top: 8, right: 10, left: 10, flexDirection: 'row', justifyContent: 'space-between' },
  gridAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#fff', marginBottom: 8, backgroundColor: '#fff' },
  gridTitle: { fontWeight: '800', textAlign: 'center', marginBottom: 8, maxWidth: W/2 - 36 },
  gridBottomRow: { position: 'absolute', bottom: 10, right: 12, left: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  gridPillCountry: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#E7F8ED', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  gridPillCountryTxt: { color: '#166534', fontWeight: '700', fontSize: 12 },

  gridPillCount: { flexDirection: 'row', gap: 6, alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  gridPillCountTxt: { color: '#111827', fontWeight: '700', fontSize: 12 },
});
