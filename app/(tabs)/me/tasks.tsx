import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CherryHeader from '../../components/CherryHeader';
import { PALETTE } from '../../../lib/theme';

const TASKS = [
  { id:'login', title:'تسجيل دخول يومي', progress:0.4, reward:20 },
  { id:'invite', title:'دعوة صديق', progress:0.1, reward:100 },
  { id:'host', title:'استضافة غرفة 10 دقائق', progress:0.7, reward:60 },
  { id:'gift', title:'إرسال هدية', progress:0.0, reward:15 },
];

export default function TasksScreen() {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: PALETTE.soft1 }}>
      <CherryHeader title="مهام" />
      <ScrollView contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 24 }}>
        {TASKS.map(t=>(
          <View key={t.id} style={styles.card}>
            <View style={{ alignItems:'flex-end', gap:4 }}>
              <Text style={styles.title}>{t.title}</Text>
              <View style={styles.barBg}>
                <View style={[styles.barFill,{ width: `${t.progress*100}%` }]} />
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.reward}>+{t.reward}</Text>
              <Pressable style={styles.btn}><Text style={styles.btnTxt}>{t.progress>=1 ? 'استلم' : 'اذهب'}</Text></Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  card:{ backgroundColor:'#fff', borderRadius:16, padding:12, gap:10 },
  title:{ fontWeight:'800' },
  barBg:{ height:8, backgroundColor:PALETTE.soft2, borderRadius:6, width:'100%' },
  barFill:{ height:8, backgroundColor:PALETTE.primary, borderRadius:6 },
  row:{ flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between' },
  reward:{ fontWeight:'900', color:PALETTE.primaryDark },
  btn:{ backgroundColor:PALETTE.primary, paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  btnTxt:{ color:'#fff', fontWeight:'800' },
});
