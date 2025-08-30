import React from 'react';

// Minimal Binmo theme shim used temporarily to satisfy imports in app/.
// Exports a named theme object and a default (null) component so expo-router
// won't treat this file as a broken route.
//
// Later: we should move full theme into src/theme.ts (outside app/) to avoid
// expo-router route scanning for non-route modules.

export const binmoTheme = {
  colors: {
    primary: '#00C853',
    accent: '#FF6B6B',
    background: '#F6F8FB',
    card: '#FFFFFF',
    text: '#1e293b',
    subtle: '#9aa6b2',
  },
  spacing: { xs: 6, sm: 8, md: 12, lg: 18 },
  radii: { sm: 8, md: 12, lg: 16 },
};

export default function BinmoThemeShim(): JSX.Element | null {
  // renders nothing; exists so expo-router sees a default export
  return null;
}
