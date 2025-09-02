import * as React from 'react';
import { View, Text, TextInput, I18nManager, Pressable, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons as MCI } from '@expo/vector-icons';

import { fetchMyProfile, upsertMyProfile, publicAvatarUrl, uploadAvatar, loadMyProfile, type Profile } from '@/lib/profile';
import { prepareAvatarUri } from '@/lib/image';
import { getSupabase } from '@/lib/supabase';
import { uploadAvatar as uploadToStorage, resolveAvatarUrl, ALLOWED_TYPES, MAX_BYTES } from '@/lib/storage';
import { pickAndUploadAvatar, alertUploadError } from '@/lib/profileImageUtils';

I18nManager.allowRTL(true);

const cherry = '#800F2F';
const soft = '#FFF0F3';

function RIcon({ name, size=20, color=cherry }) {
  return <MCI name={name as any} size={size} color={color} style={{ marginLeft: 8, marginRight: 0 }} />;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [previewAvatar, setPreviewAvatar] = React.useState<string | null>(null);
  const [p, setP] = React.useState<Partial<Profile>>({});

  React.useEffect(() => {
    (async () => {
      const { user, profile } = await fetchMyProfile();
      if (!user) { router.replace('/login'); return; }
      const pic = publicAvatarUrl(profile?.avatar_url ?? null);
      setAvatar(pic ?? null);
      setP({
        id: user.id,
        username: profile?.username ?? '',
        gender: (profile?.gender as any) ?? null,
        birthday: profile?.birthday ?? null,
        country: profile?.country ?? '',
        title: profile?.title ?? '',
        signature: profile?.signature ?? '',
      });
      setLoading(false);
    })();
  }, []);

  const onPickAvatar = React.useCallback(async () => {
    try {
      const userId = p.id;
      const res = await pickAndUploadAvatar(userId);
      if ((res as any).cancelled) return;
      // util already saved to DB; just update UI
      setAvatar(res.publicUrl);
      setP(s => ({ ...s, avatar_url: res.publicUrl }));
    } catch (e) {
      alertUploadError(e);
    }
  }, [p.id]);

  const save = React.useCallback(async () => {
    setSaving(true);
    try {
      const payload = {
        username: p.username ?? null,
        gender: (p.gender as any) ?? null,
        birthday: p.birthday ?? null,
        country: p.country ?? null,
        title: p.title ?? null,
        signature: p.signature ?? null,
        avatar_url: p.avatar_url ?? null,
      };
      console.log('[profile save] payload →', payload);
      const saved = await upsertMyProfile(payload);
      // Update UI with what the server actually stored
      if (saved) {
        setP(saved);
        // Update avatar display if avatar_url changed
        if (saved.avatar_url) {
          const pub = publicAvatarUrl(saved.avatar_url);
          setAvatar(pub);
        }
      } else {
        const fresh = await loadMyProfile();
        if (fresh) setP(fresh);
      }
      router.replace({ pathname: '/(tabs)/me', params: { refresh: String(Date.now()) } });
    } catch (e) {
      console.warn('[profile save]', (e as any)?.message);
    } finally {
      setSaving(false);
    }
  }, [p]);

  if (loading) return <View style={{ flex:1, backgroundColor:'#fff' }} />;

  return (
    <View style={{ flex:1, backgroundColor:'#fff' }}>
      {/* Header */}
      <View style={{ paddingTop: 16, paddingBottom: 8, alignItems: 'center' }}>
        <Text style={{ fontWeight:'800', fontSize:22, color:'#222' }}>معلومات شخصية</Text>
      </View>

      {/* Avatar */}
      <View style={{ alignItems:'center', paddingVertical: 12 }}>
        <Pressable onPress={onPickAvatar} accessibilityLabel="Change Avatar" style={{ width:110, height:110, borderRadius:55, backgroundColor:soft, alignItems:'center', justifyContent:'center', overflow:'hidden', borderWidth:1, borderColor:'#eee' }}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={{ width:'100%', height:'100%' }} />
          ) : (
            <RIcon name="account-circle-outline" size={64} />
          )}
        </Pressable>
        <Text style={{ marginTop:8, color:cherry, fontWeight:'600' }}>تغيير الصورة</Text>
      </View>

      {/* Fields */}
      <View style={{ paddingHorizontal: 14, gap: 8 }}>
        <Row label="اسم" icon="account-outline">
          <Input value={p.username ?? ''} onChangeText={(t)=>setP(s=>({...s, username:t}))} placeholder="اسمك" />
        </Row>

        <Row label="جنس" icon="gender-male-female">
          <Segment value={p.gender ?? null} onChange={(g)=>setP(s=>({...s, gender:g as any}))} />
        </Row>

        <Row label="عيد الميلاد" icon="calendar-month-outline">
          <Birthday value={p.birthday} onChange={(iso)=>setP(s=>({...s, birthday: iso }))} />
        </Row>

        <Row label="البلد / المنطقة" icon="earth">
          <Input value={p.country ?? ''} onChangeText={(t)=>setP(s=>({...s, country:t}))} placeholder="Saudi Arabia" />
        </Row>

        <Row label="لقب" icon="badge-account-outline">
          <Input value={p.title ?? ''} onChangeText={(t)=>setP(s=>({...s, title:t}))} placeholder="لقبك" />
        </Row>

        <Row label="توقيع" icon="card-text-outline">
          <Input value={p.signature ?? ''} onChangeText={(t)=>setP(s=>({...s, signature:t}))} placeholder="اكتب عبارة قصيرة..." multiline />
        </Row>
      </View>

      {/* Save */}
      <View style={{ padding:16 }}>
        <Pressable onPress={save} disabled={saving} style={{ backgroundColor: cherry, paddingVertical:14, borderRadius:14, alignItems:'center' }}>
          <Text style={{ color:'#fff', fontWeight:'700', fontSize:16 }}>{saving ? 'جارٍ الحفظ…' : 'حفظ'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function Row({ label, icon, children }: { label:string; icon:string; children:React.ReactNode }) {
  return (
    <View style={{ backgroundColor:'#fff', borderRadius:12, borderWidth:1, borderColor:'#eee', paddingHorizontal:14, paddingVertical:10, flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between', gap:10 }}>
      <View style={{ flexDirection:'row-reverse', alignItems:'center' }}>
        <RIcon name={icon} />
        <Text style={{ fontWeight:'600', color:'#111' }}>{label}</Text>
      </View>
      <View style={{ flex:1, alignItems:'flex-start' }}>{children}</View>
    </View>
  );
}

function Input(props: any) {
  return (
    <TextInput
      {...props}
      style={[{ width:'100%', textAlign:'right', paddingVertical:6, color:'#111' }, props.multiline && { minHeight:64 }]}
      placeholderTextColor="#bbb"
    />
  );
}

function Segment({ value, onChange }: { value: any; onChange: (v:string|null)=>void }) {
  const opt = [
    { k: 'male', label:'ذكر' },
    { k: 'female', label:'أنثى' },
    { k: 'other', label:'أخرى' },
  ];
  return (
    <View style={{ flexDirection:'row-reverse', gap:8 }}>
      {opt.map(o => (
        <Pressable key={o.k} onPress={()=>onChange(o.k)} style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:999, borderWidth:1, borderColor:value===o.k?cherry:'#eee', backgroundColor:value===o.k?soft:'#fff' }}>
          <Text style={{ color:value===o.k?cherry:'#333', fontWeight:'600' }}>{o.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Birthday({ value, onChange }: { value: string | null; onChange: (iso:string|null)=>void }) {
  const [show, setShow] = React.useState(false);
  const date = value ? new Date(value) : new Date(1995, 0, 1);
  return (
    <View style={{ flexDirection:'row-reverse', alignItems:'center', gap:8 }}>
      <Pressable onPress={()=>setShow(true)} style={{ paddingHorizontal:12, paddingVertical:8, borderRadius:10, borderWidth:1, borderColor:'#eee' }}>
        <Text style={{ color:'#333' }}>{value ? value : 'اختر التاريخ'}</Text>
      </Pressable>
      {show && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, d) => {
            setShow(false);
            if (d) onChange(d.toISOString().slice(0,10));
          }}
        />
      )}
    </View>
  );
}
