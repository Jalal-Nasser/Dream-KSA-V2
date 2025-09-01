import * as React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getSupabase } from '../lib/supabase';
import { PALETTE } from '../lib/theme';

export default function Login() {
  const supabase = getSupabase();
  const [showTips, setShowTips] = React.useState(false);

  React.useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_e, s) => {
      if (s?.user) router.replace('/(tabs)/rooms');
    });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  const signInOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    // Apple only on iOS; Google/Facebook all platforms
    if (provider === 'apple' && Platform.OS !== 'ios') return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'dream-ksa://auth-callback' }
    });
    if (error) console.log('[oauth]', provider, error.message);
  };

  return (
    <View style={styles.root}>
      {/* brand / top link */}
      <View style={styles.topRow}>
        <Pressable onPress={() => router.push('/login/help')}>
          <Text style={styles.help}>Can't login?</Text>
        </Pressable>
      </View>

      {/* center brand (your DKSA mark already in bg; keep UI minimal) */}
      <View style={{ flex: 1 }} />

      {/* big provider buttons (Binmo-like) */}
      {Platform.OS === 'ios' && (
        <Pressable style={[styles.bigBtn, styles.apple]} onPress={() => signInOAuth('apple')}>
          <Ionicons name="logo-apple" size={20} color="#fff" />
          <Text style={styles.bigTxt}>Apple ID</Text>
        </Pressable>
      )}
      <Pressable style={[styles.bigBtn, styles.google]} onPress={() => signInOAuth('google')}>
        <Ionicons name="logo-google" size={20} color="#111827" />
        <Text style={[styles.bigTxt, { color:'#111827' }]}>Google</Text>
      </Pressable>

      {/* small round icons row (Facebook + Phone) */}
      <View style={styles.iconRow}>
        <Pressable style={styles.roundBtn} onPress={() => signInOAuth('facebook')}>
          <Ionicons name="logo-facebook" size={22} color="#1877F2" />
        </Pressable>
        <Pressable style={styles.roundBtn} onPress={() => setShowTips(true)}>
          <MaterialCommunityIcons name="cellphone" size={22} color={PALETTE.primaryDark} />
        </Pressable>
      </View>

      {/* legal line */}
      <Pressable onPress={() => router.push('/legal/terms')} style={{ marginTop: 12 }}>
        <Text style={styles.legalText}>
          By continuing you agree to DreamKSA's <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy</Text>
        </Text>
      </Pressable>

      <View style={{ height: 28 }} />

      {/* Tips modal → confirm to open phone screen */}
      <Modal visible={showTips} transparent animationType="fade" onRequestClose={() => setShowTips(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.tipsTitle}>Tips</Text>
            <Text style={styles.tipsBody}>
              By continuing, you agree to DreamKSA Terms of Service and Privacy Policy.
            </Text>
            <View style={{ flexDirection:'row', gap:12 }}>
              <Pressable onPress={() => setShowTips(false)} style={[styles.sheetBtn,{ backgroundColor:'#e5e7eb'}]}>
                <Text style={[styles.sheetBtnTxt,{ color:'#111827'}]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => { setShowTips(false); router.push('/login/phone'); }}
                style={styles.sheetBtn}
              >
                <Text style={styles.sheetBtnTxt}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex:1, padding:16, justifyContent:'flex-end' },
  topRow:{ position:'absolute', right:16, top:16 },
  help:{ color:'#fff', fontWeight:'800', opacity:0.9, textShadowColor:'rgba(0,0,0,0.35)', textShadowRadius:4 },
  bigBtn:{ height:52, borderRadius:16, marginHorizontal:8, marginBottom:12, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:10, shadowColor:'#000', shadowOpacity:0.25, shadowRadius:8, elevation:3 },
  bigTxt:{ color:'#fff', fontWeight:'900', fontSize:16 },
  apple:{ backgroundColor:'#000' },
  google:{ backgroundColor:'#fff' },
  iconRow:{ flexDirection:'row', justifyContent:'center', gap:24, marginTop:4 },
  roundBtn:{ width:56, height:56, borderRadius:28, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.15, shadowRadius:6, elevation:2 },

  legalText:{ color:'#fff', opacity:0.9, textAlign:'center', fontWeight:'700', textShadowColor:'rgba(0,0,0,0.35)', textShadowRadius:6 },
  link:{ textDecorationLine:'underline' },

  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center', justifyContent:'center' },
  sheet:{ width:'86%', backgroundColor:'#fff', borderRadius:16, padding:16, alignItems:'center', gap:10 },
  tipsTitle:{ fontWeight:'900', fontSize:18 },
  tipsBody:{ textAlign:'center', opacity:0.7, marginBottom:6, fontWeight:'700' },
  sheetBtn:{ backgroundColor: PALETTE.primary, borderRadius:12, paddingVertical:10, paddingHorizontal:18, alignItems:'center', justifyContent:'center' },
  sheetBtnTxt:{ color:'#fff', fontWeight:'900' },
});
