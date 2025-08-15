import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        headerStyle: {
          backgroundColor: '#1F2937',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'الملف الشخصي',
          headerShown: true 
        }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ 
          title: 'الإعدادات',
          headerShown: true,
          headerBackTitle: 'رجوع'
        }} 
      />
    </Stack>
  );
}

