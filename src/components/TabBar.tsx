import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/lib/ThemeProvider';
import { Home, Mic, Compass, Users, User } from 'lucide-react-native';

const ICONS: Record<string, any> = { home: Home, explore: Compass, rooms: Mic, agency: Users, profile: User };

export default function TabBar({ state, descriptors, navigation }: any) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingBottom: Math.max(insets.bottom, 8), paddingTop: 8, paddingHorizontal: 12, backgroundColor: 'transparent' }}>
      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderRadius: 24, padding: 8 }}>
        {state.routes.map((route: any, idx: number) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const isFocused = state.index === idx;
          const Icon = ICONS[route.name] || Home;
          return (
            <Pressable
              key={route.key}
              onPress={() => { const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true }); if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name); }}
              style={{ flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 16, backgroundColor: isFocused ? 'rgba(108,92,231,0.16)' : 'transparent' }}
            >
              <Icon size={20} color={isFocused ? t.colors.tabActive : t.colors.tabInactive} />
              <Text style={{ color: isFocused ? t.colors.tabActive : t.colors.tabInactive, fontSize: 12, marginTop: 4 }} numberOfLines={1}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
