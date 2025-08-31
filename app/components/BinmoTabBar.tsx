import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ICONS: Record<string, { icon: React.ComponentProps<typeof Ionicons>['name'] | string; lib: 'ion' | 'mci'; activeColor: string; inactiveColor: string; label: string }> = {
  index:     { icon: 'home',         lib: 'ion', activeColor: '#00C853', inactiveColor: '#A1A1AA', label: 'استكشف' },
  live:      { icon: 'radio',        lib: 'mci', activeColor: '#FF3D71', inactiveColor: '#A1A1AA', label: 'مباشر' },
  agencies:  { icon: 'account-group',lib: 'mci', activeColor: '#7B61FF', inactiveColor: '#A1A1AA', label: 'وكالات' },
  me:        { icon: 'person',       lib: 'ion', activeColor: '#FFB020', inactiveColor: '#A1A1AA', label: 'أنا' },
};

export default function BinmoTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const isRTL = I18nManager.isRTL;

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { paddingBottom: insets.bottom + 6 }]}>
      <View style={styles.bar}>
        <View style={[styles.row, isRTL && { flexDirection: 'row-reverse' }]}>
          {state.routes.map((route, idx) => {
            const focused = state.index === idx;
            const conf = ICONS[route.name] || ICONS.index;
            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
            };
            const onLongPress = () => navigation.emit({ type: 'tabLongPress', target: route.key });

            const color = focused ? conf.activeColor : conf.inactiveColor;
            const label = descriptors[route.key]?.options?.title ?? conf.label;

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.item}
                activeOpacity={0.9}
              >
                <View style={styles.iconWrap}>
                  {conf.lib === 'ion' ? (
                    <Ionicons name={conf.icon as any} size={22} color={color} />
                  ) : (
                    <MaterialCommunityIcons name={conf.icon as any} size={24} color={color} />
                  )}
                </View>
                <Text style={[styles.label, { color }]} numberOfLines={1}>{label}</Text>
                {focused && <View style={[styles.pill, { backgroundColor: conf.activeColor }]} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    alignItems: 'center',
  },
  bar: {
    width: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  iconWrap: {
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  pill: {
    position: 'absolute',
    height: 3.5,
    width: 24,
    borderRadius: 2,
    bottom: 2,
  },
});
