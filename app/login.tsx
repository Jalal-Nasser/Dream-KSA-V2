import React, { useEffect, useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { getSupabase } from '../lib/supabase';

// local assets
const BG_LOCAL = require('../assets/images/login-bg.jpg');
const LOGO = require('../assets/images/logo.png');
const GOOGLE_ICON = require('../assets/icons/google.png');

export default function Login() {
  const router = useRouter();
  const supabase = getSupabase();
  
  /* ===== phone OTP state ===== */
  const [cc, setCc] = useState('+966');        // default KSA; user can edit
  const [phone, setPhone] = useState('');      // local number without leading 0
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  
  /* ===== existing email/password state ===== */
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted && data.session) {
        router.replace('/(tabs)/rooms');
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) router.replace('/(tabs)/rooms');
    });
    return () => { sub.subscription.unsubscribe(); mounted = false; };
  }, [router]);

  const e164 = React.useMemo(() => {
    const raw = (phone || '').replace(/\D/g, '');
    const code = (cc || '').replace(/\s+/g, '');
    return `${code}${raw}`;
  }, [cc, phone]);

  const sendOtp = async () => {
    setErr(null);
    if (!/^\+\d{1,4}$/.test(cc.trim())) return setErr('رمز الدولة غير صحيح');
    if (!/^\d{6,15}$/.test(phone.replace(/\D/g,''))) return setErr('رقم الهاتف غير صحيح');
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setSending(false);
    if (error) return setErr(error.message);
    setOtpSent(true);
  };

  const verifyOtp = async () => {
    setErr(null);
    if (!/^\d{4,8}$/.test(code.trim())) return setErr('رمز التحقق غير صحيح');
    setVerifying(true);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: e164,
      token: code.trim(),
      type: 'sms',
    });
    setVerifying(false);
    if (error) return setErr(error.message);
    if (data?.user) router.replace('/(tabs)/rooms');
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: 'dream-ksa://auth-callback' }
    });
    if (error) console.log('[auth/google]', error);
  };

  const handleEmailPassword = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error?.message?.includes('Invalid login')) {
      const { error: signUpErr } = await supabase.auth.signUp({ email, password });
      if (signUpErr) return console.log('[signup]', signUpErr);
    } else if (error) {
      console.log('[login/password]', error);
    }
  };

  return (
    <ImageBackground source={BG_LOCAL} style={styles.bg} resizeMode="cover">
      <LinearGradient
        colors={['rgba(234,88,206,0.30)', 'rgba(123,82,255,0.22)', 'rgba(20,150,255,0.18)']}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.dim} />

      <View style={styles.topRow}>
        <Text style={styles.topLink}>Can't login?</Text>
      </View>

      {/* logo pushed upward (near top) */}
      <View style={styles.center}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
      </View>

      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>انضم إلى مجتمع Dream KSA</Text>
          <Text style={styles.cardSub}>اختر طريقة تسجيل الدخول المفضلة</Text>

          <TouchableOpacity activeOpacity={0.9} style={styles.btnWhite} onPress={handleGoogle}>
            <Image source={GOOGLE_ICON} style={styles.googleIcon} />
            <Text style={styles.btnWhiteText}>متابعة بـ Google</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} style={styles.btnFB} onPress={() => { console.log('[login] Facebook pressed -> /(tabs)'); router.replace('/(tabs)'); }}>
            <View style={styles.iconLeft}><Ionicons name="logo-facebook" size={18} color="#fff" /></View>
            <Text style={styles.btnFBText}>متابعة بـ Facebook</Text>
          </TouchableOpacity>

          {/* PHONE LOGIN BLOCK (inline) */}
          <View style={styles.phoneRow}>
            <View style={styles.ccBox}>
              <TextInput
                value={cc}
                onChangeText={setCc}
                placeholder="+966"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                style={styles.ccInput}
                textAlign="center"
              />
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="5xxxxxxxx"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              style={styles.phoneInput}
              textAlign="right"
            />
          </View>

          <TouchableOpacity activeOpacity={0.9} onPress={sendOtp} disabled={sending} style={styles.phoneBtn}>
            {sending ? <ActivityIndicator color="#fff" /> : (
              <View style={{ flexDirection:'row-reverse', alignItems:'center', gap:8 }}>
                <MaterialCommunityIcons name="cellphone" size={18} color="#fff" />
                <Text style={styles.phoneBtnTxt}>متابعة برقم الهاتف</Text>
              </View>
            )}
          </TouchableOpacity>

          {err ? <Text style={styles.err}>{err}</Text> : null}

          {/* divider and email/password box */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>أو باستخدام البريد/كلمة المرور</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.emailRow}>
            <TextInput
              style={styles.emailInput}
              placeholder="you@example.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.emailRow, { marginTop: 8 }]}>
            <TextInput
              style={styles.emailInput}
              placeholder="••••••••"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>
          <TouchableOpacity activeOpacity={0.9} style={[styles.btnFB, { marginTop: 10, backgroundColor: '#111827' }]} onPress={handleEmailPassword}>
            <View style={styles.iconLeft}><Ionicons name="mail" size={18} color="#fff" /></View>
            <Text style={styles.btnFBText}>تسجيل الدخول</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.terms}>باستمرارك، أنت توافق على الشروط وسياسة الخصوصية</Text>

      {/* OTP MODAL */}
      <Modal visible={otpSent} transparent animationType="fade" onRequestClose={()=>setOtpSent(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>أدخل رمز التحقق</Text>
            <Text style={styles.sheetSub}>{e164}</Text>
            <TextInput
              value={code}
              onChangeText={setCode}
              placeholder="●●●●●●"
              placeholderTextColor="#9CA3AF"
              keyboardType="number-pad"
              style={styles.otpInput}
              textAlign="center"
              maxLength={6}
            />
            {err ? <Text style={[styles.err,{textAlign:'center'}]}>{err}</Text> : null}
            <View style={{ flexDirection:'row', gap:10 }}>
              <TouchableOpacity activeOpacity={0.9} onPress={()=>setOtpSent(false)} style={[styles.sheetBtn,{ backgroundColor:'#e5e7eb'}]}>
                <Text style={[styles.sheetBtnTxt,{ color:'#111827'}]}>رجوع</Text>
              </TouchableOpacity>
              <TouchableOpacity activeOpacity={0.9} onPress={verifyOtp} disabled={verifying} style={styles.sheetBtn}>
                {verifying ? <ActivityIndicator color="#fff" /> : <Text style={styles.sheetBtnTxt}>تأكيد</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'space-between', backgroundColor: '#000' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.06)' },

  topRow: { paddingTop: 44, paddingHorizontal: 18, alignItems: 'flex-end' },
  topLink: { color: 'rgba(255,255,255,0.95)', fontWeight: '700' },

  // pushed up by using a negative marginTop so logo sits higher on the screen
  center: { alignItems: 'center', marginTop: -92 },
  logo: { width: 140, height: 140, borderRadius: 18, backgroundColor: 'transparent' },
  subtitle: { color: 'rgba(255,255,255,0.95)', marginTop: 12, fontWeight: '600' },

  cardWrap: { alignItems: 'center', paddingHorizontal: 20 },
  card: {
    width: '94%',
    backgroundColor: 'rgba(255,255,255,0.80)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8
  },
  cardTitle: { fontWeight: '800', fontSize: 16, color: '#111827', marginBottom: 6 },
  cardSub: { color: '#6B7280', marginBottom: 12 },

  btnWhite: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E9',
    marginBottom: 10
  },
  btnWhiteText: { color: '#111', fontWeight: '800', fontSize: 15 },
  googleIcon: { width: 20, height: 20, position: 'absolute', left: 12 },

  btnFB: {
    width: '100%',
    backgroundColor: '#1877F2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnFBText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  iconLeft: { position: 'absolute', left: 12 },

  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 10, marginBottom: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#E6E6E9' },
  dividerText: { color: '#6B7280', marginHorizontal: 8, fontSize: 12, fontWeight: '700' },

  /* ===== phone OTP styles ===== */
  phoneRow: { 
    width: '100%', 
    flexDirection: 'row-reverse', 
    gap: 8, 
    marginTop: 10,
    marginBottom: 10
  },
  ccBox: { 
    width: 78, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 12, 
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E9'
  },
  ccInput: { 
    paddingVertical: 10, 
    fontWeight: '800', 
    color: '#111827',
    textAlign: 'center'
  },
  phoneInput: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    fontWeight: '700', 
    color: '#111827',
    textAlign: 'right',
    borderWidth: 1,
    borderColor: '#E6E6E9'
  },
  phoneBtn: { 
    width: '100%',
    backgroundColor: '#111827', 
    borderRadius: 12, 
    paddingVertical: 12, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 10
  },
  phoneBtnTxt: { 
    color: '#fff', 
    fontWeight: '900',
    fontSize: 15
  },
  err: { 
    marginTop: 8, 
    color: '#dc2626', 
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center'
  },

  /* ===== email/password styles (renamed from phoneRow) ===== */
  emailRow: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E9',
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  emailInput: { 
    flex: 1, 
    textAlign: 'right', 
    direction: 'ltr', 
    fontSize: 15, 
    color: '#111827' 
  },

  /* ===== OTP modal styles ===== */
  sheetBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.4)', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  sheet: { 
    width: '86%', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 16, 
    gap: 10, 
    alignItems: 'center' 
  },
  sheetTitle: { 
    fontWeight: '900', 
    fontSize: 18, 
    color: '#111827' 
  },
  sheetSub: { 
    opacity: 0.7, 
    fontWeight: '700',
    color: '#6B7280'
  },
  otpInput: { 
    backgroundColor: '#F3F4F6', 
    borderRadius: 12, 
    paddingHorizontal: 12, 
    paddingVertical: 10, 
    width: '60%', 
    fontWeight: '900', 
    letterSpacing: 4,
    fontSize: 18,
    color: '#111827'
  },
  sheetBtn: { 
    backgroundColor: '#111827', 
    borderRadius: 12, 
    paddingVertical: 10, 
    paddingHorizontal: 18, 
    alignItems: 'center', 
    justifyContent: 'center',
    minWidth: 80
  },
  sheetBtnTxt: { 
    color: '#fff', 
    fontWeight: '900',
    fontSize: 15
  },

  terms: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: 14, fontSize: 12 }
});
