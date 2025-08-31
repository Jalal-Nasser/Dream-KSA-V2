import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

const W = Dimensions.get('window').width;

export default function Explore() {
  const banners = [
    'https://picsum.photos/seed/dksa1/900/400',
    'https://picsum.photos/seed/dksa2/900/400',
  ];
  const trending = new Array(8).fill(0).map((_, i) => ({
    id: `t${i}`, title: `غرفة ترند ${i+1}`, cover: `https://picsum.photos/seed/trend${i}/600/400`, online: 200 + i*7
  }));
  const recommended = new Array(8).fill(0).map((_, i) => ({
    id: `r${i}`, title: `مقترحة ${i+1}`, cover: `https://picsum.photos/seed/rec${i}/600/400`, online: 90 + i*5
  }));
  const categories = ['سعودي','موسيقى','شات','ألعاب','ترفيه','خواطر','تعارف','رمضانيات'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.hi}>مرحباً 👋</Text>
          <Text style={styles.subtitle}>اكتشف الغرف الرائجة اليوم</Text>
        </View>

        {/* Banners */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hlist}>
          {banners.map((src, i) => (
            <Image key={i} source={{ uri: src }} style={styles.banner} />
          ))}
        </ScrollView>

        {/* Trending */}
        <Section title="ترند الآن">
          <HorizontalCards data={trending} />
        </Section>

        {/* Recommended */}
        <Section title="مقترحة لك">
          <HorizontalCards data={recommended} />
        </Section>

        {/* Categories */}
        <Section title="الفئات">
          <View style={styles.chips}>
            {categories.map((c) => (
              <Pressable key={c} style={styles.chip}><Text style={styles.chipTxt}>{c}</Text></Pressable>
            ))}
          </View>
        </Section>

      </ScrollView>

      {/* Floating Create Room (design only) */}
      <Pressable style={styles.fab} onPress={() => {}}>
        <MaterialCommunityIcons name="plus" size={18} />
        <Text style={styles.fabTxt}>إنشاء غرفة</Text>
      </Pressable>
    </SafeAreaView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={{ marginTop: 16 }}>
      <View style={styles.secHeader}>
        <Pressable><Text style={styles.all}>عرض الكل</Text></Pressable>
        <Text style={styles.secTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function HorizontalCards({ data }: { data: Array<{id:string; title:string; cover:string; online:number}> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hlist}>
      {data.map((it) => (
        <View key={it.id} style={styles.card}>
          <Image source={{ uri: it.cover }} style={styles.cardImg} />
          <View style={styles.cardRow}>
            <Ionicons name="radio" size={14} color="#E53935" />
            <Text style={styles.liveTxt}>{it.online} متصل</Text>
          </View>
          <Text style={styles.cardTitle} numberOfLines={1}>{it.title}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 14, paddingTop: 6, alignItems: 'flex-end' },
  hi: { fontSize: 20, fontWeight: '800' },
  subtitle: { opacity: 0.7, marginTop: 4 },
  hlist: { paddingHorizontal: 12, gap: 10 },
  banner: { width: W * 0.82, height: 140, borderRadius: 16 },
  secHeader: { paddingHorizontal: 14, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  secTitle: { fontSize: 16, fontWeight: '800' },
  all: { color: '#3D82F6', fontWeight: '700' },
  card: { width: 160, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', paddingBottom: 8 },
  cardImg: { width: '100%', height: 96 },
  cardRow: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3, flexDirection: 'row-reverse', gap: 4, alignItems: 'center' },
  liveTxt: { color: '#fff', fontSize: 11 },
  cardTitle: { textAlign: 'right', marginTop: 8, marginHorizontal: 10, fontWeight: '700' },
  chips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, paddingHorizontal: 12 },
  chip: { backgroundColor: '#EEF2F7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999 },
  chipTxt: { fontWeight: '700' },
  fab: { position: 'absolute', left: 14, bottom: 24, backgroundColor: '#E9F8EC', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, flexDirection: 'row-reverse', gap: 6, alignItems: 'center', borderWidth: 1, borderColor: '#C7EED2' },
  fabTxt: { fontWeight: '700' },
});
