import React from 'react';
import { SafeAreaView, View, Text, StyleSheet, FlatList } from 'react-native';
import RoomCard from '../components/RoomCard';
// quarantined
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
        <Text style={styles.subDark}>مميزة • نشطة الآن</Text>
        <View style={styles.search}>
          <Text style={styles.searchTxtDark}>ابحث عن غرفة…</Text>
        </View>
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
  safe: { flex: 1, backgroundColor: '#F5F7FB' },
  header: { paddingTop: 16, paddingHorizontal: 16, paddingBottom: 12 },
  hi: { color: '#111827', fontSize: 22, fontWeight: '800' },
  subDark: { color: '#6B7280', marginTop: 6 },
  search: { marginTop: 12, backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, borderColor: '#ECEFF3' },
  searchTxtDark: { color: '#9CA3AF' }
});
