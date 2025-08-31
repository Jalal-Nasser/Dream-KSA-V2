import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CherryHeader from '../../components/CherryHeader';
import { PALETTE } from '../../../lib/theme';

export default function SupportScreen() {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: PALETTE.soft1 }}>
      <CherryHeader title="خدمة العملاء" />
      <ScrollView contentContainerStyle={{ padding:12, gap:12, paddingBottom:24 }}>
        <View style={styles.card}>
          <Text style={styles.header}>طرق التواصل</Text>
          <View style={styles.row}>
            <Pressable style={styles.btn}><Text style={styles.btnTxt}>FAQ</Text></Pressable>
            <Pressable style={styles.btnGhost}><Text style={styles.btnGhostTxt}>راسلنا</Text></Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.header}>ارسال تذكرة</Text>
          <TextInput placeholder="اكتب مشكلتك..." placeholderTextColor="#9CA3AF" style={styles.input} multiline />
          <Pressable style={styles.send}><Text style={styles.sendTxt}>إرسال</Text></Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  card:{ backgroundColor:'#fff', borderRadius:16, padding:12, gap:12 },
  header:{ textAlign:'right', fontWeight:'900', color:PALETTE.primaryDark },
  row:{ flexDirection:'row-reverse', gap:8 },
  btn:{ backgroundColor:PALETTE.primary, borderRadius:10, paddingHorizontal:12, paddingVertical:8 },
  btnTxt:{ color:'#fff', fontWeight:'800' },
  btnGhost:{ backgroundColor:PALETTE.soft2, borderRadius:10, paddingHorizontal:12, paddingVertical:8 },
  btnGhostTxt:{ color:PALETTE.primaryDark, fontWeight:'800' },
  input:{ backgroundColor:PALETTE.soft2, borderRadius:12, padding:10, textAlign:'right', minHeight:100 },
  send:{ backgroundColor:PALETTE.primary, borderRadius:10, paddingVertical:10, alignItems:'center' },
  sendTxt:{ color:'#fff', fontWeight:'900' },
});
