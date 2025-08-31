import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CherryHeader from '../../components/CherryHeader';
import { PALETTE } from '../../../lib/theme';

const cats = [
  { id:'vip', title:'VIP', img:'https://picsum.photos/seed/vip/400/300' },
  { id:'gifts', title:'هدايا', img:'https://picsum.photos/seed/gifts/400/300' },
  { id:'frames', title:'إطارات', img:'https://picsum.photos/seed/frames/400/300' },
  { id:'themes', title:'ثيمات', img:'https://picsum.photos/seed/themes/400/300' },
];

export default function StoreScreen() {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: PALETTE.soft1 }}>
      <CherryHeader title="متجر" />
      <ScrollView contentContainerStyle={{ padding: 12, gap: 10, paddingBottom: 24 }}>
        <View style={styles.grid}>
          {cats.map(c=>(
            <Pressable key={c.id} style={styles.card}>
              <Image source={{ uri:c.img }} style={styles.img}/>
              <Text style={styles.title} numberOfLines={1}>{c.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  grid:{ flexDirection:'row', flexWrap:'wrap', gap:10 },
  card:{ width:'48%', backgroundColor:'#fff', borderRadius:16, overflow:'hidden' },
  img:{ width:'100%', height:110 },
  title:{ textAlign:'center', fontWeight:'800', paddingVertical:10 },
});
