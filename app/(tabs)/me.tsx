import React from 'react';
import { SafeAreaView, View, Text, StyleSheet } from 'react-native';
import { colors } from '../binmo-theme';

export default function Me(){
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: colors.bg }}>
      <View style={styles.hero}>
        <View style={styles.avatar}><Text style={{color:'#fff',fontWeight:'900'}}>أ</Text></View>
        <Text style={styles.name}>أحمد</Text>
        <Text style={styles.role}>عضو • Dream KSA</Text>
      </View>
      <View style={styles.card}><Text style={styles.item}>وكالتي</Text></View>
      <View style={styles.card}><Text style={styles.item}>الغرف التي أمتلكها</Text></View>
      <View style={styles.card}><Text style={styles.item}>الإعدادات</Text></View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero:{ padding:16, alignItems:'center' },
  avatar:{ width:72, height:72, borderRadius:36, backgroundColor:'#00C853', alignItems:'center', justifyContent:'center' },
  name:{ marginTop:8, fontSize:18, fontWeight:'800', color:colors.text },
  role:{ color: colors.textMuted, marginTop:4 },
  card:{ backgroundColor:'#fff', borderRadius:14, marginHorizontal:16, marginBottom:10, paddingVertical:16, paddingHorizontal:14, borderWidth:1, borderColor:colors.border },
  item:{ color: colors.text, fontWeight:'700' }
});
