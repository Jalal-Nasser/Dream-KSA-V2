import * as React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal, ImageBackground, Image } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { getSupabase } from '../lib/supabase';
import { PALETTE } from '../lib/theme';
import { redirectNative, logRedirects } from '../lib/linking';
import { SUPABASE_URL } from '../lib/env';
import { openAndExchange } from '../lib/auth/oauthHelper';

// couples background (soft blur) – local asset
const BG_URI = require('../assets/images/login-bg.jpg');

export default function Login() {
  const supabase = getSupabase();
  const [showTips, setShowTips] = React.useState(false);

  React.useEffect(() => { 
    logRedirects?.('[oauth]');
    const sub = supabase.auth.onAuthStateChange((_e,s)=>{ if(s?.user) router.replace('/(tabs)/rooms');}); 
    return ()=>sub.data.subscription.unsubscribe(); 
  }, []);

  const signInOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider === 'apple' && Platform.OS !== 'ios') return;

    console.log('[oauth] start', provider, 'returnUrl(native):', redirectNative);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectNative,        // ← dream-ksa://auth-callback
        skipBrowserRedirect: true,
        scopes: provider === 'google' ? 'email profile' : undefined,
        queryParams: provider === 'google' ? {
          'web-client-id': '85207766867-6rgu5nl7rfd3bshqun4k042o0blgbsff.apps.googleusercontent.com'
        } : undefined,
      },
    });
    if (error) { console.warn('[oauth] signInWithOAuth error:', error.message); return; }

    let authUrl = data?.url || '';
    if (!authUrl || !authUrl.includes('redirect_to=')) {
      const params: Record<string, string> = { 
        provider, 
        redirect_to: redirectNative,
        ...(provider === 'google' ? { 
          scopes: 'email profile',
          'web-client-id': '85207766867-6rgu5nl7rfd3bshqun4k042o0blgbsff.apps.googleusercontent.com'
        } : {})
      };
      const qs = new URLSearchParams(params).toString();
      authUrl = `${SUPABASE_URL}/auth/v1/authorize?${qs}`;
      console.warn('[oauth] manual authorize url:', authUrl.slice(0, 180), '…');
    } else {
      console.log('[oauth] provider url:', authUrl.slice(0, 180), '…');
    }

    const how = await openAndExchange(authUrl);
    console.log('[oauth] flow via:', how);
  };

  return (
    <View style={{ flex:1 }}>
                    <ImageBackground
                source={BG_URI}
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

      {/* center brand with logo and slug */}
      <View style={styles.brandSection}>
        <ImageBackground
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.slug}>الدردشة الصوتية</Text>
      </View>

      <View style={styles.bottomWrap}>
        {Platform.OS === 'ios' && (
          <Pressable style={[styles.bigBtn, styles.apple]} onPress={() => signInOAuth('apple')}>
            <Ionicons name="logo-apple" size={20} color="#fff" />
            <Text style={styles.bigTxt}>Apple ID</Text>
          </Pressable>
        )}
        <Pressable style={[styles.bigBtn, styles.google]} onPress={() => signInOAuth('google')}>
          <Image
            source={require('../assets/images/google.png')}
            style={styles.googleIcon}
            resizeMode="contain"
          />
          <Text style={[styles.bigTxt, { color:'#111827' }]}>Google</Text>
        </Pressable>

        <View style={styles.iconRow}>
                            <Pressable style={styles.roundBtn} onPress={() => signInOAuth('facebook')}>
                    <Image
                      source={require('../assets/images/facebook.png')}
                      style={styles.facebookIcon}
                      resizeMode="contain"
                    />
                  </Pressable>
                  <Pressable style={styles.roundBtn} onPress={() => setShowTips(true)}>
                    <MaterialCommunityIcons name="cellphone" size={28} color={PALETTE.primaryDark} />
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
  brandSection:{ position:'absolute', left:16, right:16, top:80, alignItems:'center' },
  logo:{ width:120, height:120, marginBottom:16 },
  slug:{ color:'#fff', fontSize:18, fontWeight:'800', textAlign:'center', opacity:0.95, textShadowColor:'rgba(0,0,0,0.6)', textShadowRadius:8 },
  bottomWrap:{ position:'absolute', left:16, right:16, bottom:24, alignItems:'center' },
  bigBtn:{ height:54, borderRadius:16, width:'100%', marginBottom:12, alignItems:'center', justifyContent:'center', flexDirection:'row', gap:10, shadowColor:'#000', shadowOpacity:0.3, shadowRadius:10, elevation:4 },
  bigTxt:{ color:'#fff', fontWeight:'900', fontSize:16 },
  apple:{ backgroundColor:'#000' },
  google:{ backgroundColor:'#fff' },
  iconRow:{ flexDirection:'row', justifyContent:'center', gap:24, marginTop:6, marginBottom:10 },
  roundBtn:{ width:48, height:48, borderRadius:24, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.2, shadowRadius:8, elevation:3 },
  facebookIcon:{ width:32, height:32 },
  googleIcon:{ width:20, height:20 },
  legal:{ color:'#fff', opacity:0.95, textAlign:'center', fontWeight:'700', textShadowColor:'rgba(0,0,0,0.45)', textShadowRadius:10 },
  link:{ textDecorationLine:'underline' },
  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.5)', alignItems:'center', justifyContent:'center' },
  sheet:{ width:'86%', backgroundColor:'#fff', borderRadius:16, padding:16, alignItems:'center', gap:10 },
  sheetTitle:{ fontWeight:'900', fontSize:18 },
  sheetBody:{ textAlign:'center', opacity:0.7, marginBottom:6, fontWeight:'700' },
  sheetBtn:{ backgroundColor: PALETTE.primary, borderRadius:12, paddingVertical:10, paddingHorizontal:18, alignItems:'center', justifyContent:'center' },
  sheetBtnTxt:{ color:'#fff', fontWeight:'900' },
});
