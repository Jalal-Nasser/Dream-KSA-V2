import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, TouchableOpacity, SafeAreaView, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { PALETTE } from '../../lib/theme';

function MyTabBar({ state, descriptors, navigation }: any) {
  // Filter out nested route names that include "/"
  const topLevelRoutes = state.routes.filter((r: any) => !r.name.includes('/'));
  
  return (
    <SafeAreaView style={{ backgroundColor: '#fff' }}>
      <View style={styles.bar}>
        {topLevelRoutes.map((route: any, index: any) => {
          if (route.name === 'index') return null;
          const isFocused = state.index === index;
          const onPress = () => {
            const event = navigation.emit({ type:'tabPress', target: route.key, canPreventDefault:true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          const labelMap = { me:'أنا', messages:'الرسائل', moments:'لحظات', explore:'اكتشاف', rooms:'الغرف' };
          const iconMap  = { me:'account-circle', messages:'message-text', moments:'flash', explore:'compass', rooms:'account-voice' };
          const label = (labelMap as any)[route.name] ?? route.name;
          const iconName = (iconMap as any)[route.name] ?? 'circle-outline';
          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={styles.item}>
              <MaterialCommunityIcons name={iconName} size={22} color={PALETTE.primaryDark} />
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
    <Tabs initialRouteName="me" screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }} tabBar={(props) => <MyTabBar {...props} />}>
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
  bar: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: 0.5, borderTopColor: PALETTE.soft2, backgroundColor:'#fff' },
  item: { flex:1, alignItems:'center', gap: 4, paddingVertical: 4 },
  txt: { fontSize: 11, opacity: 0.65, fontWeight:'700' },
  txtActive: { opacity: 1, color: PALETTE.primaryDark },
});
