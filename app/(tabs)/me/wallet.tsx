import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import CherryHeader from '../../components/CherryHeader';
import { PALETTE } from '../../../lib/theme';

export default function WalletScreen() {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: PALETTE.soft1 }}>
      <CherryHeader title="محفظة" />
      <ScrollView contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 28 }}>
        {/* Balances */}
        <View style={styles.row}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>العملات</Text>
            <Text style={styles.bigNum}>12,450</Text>
            <View style={styles.actions}>
              <Pressable style={styles.primaryBtn}><Text style={styles.primaryTxt}>شحن</Text></Pressable>
              <Pressable style={styles.ghostBtn}><Text style={styles.ghostTxt}>سحب</Text></Pressable>
            </View>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>الألماس</Text>
            <Text style={styles.bigNum}>310</Text>
            <View style={styles.actions}>
              <Pressable style={styles.primaryBtn}><Text style={styles.primaryTxt}>تحويل</Text></Pressable>
              <Pressable style={styles.ghostBtn}><Text style={styles.ghostTxt}>شراء</Text></Pressable>
            </View>
          </View>
        </View>

        {/* Transactions */}
        <View style={styles.cardFull}>
          <Text style={styles.section}>السجل</Text>
          {[0,1,2,3,4].map((i)=>(
            <View key={i} style={styles.txRow}>
              <MaterialCommunityIcons name="cash-multiple" size={18} color={PALETTE.primary} />
              <View style={{ flex:1, alignItems:'flex-end' }}>
                <Text style={styles.txTitle}>عملية {i+1}</Text>
                <Text style={styles.txSub}>اليوم • 12:{10+i} م</Text>
              </View>
              <Text style={styles.txAmount}>+ {100*(i+1)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  row:{ flexDirection:'row', gap:12 },
  card:{ flex:1, backgroundColor:'#fff', borderRadius:16, padding:12, gap:10 },
  cardTitle:{ fontWeight:'800', textAlign:'right' },
  bigNum:{ fontWeight:'900', fontSize:24, textAlign:'right', color: PALETTE.primaryDark },
  actions:{ flexDirection:'row-reverse', gap:8 },
  primaryBtn:{ backgroundColor:PALETTE.primary, borderRadius:10, paddingHorizontal:12, paddingVertical:8 },
  primaryTxt:{ color:'#fff', fontWeight:'800' },
  ghostBtn:{ backgroundColor:PALETTE.soft2, borderRadius:10, paddingHorizontal:12, paddingVertical:8 },
  ghostTxt:{ color:PALETTE.primaryDark, fontWeight:'800' },

  cardFull:{ backgroundColor:'#fff', borderRadius:16, padding:12, gap:12 },
  section:{ fontWeight:'900', color:PALETTE.primaryDark, textAlign:'right' },
  txRow:{ flexDirection:'row-reverse', alignItems:'center', gap:10, paddingVertical:10, borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:PALETTE.soft2 },
  txTitle:{ fontWeight:'800' },
  txSub:{ color:'#8E8E93', marginTop:2 },
  txAmount:{ fontWeight:'900', color:PALETTE.primaryDark },
});
