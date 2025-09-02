import React, { useEffect, useMemo, useRef, useState } from 'react';
import { I18nManager, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { getSupabase } from '@/lib/supabase';
import { resolveAvatarUrl } from '@/lib/storage';
import { pickAvatar } from '@/lib/profileImageUtils';

const ACCENT = '#800F2F';
const CARD = '#FBE7EF'; // soft cherry blossom surface
const BORDER = '#F2CAD6';

export default function ProfileScreen() {
  const router = useRouter();
  const { selectedCountry } = useLocalSearchParams<{ selectedCountry?: string }>();
  const supabase = getSupabase();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [title, setTitle] = useState('');
  const [signature, setSignature] = useState('');
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  // Track if avatar has changed in this session (prevents wiping on save)
  const avatarDirtyRef = useRef(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(currentUser);
      if (!currentUser) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, gender, birthday, country, title, signature, avatar_path')
        .eq('id', currentUser.id)
        .single();
      if (!mounted) return;
      if (!error && data) {
        setProfile(data);
        setDisplayName(data.display_name ?? '');
        setGender((data.gender as any) ?? '');
        setBirthday(data.birthday ?? '');
        setCountry(data.country ?? '');
        setTitle(data.title ?? '');
        setSignature(data.signature ?? '');
        setAvatarPath(data.avatar_path ?? null);
        // Fresh load → not dirty
        avatarDirtyRef.current = false;
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  // When we come back from the country picker, update the field
  useEffect(() => {
    if (typeof selectedCountry === 'string' && selectedCountry.length > 0) {
      setCountry(selectedCountry);
    }
  }, [selectedCountry]);

  const avatarUrl = useMemo(
    () => resolveAvatarUrl(supabase as any, avatarPath ?? undefined),
    [supabase, avatarPath]
  );

  const onPickAvatar = async () => {
    const result = await pickAvatar();
    if (result?.canceled) return;
    const asset = result.assets?.[0];
    if (!asset) return;
    
    // Upload to Supabase Storage using FormData (more reliable for Expo)
    try {
      const ext = (asset.fileName?.split('.').pop() ?? 'jpg').toLowerCase();
      const path = `u/${user?.id}/${Date.now()}.${ext}`;
      
      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: `avatar.${ext}`,
      } as any);
      
      const { error: upErr } = await supabase
        .storage
        .from('avatars')
        .upload(path, formData, { 
          upsert: true, 
          contentType: asset.mimeType ?? 'image/jpeg' 
        });
        
      if (upErr) {
        console.warn('[avatar] upload error', upErr);
        Alert.alert('فشل الرفع', 'تعذر رفع الصورة. حاول مرة أخرى.');
        return;
      }
      
      setAvatarPath(path);
      avatarDirtyRef.current = true;
    } catch (e) {
      console.warn('[avatar] upload exception', e);
      Alert.alert('فشل الرفع', 'حدث خطأ أثناء رفع الصورة.');
    }
  };

  const onSave = async () => {
    // Minimal update payload — DO NOT nullify avatar_path unless truly changed
    const payload: any = {
      display_name: displayName?.trim(),
      gender: gender || null,
      birthday: birthday || null,
      country: country || null,
      title: title?.trim() || null,
      signature: signature?.trim() || null,
    };
    // Only include avatar_path when the avatar actually changed this session
    if (avatarDirtyRef.current) {
      payload.avatar_path = avatarPath;
    }

    if (__DEV__) console.log('[profile save] payload →', payload);
    const { error } = await supabase.from('profiles').update(payload).eq('id', user?.id);
    if (!error) {
      avatarDirtyRef.current = false; // reset after successful save
      router.back();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.h1}>معلومات شخصية</Text>

      {/* Avatar Card */}
      <View style={styles.card}>
        <Pressable onPress={onPickAvatar} style={styles.avatarWrap}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarGlyph}>👤</Text>
            </View>
          )}
        </Pressable>
        <Text style={styles.link}>تغيير الصورة</Text>
      </View>

      {/* Form Card */}
      <View style={styles.card}>
        {/* Name */}
        <View style={styles.field}>
          <Text style={styles.label}>اسم</Text>
          <TextInput
            style={styles.input}
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="اسم العرض"
            placeholderTextColor="#987"
            textAlign="right"
          />
        </View>

        {/* Gender */}
        <View style={styles.field}>
          <Text style={styles.label}>جنس</Text>
          <View style={styles.segmentRow}>
            <Pressable
              onPress={() => setGender('male')}
              style={[styles.segment, gender === 'male' && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, gender === 'male' && styles.segmentTextActive]}>
                ذكر
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setGender('female')}
              style={[styles.segment, gender === 'female' && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, gender === 'female' && styles.segmentTextActive]}>
                أنثى
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setGender('other')}
              style={[styles.segment, gender === 'other' && styles.segmentActive]}
            >
              <Text style={[styles.segmentText, gender === 'other' && styles.segmentTextActive]}>
                أخرى
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Birthday */}
        <View style={styles.field}>
          <Text style={styles.label}>عيد الميلاد</Text>
          <TextInput
            style={styles.input}
            value={birthday}
            onChangeText={setBirthday}
            placeholder="1995-01-01"
            placeholderTextColor="#987"
            textAlign="right"
          />
        </View>

        {/* Country (navigates to picker) */}
        <View style={styles.field}>
          <Text style={styles.label}>البلد / المنطقة</Text>
          <Pressable
            onPress={() => router.push({ 
              pathname: '/select-country', 
              params: { 
                current: country || '',
                returnTo: '/(tabs)/me/profile'
              } 
            })}
            style={[styles.input, { justifyContent: 'center' }]}
          >
            <Text style={{ textAlign: 'right', color: country ? '#3b1b26' : '#987' }}>
              {country || 'اختر الدولة'}
            </Text>
          </Pressable>
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>لقب</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Mr"
            placeholderTextColor="#987"
            textAlign="right"
          />
        </View>

        {/* Signature */}
        <View style={styles.field}>
          <Text style={styles.label}>توقيع</Text>
          <TextInput
            style={[styles.input, { height: 48 }]}
            value={signature}
            onChangeText={setSignature}
            placeholder="Jalal"
            placeholderTextColor="#987"
            textAlign="right"
          />
        </View>

        <Pressable onPress={onSave} style={styles.saveBtn}>
          <Text style={styles.saveText}>حفظ</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFF',
    // RTL-first layout
    writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr',
  },
  h1: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    color: ACCENT,
    textAlign: 'right',
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: ACCENT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarWrap: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: ACCENT,
    backgroundColor: '#fff',
  },
  avatar: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  avatarPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  avatarGlyph: {
    fontSize: 42,
    color: ACCENT,
  },
  link: {
    color: ACCENT,
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '600',
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: ACCENT,
    fontSize: 13,
    marginBottom: 6,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
    color: '#3b1b26',
    textAlign: 'right',
  },
  segmentRow: {
    // RTL: right-to-left order for chips
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  segment: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 999,
    backgroundColor: '#fff',
  },
  segmentActive: {
    backgroundColor: ACCENT,
    borderColor: ACCENT,
  },
  segmentText: {
    color: ACCENT,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#fff',
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    borderRadius: 16,
  },
  saveText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: 16,
  },
});