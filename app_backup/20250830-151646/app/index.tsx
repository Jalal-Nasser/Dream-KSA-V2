import React from 'react';
import LoginScreen from './login';

// Render the login screen directly from the app root to avoid navigation-before-mount races.
export default function Index() {
  return <LoginScreen />;
}
