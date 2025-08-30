import React from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView } from 'react-native';
import RoomCard from '../components/RoomCard';

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
  header: { paddingTop: 8, paddingHorizontal: 16, paddingBottom: 4 },
  hi: { color: '#fff', fontSize: 22, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 2 },
});

