import React from 'react';
import { ScrollView, View, Text, Pressable, I18nManager, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

const AR = I18nManager.isRTL;

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View style={{ marginTop: 18 }}>
    <Text style={[styles.h2, { textAlign: AR ? 'right' : 'left' }]}>{title}</Text>
    <View style={{ height: 8 }} />
    {children}
  </View>
);

export default function ExploreDemo() {
  const router = useRouter();
  const openRoom = (id: string) => router.push(`/room/${encodeURIComponent(id)}`);
  const openGames = () => router.push('/demo/games');

  const roomCards = [
    { id: 'demo-room-1', title: AR ? 'غرفة عشوائية' : 'Random Room', audience: 247 },
    { id: 'demo-room-2', title: AR ? 'وناسة' : 'Fun Time', audience: 268 },
    { id: 'demo-room-3', title: AR ? 'صَباحيات' : 'Morning Chill', audience: 195 },
    { id: 'demo-room-4', title: AR ? 'أعلى غرفة' : 'Top Room', audience: 356 },
  ];

  return (
    <ScrollView style={styles.page} contentContainerStyle={{ padding: 14 }}>
      {/* Banner */}
      <Pressable style={styles.banner} onPress={openGames}>
        <Text style={styles.bannerTitle}>{AR ? 'تهانينا على الوصول!' : 'Congrats on your progress!'}</Text>
        <Text style={styles.bannerSub}>{AR ? 'اضغط لفتح مركز الألعاب مجانًا' : 'Tap to open Games Center (free)'} 🎮</Text>
      </Pressable>

      {/* Tabs (static) */}
      <View style={[styles.tabs, { flexDirection: AR ? 'row-reverse' : 'row' }]}>
        {['الخاص بي', 'ترند', 'المشاهير'].map((t, i) => (
          <Pressable key={t} style={[styles.tab, i === 1 && styles.tabActive]}><Text style={[styles.tabTxt, i === 1 && styles.tabActiveTxt]}>{t}</Text></Pressable>
        ))}
      </View>

      <Section title={AR ? 'ألعاب مشهورة' : 'Popular Games'}>
        <View style={[styles.row, { flexDirection: AR ? 'row-reverse' : 'row' }]}>
          {[
            { k: 'uno', label: 'UNO', soon: true },
            { k: 'ludo', label: 'Ludo', soon: true },
            { k: 'vs', label: 'VS', soon: false },
            { k: 'karim', label: AR ? 'لعبة الكريم' : 'Karim', soon: true },
          ].map((g) => (
            <Pressable
              key={g.k}
              onPress={openGames}
              style={[styles.gameCard, g.soon && { opacity: 0.8 }]}
            >
              <Text style={styles.gameIcon}>{g.k === 'vs' ? '⚡️' : '🎲'}</Text>
              <Text style={styles.gameTitle}>{g.label}</Text>
              {g.soon && <Text style={styles.soon}>{AR ? 'قريبًا' : 'Soon'}</Text>}
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title={AR ? 'أنشطة الغرفة' : 'Room Activities'}>
        <View style={[styles.row, { flexDirection: AR ? 'row-reverse' : 'row' }]}>
          {[
            { title: AR ? 'سوالف 195' : 'Talk 195' },
            { title: AR ? 'همسات صباحية' : 'Good Morning' },
          ].map((a, idx) => (
            <Pressable key={idx} onPress={() => openRoom('demo-room-1')} style={styles.activity}>
              <Text style={styles.activityTxt}>{a.title}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title={AR ? 'الغرف' : 'Rooms'}>
        <View style={[styles.grid, { flexDirection: AR ? 'row-reverse' : 'row' }]}>
          {roomCards.map((r) => (
            <Pressable key={r.id} onPress={() => openRoom(r.id)} style={styles.room}>
              <View style={styles.roomThumb}><Text style={{ fontSize: 18 }}>🎤</Text></View>
              <Text style={[styles.roomTitle, { textAlign: AR ? 'right' : 'left' }]} numberOfLines={1}>{r.title}</Text>
              <Text style={styles.roomSub}>{r.audience} {AR ? 'مشاهد' : 'viewers'}</Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { backgroundColor: '#F7FBFD' },
  banner: { backgroundColor: '#FFE3D5', borderRadius: 16, padding: 16, overflow: 'hidden' },
  bannerTitle: { fontSize: 18, fontWeight: '800', color: '#803312', textAlign: 'center' },
  bannerSub: { marginTop: 6, fontSize: 13, color: '#A04B2A', textAlign: 'center' },

  tabs: { marginTop: 14, backgroundColor: '#fff', borderRadius: 12, padding: 6, justifyContent: 'space-between' },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  tabActive: { backgroundColor: '#F2E6FF' },
  tabTxt: { color: '#666', fontWeight: '600' },
  tabActiveTxt: { color: '#7B2BE2' },

  h2: { fontSize: 18, fontWeight: '800', color: '#111' },
  row: { flexDirection: 'row', alignItems: 'stretch', justifyContent: 'space-between' },

  gameCard: { width: '24%', backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: '#eee' },
  gameIcon: { fontSize: 28, marginBottom: 6 },
  gameTitle: { fontSize: 12, fontWeight: '700', color: '#333' },
  soon: { fontSize: 10, color: '#999', marginTop: 2 },

  activity: { flex: 1, height: 72, backgroundColor: '#E9F7FF', borderRadius: 14, marginHorizontal: 4, alignItems: 'center', justifyContent: 'center' },
  activityTxt: { fontWeight: '700', color: '#0E6F92' },

  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  room: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 12, marginBottom: 12, marginHorizontal: '1%', borderWidth: 1, borderColor: '#eee' },
  roomThumb: { backgroundColor: '#F8F2FF', borderRadius: 12, height: 110, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  roomTitle: { fontSize: 14, fontWeight: '800', color: '#222' },
  roomSub: { fontSize: 12, color: '#777', marginTop: 2 },
});


