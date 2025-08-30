import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Agencies() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ padding:16 }}>
        <Text style={styles.title}>الوكالات</Text>
        <Text style={styles.sub}>واجهة مبدئية — سنربطها بجدولك</Text>
      </View>
      <FlatList
        data={[
          { id:'1', name:'Dream KSA', members:1280 },
          { id:'2', name:'Arab Stars', members:860 },
          { id:'3', name:'VIP World', members:420 },
        ]}
        keyExtractor={i=>i.id}
        contentContainerStyle={{ padding:16, gap:12 }}
        renderItem={({item})=>(
          <TouchableOpacity activeOpacity={0.9} style={styles.agency}>
            <View style={styles.logo}><Ionicons name="ribbon" size={18} color="#fff"/></View>
            <View style={{ flex:1 }}>
              <Text style={styles.aName}>{item.name}</Text>
              <Text style={styles.aSub}>{item.members} عضو</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)"/>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071021' },
  title: { color: '#fff', fontSize: 20, fontWeight: '800' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  agency:{ backgroundColor:'#0f1625', borderRadius:16, padding:14, flexDirection:'row', alignItems:'center', gap:12 },
  logo:{ width:36, height:36, borderRadius:18, backgroundColor:'#172138', alignItems:'center', justifyContent:'center' },
  aName:{ color:'#fff', fontWeight:'800' },
  aSub:{ color:'rgba(255,255,255,0.7)', fontSize:12, marginTop:2 },
});
