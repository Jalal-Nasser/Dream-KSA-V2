import React from 'react';
import HomePage from '@/app/HomePage';
import { USE_FIGMA_SCREENS } from '@/lib/featureFlags';
import FigmaRNHome from '@/components/figma-rn/Home';
import { Platform } from 'react-native';

export default function HomeScreen() {
  if (USE_FIGMA_SCREENS && Platform.OS !== 'web') {
    return <FigmaRNHome onRoomJoin={() => {}} onProfileOpen={() => {}} />;
  }
  return <HomePage />;
}


