import React from 'react';
import { SafeAreaView, Text } from 'react-native';
import { colors } from '../_binmo-theme';
export default function Live() {
  return <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: colors.text, fontWeight: '800' }}>البث المباشر</Text>
  </SafeAreaView>;
}

