import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE } from '../../lib/theme';
const W = Dimensions.get('window').width;

export default function Explore() {
  const banners = ['https://picsum.photos/seed/dksa1/900/400','https://picsum.photos/seed/dksa2/900/400'];
  const cards = new Array(8).fill(0).map((_,i)=>({ id:`c${i}`, title:`محتوى ${i+1}`, img:`https://picsum.photos/seed/e${i}/600/400` }));
  return (
    <LinearGradient
      colors={['#FBE7EF', '#F2CAD6', '#F8D7DA', '#FBE7EF']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          <Text style={styles.title}>اكتشاف</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hlist}>
            {banners.map((b,i)=> <Image key={i} source={{uri:b}} style={styles.banner} />)}
          </ScrollView>
          <View style={styles.grid}>
            {cards.map(c=>(
              <View key={c.id} style={styles.card}>
                <Image source={{uri:c.img}} style={styles.cardImg}/>
                <Text style={styles.cardTitle} numberOfLines={1}>{c.title}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  title:{ fontWeight:'900', color:PALETTE.primaryDark, textAlign:'right', marginRight:12, marginTop:10 },
  hlist:{ paddingHorizontal:12, gap:10, paddingTop:8 },
  banner:{ width:W*0.86, height:140, borderRadius:16 },
  grid:{ paddingHorizontal:10, flexDirection:'row', flexWrap:'wrap', gap:10, paddingTop:10 },
  card:{ width:(W-30)/2, backgroundColor:'#fff', borderRadius:14, overflow:'hidden' },
  cardImg:{ width:'100%', height:100 },
  cardTitle:{ textAlign:'right', fontWeight:'700', margin:8 }
});
