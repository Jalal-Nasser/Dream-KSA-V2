import React from 'react';
import { Stack, Redirect } from 'expo-router';

/**
 * Temporary root layout for debugging: redirect to /login so the login screen is visible.
 * Replace this with your original layout when ready.
 */
export default function RootLayout() {
  // Immediate redirect to the login route
  return <Redirect href="/login" />;
}

