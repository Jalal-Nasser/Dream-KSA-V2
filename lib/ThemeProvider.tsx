import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';

export type ThemeMode = 'system' | 'light' | 'dark';

export type AppTheme = {
  mode: ThemeMode;
  scheme: 'light' | 'dark';
  colors: {
    background: string;
    text: string;
    textSecondary: string;
    card: string;
    border: string;
    primary: string;
    tabInactive: string;
    tabBackground: string;
  };
};

const LightColors = {
  background: '#ffffff',
  text: '#111827',
  textSecondary: '#6b7280',
  card: '#ffffff',
  border: '#e5e7eb',
  primary: '#8b5cf6',
  tabInactive: '#94a3b8',
  tabBackground: '#ffffff',
};

const DarkColors = {
  background: '#0b1220',
  text: '#f3f4f6',
  textSecondary: '#9ca3af',
  card: '#111827',
  border: '#1f2937',
  primary: '#8b5cf6',
  tabInactive: '#9ca3af',
  tabBackground: '#0b1220',
};

type ThemeContextType = {
  theme: AppTheme;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, []);

  const scheme: 'light' | 'dark' = useMemo(() => {
    if (mode === 'light') return 'light';
    if (mode === 'dark') return 'dark';
    return (systemScheme ?? 'light') === 'dark' ? 'dark' : 'light';
  }, [mode, systemScheme]);

  const theme: AppTheme = useMemo(
    () => ({
      mode,
      scheme,
      colors: scheme === 'dark' ? DarkColors : LightColors,
    }),
    [mode, scheme]
  );

  return (
    <ThemeContext.Provider value={{ theme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}


