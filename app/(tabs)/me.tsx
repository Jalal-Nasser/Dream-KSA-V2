import React from 'react';
/**
 * Lightweight wrapper route for the profile tab.
 * It re-uses the existing ProfilePage component from app/components.
 * Path: app/(tabs)/me.tsx -> route /(tabs)/me
 */
import ProfilePage from '../components/ProfilePage';

export default function Me() {
  return <ProfilePage />;
}
