import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Text, StyleSheet } from 'react-native';

export default function DuologoTextSimple({
  size = 180,
  primary = '#e21b73',
  accent = '#147aff',
  label = 'DKSA Voice Chat',
}: { size?: number; primary?: string; accent?: string; label?: string }) {
  const spin = useRef(new Animated.Value(0)).current;
  const wobble = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 5600, easing: Easing.inOut(Easing.cubic), useNativeDriver: true })).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(wobble, { toValue: 0, duration: 900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ]),
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1100, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    ).start();
  }, [spin, wobble, pulse]);

  const spinDeg = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const wobbleDeg = wobble.interpolate({ inputRange: [0, 1], outputRange: ['-6deg', '6deg'] });
  const pulseScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.12] });
  const outer = size;
  const ring = Math.max(8, Math.round(size * 0.12));
  const core = Math.round(size * 0.52);

  return (
    <View style={{ width: outer, height: outer + 36, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.halo,
          {
            width: outer * 1.35,
            height: outer * 1.35,
            borderRadius: (outer * 1.35) / 2,
            backgroundColor: primary,
            transform: [{ scale: pulseScale }],
            opacity: 0.12,
            position: 'absolute',
          },
        ]}
      />

      <Animated.View style={{ width: outer, height: outer, transform: [{ rotate: spinDeg }], position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: outer,
          height: outer,
          borderRadius: outer / 2,
          borderWidth: ring,
          borderColor: 'rgba(0,0,0,0.06)',
          opacity: 0.08,
        }} />

        <Animated.View style={{ position: 'absolute', width: outer, height: outer, transform: [{ rotate: wobbleDeg }] }}>
          <View style={{
            position: 'absolute',
            left: -outer * 0.24,
            top: 0,
            width: outer * 1.18,
            height: outer,
            borderRadius: outer / 2,
            backgroundColor: primary,
            opacity: 0.95,
            transform: [{ skewX: '-9deg' } as any],
          }} />
        </Animated.View>

        <View style={{ position: 'absolute', width: outer, height: outer, transform: [{ rotate: '44deg' }] }}>
          <View style={{
            position: 'absolute',
            left: -outer * 0.22,
            top: 0,
            width: outer * 1.05,
            height: outer,
            borderRadius: outer / 2,
            backgroundColor: accent,
            opacity: 0.9,
            transform: [{ skewX: '-6deg' } as any],
          }} />
        </View>
      </Animated.View>

      <View style={{ width: core, height: core, borderRadius: core / 2, overflow: 'hidden', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ width: core * 2, height: core, transform: [{ translateX: wobble.interpolate({ inputRange: [0,1], outputRange: [-core * 0.12, core * 0.12] }) }] }}>
          <View style={{ width: core, height: core, borderRadius: core / 2, backgroundColor: primary }} />
          <View style={{ width: core, height: core, borderRadius: core / 2, backgroundColor: accent }} />
        </Animated.View>
        <View style={{ position: 'absolute', width: core * 0.54, height: core * 0.54, borderRadius: (core * 0.54) / 2, backgroundColor: '#fff' }} />
      </View>

      <View style={{ marginTop: 10 }}>
        <Text style={{ fontSize: 16, fontWeight: '800', color: primary }}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  halo: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 34,
    elevation: 12,
  },
});
