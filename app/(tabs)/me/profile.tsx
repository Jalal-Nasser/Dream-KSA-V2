import React, { useEffect, useMemo, useRef, useState } from 'react';
import { I18nManager, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { getSupabase } from '@/lib/supabase';
import { resolveAvatarUrl } from '@/lib/storage';
import { pickAvatar } from '@/lib/profileImageUtils';
import { decode } from 'base64-arraybuffer';

const ACCENT = '#800F2F';
const CARD = '#FBE7EF'; // soft cherry blossom surface
const BORDER = '#F2CAD6';

export default function ProfileScreen() {
  const router = useRouter();
  const supabase = getSupabase();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [displayName, setDisplayName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');
  const [birthday, setBirthday] = useState('');
  const [country, setCountry] = useState('');
  const [title, setTitle] = useState('');
  const [signature, setSignature] = useState('');
  const [avatarPath, setAvatarPath] = useState<string | null>(null); // storage path only
  // Track if avatar has changed in this session (for re-render only; not sent to DB)
  const avatarDirtyRef = useRef(false);
  // Snapshot of the loaded profile to compute diffs (avoid overwriting with nulls)
  const initialRef = useRef<{
    display_name?: string | null;
    gender?: 'male' | 'female' | 'other' | '' | null;
    birthday?: string | null;
    country?: string | null;
    title?: string | null;
    signature?: string | null;
  }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(currentUser);
      if (!currentUser) return;
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, gender, birthday, country, title, signature')
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
        // We no longer rely on a DB column for avatar; use stable storage path:
        setAvatarPath(`u/${currentUser.id}/avatar`);
         // Fresh load → not dirty
         avatarDirtyRef.current = false;
         // Save initial snapshot for diffing
         initialRef.current = {
           display_name: data.display_name ?? '',
           gender: (data.gender as any) ?? '',
           birthday: data.birthday ?? '',
           country: data.country ?? '',
           title: data.title ?? '',
           signature: data.signature ?? '',
         };
      } else if (!error && !data) {
        // No row yet → initialize avatar path only
        setAvatarPath(`u/${currentUser.id}/avatar`);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);



  const avatarUrl = useMemo(
    () => resolveAvatarUrl(supabase as any, avatarPath ?? undefined),
    [supabase, avatarPath]
  );

  const onPickAvatar = async () => {
    const result = await pickAvatar();
    if (result?.canceled) return;
    const asset = result.assets?.[0];
    if (!asset || !asset.base64) {
      Alert.alert('خطأ', 'تعذر الحصول على بيانات الصورة.');
      return;
    }
    // Upload to Supabase Storage using base64-arraybuffer (most reliable on Expo)
    try {
      const path = `u/${user?.id}/avatar`; // stable key → no DB column needed
      const contentType = asset.mimeType ?? 'image/jpeg';
      const arrayBuffer = decode(asset.base64);

      const { error: upErr } = await supabase
        .storage
        .from('avatars')
        .upload(path, arrayBuffer, { upsert: true, contentType });

      if (upErr) {
        console.warn('[avatar] upload error', upErr);
        Alert.alert('فشل الرفع', 'تعذر رفع الصورة. حاول مرة أخرى.');
        return;
      }
      // Manually trigger a re-render by setting a new path object
      setAvatarPath(`${path}?t=${new Date().getTime()}`);
      avatarDirtyRef.current = true;
    } catch (e) {
      console.warn('[avatar] base64/upload exception', e);
      Alert.alert('فشل الرفع', 'حدث خطأ أثناء رفع الصورة.');
    }
  };

  const onSave = async () => {
    if (!user?.id) {
      Alert.alert('لم يتم تسجيل الدخول', 'رجاءً سجّل الدخول أولاً.');
      return;
    }
    setSaving(true);
    // Prepare draft with trimmed values
    const draft = {
      display_name: (displayName ?? '').trim(),
      gender: (gender ?? '') || null,
      birthday: (birthday ?? '') || null,
      country: (country ?? '') || null,
      title: (title ?? '').trim() || null,
      signature: (signature ?? '').trim() || null,
    } as Record<string, string | null>;

    // Build a minimal PATCH: only include keys that truly changed.
    // Also: do NOT wipe a previously non-empty value to empty/null unless the user explicitly cleared it.
    const original = initialRef.current;
    const payload: Record<string, any> = {};
    (Object.keys(draft) as (keyof typeof draft)[]).forEach((k) => {
      const nextVal = draft[k];
      const prevVal = (original as any)[k] ?? '';
      const normalizedNext = nextVal === '' ? '' : nextVal; // keep '' for comparison
      const normalizedPrev = prevVal === null ? '' : prevVal;
      if (normalizedNext !== normalizedPrev) {
        // If user left field empty but there was a previous value, skip to avoid accidental erase
        if ((normalizedNext === '' || normalizedNext === null) && normalizedPrev !== '') {
          return; // skip wiping
        }
        // Convert '' to null when storing
        payload[k as string] = normalizedNext === '' ? null : normalizedNext;
      }
    });
    // ⛔️ Do NOT send any avatar column to DB (table doesn’t have one).

    if (Object.keys(payload).length === 0) {
      // No changes → still navigate to Me screen as requested
      setSaving(false);
      try {
        router.replace('/(tabs)/me');
      } catch {
        router.back();
      }
      return;
    }

    if (__DEV__) console.log('[profile save] payload →', payload);
    // Use UPSERT so a missing profile row is created.
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, ...payload }, { onConflict: 'id' })
      .select('display_name, gender, birthday, country, title, signature')
      .single();

    if (error) {
      console.warn('[profile save] error', error);
      setSaving(false);
      Alert.alert('فشل الحفظ', error.message || 'تعذر حفظ التغييرات.');
      return;
    }

    // Success: update state + initial snapshot; reset dirty avatar flag
    setDisplayName(data.display_name ?? '');
    setGender((data.gender as any) ?? '');
    setBirthday(data.birthday ?? '');
    setCountry(data.country ?? '');
    setTitle(data.title ?? '');
    setSignature(data.signature ?? '');
    // Keep stable storage path
    setAvatarPath(`u/${user.id}/avatar`);
    initialRef.current = {
      display_name: data.display_name ?? '',
      gender: (data.gender as any) ?? '',
      birthday: data.birthday ?? '',
      country: data.country ?? '',
      title: data.title ?? '',
      signature: data.signature ?? '',
    };
    avatarDirtyRef.current = false;
    setSaving(false);
    // Navigate to Me screen after successful save
    try {
      router.replace('/(tabs)/me');
    } catch {
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
            onPress={() => router.push({ pathname: '/select-country', params: { current: country || '' } })}
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

        <Pressable onPress={saving ? undefined : onSave} style={[styles.saveBtn, saving && { opacity: 0.6 }]}>
          {saving ? (
            <ActivityIndicator />
          ) : (
            <Text style={styles.saveText}>حفظ</Text>
          )}
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