import { Appearance } from 'react-native';
export type ThemeMode = 'light' | 'dark';

export const palette = {
  brand: '#0ea5e9',
  bgLight: '#ffffff',
  bgDark:  '#0b1220',
  textLight: '#0b1220',
  textDark:  '#f8fafc',
  borderLight: '#e5e7eb',
  borderDark:  '#1f2937',
};

export const theme = {
  light: { background: palette.bgLight, text: palette.textLight, border: palette.borderLight, brand: palette.brand },
  dark:  { background: palette.bgDark,  text: palette.textDark,  border: palette.borderDark,  brand: palette.brand },
};

export const colors = palette;
export function getSystemTheme(): ThemeMode { return (Appearance.getColorScheme() ?? 'light') as ThemeMode; }
export { useTheme, themed } from '@/lib/ThemeProvider';

// Brand color for UI elements
export const Brand = palette.brand;

// Brand gradient for headers and UI elements
export const BrandGradient = {
  colors: ['#0ea5e9', '#3b82f6', '#8b5cf6'],
  locations: [0, 0.5, 1],
};

export default theme;
