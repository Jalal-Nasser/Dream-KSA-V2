// app/agency-create.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Alert, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { supabase } from '../lib/supabase';

export default function AgencyCreateScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [busy, setBusy] = useState(false);

  async function onCreate() {
    if (!name.trim()) {
      Alert.alert('Name required');
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.rpc('create_agency', {
        p_name: name.trim(),
        p_description: desc.trim() || null,
        p_metadata: { source: 'mobile' },
      });
      if (error) {
        Alert.alert('فشل في الإنشاء', error.message);
      } else {
        Alert.alert('تم الإنشاء!', `تم إنشاء الوكالة بنجاح`, [
          { text: 'حسناً', onPress: () => router.back() }
        ]);
        setName('');
        setDesc('');
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-right" size={24} color="#800F2F" />
        </TouchableOpacity>
        <Text style={styles.title}>إنشاء وكالة جديدة</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>اسم الوكالة *</Text>
          <TextInput
            placeholder="أدخل اسم الوكالة"
            value={name}
            onChangeText={setName}
            style={styles.input}
            textAlign="right"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>الوصف (اختياري)</Text>
          <TextInput
            placeholder="أدخل وصف الوكالة"
            value={desc}
            onChangeText={setDesc}
            multiline
            style={[styles.input, styles.textArea]}
            textAlign="right"
          />
        </View>

        <TouchableOpacity 
          onPress={onCreate} 
          disabled={busy}
          style={[styles.createButton, busy && styles.createButtonDisabled]}
        >
          <Text style={styles.createButtonText}>
            {busy ? 'جاري الإنشاء...' : 'إنشاء الوكالة'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  form: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'right',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#800F2F',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  createButtonDisabled: {
    backgroundColor: '#CCC',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
