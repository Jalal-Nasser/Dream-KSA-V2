// app/_layout.tsx

import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,       // hide the header on all screens
        gestureEnabled: true,     // allow swipe gestures on iOS
        animation: 'fade',        // screen transition animation
      }}
    />
  );
}
