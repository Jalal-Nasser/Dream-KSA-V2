import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';
import RoomCard from '../components/RoomCard';
import { colors } from '../_binmo-theme';

const MOCK = [
  { id: '1', title: 'ساحة الدردشة العامة', listeners: 248, agency: undefined },
  { id: '2', title: 'نقاش تقني', listeners: 112, agency: undefined },
  { id: '3', title: 'جلسة طرب', listeners: 301, agency: 'Smile Agency' },
];

export default function Explore() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.hi}>اكتشف الغرف</Text>
        <Text style={styles.sub}>مميزة • نشطة الآن</Text>
        <View style={styles.search}><Text style={styles.searchTxt}>ابحث عن غرفة…</Text></View>
      </View>
      <FlatList
        data={MOCK}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        renderItem={({ item }) => <RoomCard {...item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 12 },
  hi: { color: colors.text, fontSize: 22, fontWeight: '800' },
  sub: { color: colors.textMuted, marginTop: 6 },
  search: { marginTop: 12, backgroundColor: colors.card, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border },
  searchTxt: { color: '#9CA3AF' }
});

