import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from './LoginScreen';
import RoomsScreen from './RoomsScreen';
import VoiceChatScreen from './VoiceChatScreen';
import AdminControlsScreen from './AdminControlsScreen';

// Bottom tabs for main UI
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Room':
              iconName = 'home-outline';
              break;
            case 'Discover':
              iconName = 'search-outline';
              break;
            case 'Chat':
              iconName = 'chatbubbles-outline';
              break;
            default:
              iconName = 'ellipse-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Room" component={RoomsScreen} />
      <Tab.Screen name="Discover" component={VoiceChatScreen} />
      <Tab.Screen name="Chat" component={AdminControlsScreen} />
    </Tab.Navigator>
  );
}

// Stack for authentication and main app
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="RoomsScreen" component={RoomsScreen} />
        <Stack.Screen name="VoiceChatScreen" component={VoiceChatScreen} />
        <Stack.Screen name="AdminControlsScreen" component={AdminControlsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
