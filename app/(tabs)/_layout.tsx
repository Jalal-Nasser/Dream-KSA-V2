import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';

function MyTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <SafeAreaView style={styles.wrap}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          // HIDE the index route from the bar
          if (route.name === 'index') return null;

          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const labelMap: Record<string, string> = { me: 'أنا', messages: 'الرسائل', moments: 'لحظات', explore: 'اكتشاف', rooms: 'الغرف' };
          const iconMap: Record<string, string> = {
            me: 'account-circle',
            messages: 'message-text',
            moments: 'flash',
            explore: 'compass',
            rooms: 'account-voice',
          };
          const label = labelMap[route.name] ?? route.name;
          const iconName = iconMap[route.name] ?? 'circle-outline';

          return (
            <TouchableOpacity key={route.key} accessibilityRole="button" onPress={onPress} style={styles.item}>
              <MaterialCommunityIcons name={iconName as any} size={24} />
              <Text style={[styles.txt, isFocused && styles.txtActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="me"
      screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
      tabBar={(props) => <MyTabBar {...props} />}
    >
      {/* Keep index screen routable but hidden from the tab bar */}
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="me" options={{ title: 'أنا' }} />
      <Tabs.Screen name="messages" options={{ title: 'الرسائل' }} />
      <Tabs.Screen name="moments" options={{ title: 'لحظات' }} />
      <Tabs.Screen name="explore" options={{ title: 'اكتشاف' }} />
      <Tabs.Screen name="rooms" options={{ title: 'الغرف' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { backgroundColor: 'white' },
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 8, paddingBottom: 10 },
  item: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 4 },
  txt: { fontSize: 11, opacity: 0.6 },
  txtActive: { opacity: 1, fontWeight: '700' },
});
