import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../_binmo-theme';

export default function Agencies() {
  const router = useRouter();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ padding: 16 }}>
        <Text style={styles.title}>وكالات Binmo</Text>
        <Text style={styles.sub}>انضم أو أنشئ وكالتك</Text>

        <TouchableOpacity style={styles.bigBtn} onPress={() => router.push('/agencies/join')}>
          <Text style={styles.bigBtnTxt}>الانضمام إلى الوكالة</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.bigBtn,{backgroundColor:'#E8F5E9', borderColor:'#B8E7C2'}]} onPress={() => router.push('/agencies/create')}>
          <Text style={[styles.bigBtnTxt,{color:'#00A651'}]}>إنشاء وكالة</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  title:{ color: colors.text, fontSize: 22, fontWeight:'800' },
  sub:{ color: colors.textMuted, marginTop: 6, marginBottom: 16 },
  bigBtn:{ backgroundColor:'#FFF', borderWidth:1, borderColor:colors.border, borderRadius:16, paddingVertical:18, alignItems:'center', marginBottom:12 },
  bigBtnTxt:{ fontWeight:'800', color: colors.text }
});

