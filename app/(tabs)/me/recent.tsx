import * as React from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CherryHeader from '../../components/CherryHeader';
import { PALETTE } from '../../../lib/theme';
const DATA = new Array(12).fill(0).map((_,i)=>({ id:`v${i}`, title:`غرفة ${i+1}`, avatar:`https://i.pravatar.cc/120?img=${(i%60)+1}`, time:`اليوم • ${9+i}:30` }));

export default function RecentScreen() {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: PALETTE.soft1 }}>
      <CherryHeader title="الزيارات الأخيرة" />
      <FlatList
        data={DATA}
        keyExtractor={(x)=>x.id}
        contentContainerStyle={{ padding:12, paddingBottom:24 }}
        ItemSeparatorComponent={()=> <View style={{ height:10 }} />}
        renderItem={({item})=>(
          <View style={styles.card}>
            <Image source={{ uri:item.avatar }} style={styles.avatar}/>
            <View style={{ flex:1, alignItems:'flex-end' }}>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.sub}>{item.time}</Text>
            </View>
            <Pressable style={styles.join}><Text style={styles.joinTxt}>انضم</Text></Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  card:{ backgroundColor:'#fff', borderRadius:16, padding:12, flexDirection:'row-reverse', alignItems:'center', gap:10 },
  avatar:{ width:48, height:48, borderRadius:12, backgroundColor:'#eee' },
  title:{ fontWeight:'800' },
  sub:{ color:'#8E8E93', marginTop:2 },
  join:{ backgroundColor:PALETTE.primary, paddingHorizontal:12, paddingVertical:8, borderRadius:10 },
  joinTxt:{ color:'#fff', fontWeight:'800' },
});
