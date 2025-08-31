import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {/* Keep only the index screen declared to avoid noise while we stabilize */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          // Keep the default tab bar for now; we'll replace with a custom Binmo-style bar later.
          tabBarShowLabel: false,
        }}
      />
    </Tabs>
  );
}
