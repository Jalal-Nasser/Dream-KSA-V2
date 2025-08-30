import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import VipBadge from '../components/VipBadge';

export default function Profile() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ alignItems:'center', paddingTop:24 }}>
        <Avatar name="أحمد" size={88} vip />
        <Text style={styles.name}>أحمد</Text>
        <VipBadge label="VIP Gold" />
      </View>
      <View style={{ padding:16, gap:12 }}>
        <TouchableOpacity style={styles.row} activeOpacity={0.9}>
          <Ionicons name="color-palette" size={18} color="#fff" />
          <Text style={styles.rowTxt}>تخصيص الثيم</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} activeOpacity={0.9}>
          <Ionicons name="ribbon" size={18} color="#fff" />
          <Text style={styles.rowTxt}>شاراتي</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row} activeOpacity={0.9}>
          <Ionicons name="settings" size={18} color="#fff" />
          <Text style={styles.rowTxt}>الإعدادات</Text>
          <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.6)" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071021' },
  name:{ color:'#fff', fontWeight:'900', fontSize:18, marginTop:10 },
  row:{ backgroundColor:'#0f1625', borderRadius:14, padding:14, flexDirection:'row', alignItems:'center', gap:12 },
  rowTxt:{ color:'#fff', fontWeight:'700', flex:1 },
});

