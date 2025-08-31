import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CherryHeader from '../../components/CherryHeader';
import { PALETTE } from '../../../lib/theme';

export default function LanguageScreen() {
  const [lang, setLang] = React.useState<'ar'|'en'>('ar');
  return (
    <SafeAreaView style={{ flex:1, backgroundColor: PALETTE.soft1 }}>
      <CherryHeader title="اللغة" />
      <View style={{ padding:12, gap:10 }}>
        {[
          { key:'ar', label:'العربية' },
          { key:'en', label:'English' },
        ].map(({key,label})=>(
          <Pressable key={key} style={styles.row} onPress={()=> setLang(key as any)}>
            <View style={[styles.radio, lang===key && styles.radioOn]} />
            <Text style={styles.label}>{label}</Text>
          </Pressable>
        ))}
        <Text style={styles.note}>سيتم تطبيق اللغة لاحقًا (عرض تصميم فقط)</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  row:{ backgroundColor:'#fff', borderRadius:16, padding:12, flexDirection:'row-reverse', alignItems:'center', gap:10 },
  radio:{ width:18, height:18, borderRadius:999, borderWidth:2, borderColor:PALETTE.primary },
  radioOn:{ backgroundColor:PALETTE.primary },
  label:{ fontWeight:'800' },
  note:{ textAlign:'right', color:'#6B7280', marginTop:6 },
});
