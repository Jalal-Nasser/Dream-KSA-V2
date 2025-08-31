import React from 'react';

/**
 * Theme constants (kept for imports across app/)
 * Also include a tiny default React export so expo-router does not treat this module as a broken route.
 */

export const colors = {
  brand: '#00C853',
  text: '#111827',
  textMuted: '#6B7280',
  bg: '#F5F7FB',
  card: '#FFFFFF',
  border: '#ECEFF3',
  blue: '#1976D2',
  danger: '#FF4D4F',
};

// Default export is a harmless React component (returns null). This prevents expo-router from
// complaining "missing default export" for files under the app/ directory.
export default function _ThemePlaceholder(): JSX.Element | null {
  return null;
}
