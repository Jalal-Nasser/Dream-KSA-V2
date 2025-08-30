import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const GIFTS = [
  { id:'1', name:'وردة', icon:<Ionicons name="rose" size={22} color="#FF9AA2"/> , coins:10 },
  { id:'2', name:'قلب', icon:<Ionicons name="heart" size={22} color="#F94144"/> , coins:20 },
  { id:'3', name:'نجمة', icon:<Ionicons name="star" size={22} color="#FFD166"/> , coins:35 },
  { id:'4', name:'تاج', icon:<MaterialCommunityIcons name="crown" size={22} color="#F4D35E"/> , coins:50 },
];

export default function GiftModal({ visible, onClose }: { visible:boolean; onClose:()=>void }) {
  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.title}>الهدايا</Text>
          <FlatList
            data={GIFTS}
            keyExtractor={i=>i.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({item})=>(
              <TouchableOpacity style={styles.gift} activeOpacity={0.9} onPress={onClose}>
                {item.icon}
                <Text style={styles.giftName}>{item.name}</Text>
                <Text style={styles.coin}>{item.coins} 💎</Text>
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeTxt}>إغلاق</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:{ flex:1, backgroundColor:'rgba(0,0,0,0.4)', justifyContent:'flex-end' },
  sheet:{ backgroundColor:'#0f1625', borderTopLeftRadius:20, borderTopRightRadius:20, padding:16, paddingBottom:26 },
  handle:{ alignSelf:'center', width:46, height:5, borderRadius:999, backgroundColor:'rgba(255,255,255,0.2)', marginBottom:10 },
  title:{ color:'#fff', fontWeight:'800', fontSize:16, marginBottom:10, textAlign:'center' },
  gift:{ flex:1, backgroundColor:'#172138', borderRadius:14, paddingVertical:16, alignItems:'center', gap:6 },
  giftName:{ color:'#fff', fontWeight:'700' },
  coin:{ color:'rgba(255,255,255,0.7)', fontSize:12 },
  closeBtn:{ marginTop:14, backgroundColor:'#e21b73', borderRadius:12, paddingVertical:10, alignItems:'center' },
  closeTxt:{ color:'#fff', fontWeight:'800' },
});
