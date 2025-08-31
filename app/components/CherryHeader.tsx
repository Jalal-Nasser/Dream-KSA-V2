import * as React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { PALETTE } from '../../lib/theme';

export default function CherryHeader({ title }: { title: string }) {
  const router = useRouter();
  return (
    <SafeAreaView style={{ backgroundColor: PALETTE.soft1 }}>
      <View style={styles.wrap}>
        <Pressable onPress={() => router.back()} style={styles.btn}>
          <Ionicons name="chevron-forward" size={22} color={PALETTE.primaryDark} />
        </Pressable>
        <Text style={styles.title}>{title}</Text>
        <View style={{ width: 32 }} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 8, backgroundColor: PALETTE.soft1, borderBottomWidth: 0.5, borderBottomColor: PALETTE.soft2 },
  btn: { padding: 6 },
  title: { fontSize: 18, fontWeight: '900', color: PALETTE.primaryDark },
});
