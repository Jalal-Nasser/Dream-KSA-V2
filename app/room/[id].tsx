import React, { useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Avatar from '../components/Avatar';
import GiftModal from '../components/GiftModal';

export default function Room() {
  const { id, name } = useLocalSearchParams<{id:string; name?:string}>();
  const router = useRouter();
  const [giftVisible, setGiftVisible] = useState(false);

  const speakers = [
    { id:'u1', name:'المضيف', muted:false, vip:true },
    { id:'u2', name:'المتحدث', muted:false, vip:false },
  ];
  const listeners = Array.from({length:18}).map((_,i)=>({ id:String(i), name:`م${i+1}`}));

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.back()} style={styles.iconBtn}><Ionicons name="chevron-back" size={20} color="#fff"/></TouchableOpacity>
        <Text numberOfLines={1} style={styles.roomName}>{name || 'غرفة مباشرة'}</Text>
        <TouchableOpacity style={styles.iconBtn}><Ionicons name="shield-checkmark" size={18} color="#fff"/></TouchableOpacity>
      </View>

      {/* Speakers */}
      <View style={styles.speakers}>
        {speakers.map(s=>(
          <View key={s.id} style={{ alignItems:'center' }}>
            <Avatar name={s.name} size={72} vip={s.vip} />
            <Text style={styles.spkName}>{s.name}</Text>
          </View>
        ))}
      </View>

      {/* Listeners grid */}
      <FlatList
        data={listeners}
        keyExtractor={i=>i.id}
        numColumns={6}
        contentContainerStyle={{ paddingHorizontal:12 }}
        renderItem={({item})=>(
          <View style={{ width:'16.66%', alignItems:'center', marginBottom:12 }}>
            <Avatar name={item.name} size={46}/>
            <Text numberOfLines={1} style={styles.listenerName}>{item.name}</Text>
          </View>
        )}
      />

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.ctrlBtn,{ backgroundColor:'#e21b73'}]}>
          <Ionicons name="hand-left" size={20} color="#fff"/>
          <Text style={styles.ctrlTxt}>ارفع يدك</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.round} onPress={()=>setGiftVisible(true)}>
          <MaterialCommunityIcons name="gift" size={22} color="#fff"/>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctrlBtn,{ backgroundColor:'#172138'}]}>
          <Ionicons name="mic" size={20} color="#fff"/>
          <Text style={styles.ctrlTxt}>الميكروفون</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctrlBtn,{ backgroundColor:'#D7263D'}]} onPress={()=>router.back()}>
          <Ionicons name="exit" size={20} color="#fff"/>
          <Text style={styles.ctrlTxt}>خروج</Text>
        </TouchableOpacity>
      </View>

      <GiftModal visible={giftVisible} onClose={()=>setGiftVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:{ flex:1, backgroundColor:'#071021' },
  header:{ paddingHorizontal:12, paddingTop:4, paddingBottom:8, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  iconBtn:{ width:36, height:36, borderRadius:18, backgroundColor:'#0f1625', alignItems:'center', justifyContent:'center' },
  roomName:{ color:'#fff', fontSize:16, fontWeight:'800', maxWidth:'62%', textAlign:'center' },
  speakers:{ flexDirection:'row', gap:24, justifyContent:'center', paddingVertical:12 },
  spkName:{ color:'#fff', fontSize:12, marginTop:6 },
  listenerName:{ color:'rgba(255,255,255,0.8)', fontSize:10, marginTop:4 },
  controls:{ flexDirection:'row', alignItems:'center', justifyContent:'space-around', padding:12, gap:10 },
  ctrlBtn:{ flexDirection:'row', alignItems:'center', gap:8, paddingVertical:10, paddingHorizontal:14, borderRadius:14 },
  ctrlTxt:{ color:'#fff', fontWeight:'800', fontSize:12 },
  round:{ width:46, height:46, borderRadius:23, backgroundColor:'#e21b73', alignItems:'center', justifyContent:'center' },
});
