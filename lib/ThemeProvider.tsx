import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { BaseTheme, type AppTheme } from './theme';

export type ThemeMode = 'system' | 'light' | 'dark';

type ThemeCtx = {
  theme: AppTheme;
  setPrimary: (hex: string) => void;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
};

const Ctx = createContext<ThemeCtx>({
  theme: BaseTheme,
  setPrimary: () => {},
  mode: 'system',
  setMode: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [primary, setPrimary] = useState(BaseTheme.colors.primary);
  const [mode, setMode] = useState<ThemeMode>('system');
  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(Appearance.getColorScheme());

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setSystemScheme(colorScheme));
    return () => sub.remove();
  }, []);

  const theme = useMemo(() => {
    const isDark =
      mode === 'dark' || (mode === 'system' && (systemScheme === 'dark' || !systemScheme));
    // You can fork colors here for light mode if needed
    const base = { ...BaseTheme };
    base.colors = {
      ...base.colors,
      primary,
      tabActive: primary,
      // optional overrides for dark/light can go here
    };
    return base;
  }, [primary, mode, systemScheme]);

  return (
    <Ctx.Provider value={{ theme, setPrimary, mode, setMode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useTheme() {
  return useContext(Ctx).theme;
}
export function useSetPrimary() {
  return useContext(Ctx).setPrimary;
}
export function useThemeMode() {
  const { mode, setMode } = useContext(Ctx);
  return { mode, setMode };
}


