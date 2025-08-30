import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import RoomCard from '../components/RoomCard';
import { Ionicons } from '@expo/vector-icons';

const MOCK = [
  { id: '1', title: 'ساحة الدردشة العامة', listeners: 248, agency: 'Dream KSA', featured: true },
  { id: '2', title: 'نقاش تقني', listeners: 112, agency: 'Developers' },
  { id: '3', title: 'جلسة طرب', listeners: 301, agency: 'Music' },
];

export default function Explore() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.hi}>استكشف الغرف</Text>
        <Text style={styles.sub}>مميزة • نشطة الآن</Text>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color="rgba(255,255,255,0.7)" />
          <Text style={styles.searchTxt}>ابحث عن غرفة…</Text>
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
  safe: { flex: 1, backgroundColor: '#071021' },
  header: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 8 },
  hi: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  search: { marginTop: 10, backgroundColor: '#0f1625', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, flexDirection:'row', alignItems:'center', gap:10 },
  searchTxt:{ color:'rgba(255,255,255,0.7)' }
});

