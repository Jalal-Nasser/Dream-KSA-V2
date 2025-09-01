import * as React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { getSupabase } from '../lib/supabase';
import { PALETTE } from '../lib/theme';

// couples background (soft blur) – replace with your local asset if you prefer
const BG_URI = 'https://images.unsplash.com/photo-1519098901900-5f2f24c3f61b?q=80&w=1200&auto=format&fit=crop';

export default function Login() {
  const supabase = getSupabase();
  const [showTips, setShowTips] = React.useState(false);

  React.useEffect(() => {
    const sub = supabase.auth.onAuthStateChange((_e, s) => { if (s?.user) router.replace('/(tabs)/rooms'); });
    return () => sub.data.subscription.unsubscribe();
  }, []);

  const signInOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider === 'apple' && Platform.OS !== 'ios') return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: 'dream-ksa://auth-callback' }
    });
    if (error) console.log('[oauth]', provider, error.message);
  };

  return (
    <View style={{ flex:1 }}>
      <ImageBackground
        source={{ uri: BG_URI }}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity:0.96 }}
        resizeMode="cover"
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor:'rgba(0,0,0,0.25)'}]} />
      </ImageBackground>

      <View style={styles.topRow}>
        <Pressable onPress={() => router.push('/login/help')}>
          <Text style={styles.help}>Can't login?</Text>
        </Pressable>
      </View>

      <View style={styles.bottomWrap}>
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

        <View style={styles.iconRow}>
          <Pressable style={styles.roundBtn} onPress={() => signInOAuth('facebook')}>
            <Ionicons name="logo-facebook" size={22} color="#1877F2" />
          </Pressable>
          <Pressable style={styles.roundBtn} onPress={() => setShowTips(true)}>
            <MaterialCommunityIcons name="cellphone" size={22} color={PALETTE.primaryDark} />
          </Pressable>
        </View>

        <Pressable onPress={() => router.push('/legal/terms')}>
          <Text style={styles.legal}>
            By continuing you agree to DreamKSA's <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy</Text>
          </Text>
        </Pressable>
      </View>

      {/* Tips → Confirm → Phone */}
      <Modal visible={showTips} transparent animationType="fade" onRequestClose={()=>setShowTips(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Tips</Text>
            <Text style={styles.sheetBody}>By continuing, you agree to DreamKSA Terms of Service and Privacy Policy.</Text>
            <View style={{ flexDirection:'row', gap:12 }}>
              <Pressable onPress={()=>setShowTips(false)} style={[styles.sheetBtn,{ backgroundColor:'#e5e7eb'}]}>
                <Text style={[styles.sheetBtnTxt,{ color:'#111827'}]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={()=>{ setShowTips(false); router.push('/login/phone'); }} style={styles.sheetBtn}>
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
  topRow:{ position:'absolute', right:16, top:14 },
  help:{ color:'#fff', fontWeight:'800', opacity:0.95, textShadowColor:'rgba(0,0,0,0.45)', textShadowRadius:10 },
  bottomWrap:{ position:'absolute', left:16, right:16, bottom:24, alignItems:'center' },
  bigBtn:{ height:54, borderRadius:16, width:'100%', marginBottom:12, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:10, shadowColor:'#000', shadowOpacity:0.3, shadowRadius:10, elevation:4 },
  bigTxt:{ color:'#fff', fontWeight:'900', fontSize:16 },
  apple:{ backgroundColor:'#000' },
  google:{ backgroundColor:'#fff' },
  iconRow:{ flexDirection:'row', justifyContent:'center', gap:24, marginTop:6, marginBottom:10 },
  roundBtn:{ width:56, height:56, borderRadius:28, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8, elevation:3 },
  legal:{ color:'#fff', opacity:0.95, textAlign:'center', fontWeight:'700', textShadowColor:'rgba(0,0,0,0.45)', textShadowRadius:10 },
  link:{ textDecorationLine:'underline' },
  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center', justifyContent:'center' },
  sheet:{ width:'86%', backgroundColor:'#fff', borderRadius:16, padding:16, alignItems:'center', gap:10 },
  sheetTitle:{ fontWeight:'900', fontSize:18 },
  sheetBody:{ textAlign:'center', opacity:0.7, marginBottom:6, fontWeight:'700' },
  sheetBtn:{ backgroundColor: PALETTE.primary, borderRadius:12, paddingVertical:10, paddingHorizontal:18, alignItems:'center', justifyContent:'center' },
  sheetBtnTxt:{ color:'#fff', fontWeight:'900' },
});
