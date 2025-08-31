import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList } from 'react-native';
import RoomCard from '../components/RoomCard';

export default function Live() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.head}>
        <Text style={styles.title}>الغرف المباشرة</Text>
        <Text style={styles.sub}>قائمة مبدئية — سيتم ربطها لاحقاً</Text>
      </View>
      <FlatList
        data={[
          { id:'a', title:'سواليف', listeners:180, agency:'KSA' },
          { id:'b', title:'رياضة اليوم', listeners:220, agency:'Sports' },
          { id:'c', title:'خواطر', listeners:95, agency:'Chill' },
        ]}
        keyExtractor={i=>i.id}
        contentContainerStyle={{ padding:16, gap:12 }}
        renderItem={({item})=> <RoomCard {...item} />}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071021' },
  head: { paddingTop:8, paddingHorizontal:16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
});
