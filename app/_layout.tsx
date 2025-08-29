import React from 'react';
import LoginScreen from './login';

/**
 * Temporary root layout: render the login UI directly to avoid router redirect loops
 * and maximum-update-depth errors while we restore the UI.
 */
export default function RootLayout() {
  return <LoginScreen />;
}

