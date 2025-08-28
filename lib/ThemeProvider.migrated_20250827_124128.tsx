import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Appearance } from 'react-native';

type Theme = 'light' | 'dark';

type ThemeContextValue = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  brandColor?: string | null;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  brandColor: undefined,
});

export function ThemeProvider({ children, brandColor }: { children: React.ReactNode; brandColor?: string | null; }) {
  const [theme, setTheme] = useState<Theme>((Appearance.getColorScheme() ?? 'light') as Theme);
  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => setTheme((colorScheme ?? 'light') as Theme));
    return () => sub.remove();
  }, []);
  const value = useMemo(() => ({ theme, setTheme, brandColor }), [theme, brandColor]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() { return useContext(ThemeContext); }
export function themed<T>(lightValue: T, darkValue: T, t: Theme) { return t === 'dark' ? darkValue : lightValue; }

// For backward compatibility
export function useSetPrimary() {
  const { setTheme } = useContext(ThemeContext);
  return (color: string) => setTheme('light'); // Placeholder implementation
}
