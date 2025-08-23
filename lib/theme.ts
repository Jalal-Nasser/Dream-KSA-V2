export type AppTheme = {
  colors: {
    bg: string; 
    surface: string; 
    surfaceBorder: string; 
    text: string; 
    subtext: string;
    primary: string; 
    success: string; 
    warning: string; 
    danger: string; 
    tabActive: string; 
    tabInactive: string;
  };
  radius: number;
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number };
  shadow: { card: any };
  fonts: { title: { fontSize: number; fontWeight: any }; body: { fontSize: number }; small: { fontSize: number } };
};

export const BaseTheme: AppTheme = {
  colors: {
    bg: '#0E131A',
    surface: '#121926',
    surfaceBorder: 'rgba(255,255,255,0.06)',
    text: '#FFFFFF',
    subtext: '#9BA7B4',
    primary: '#6C5CE7',
    success: '#16a34a',
    warning: '#f59e0b',
    danger: '#ef4444',
    tabActive: '#6C5CE7',
    tabInactive: '#9BA7B4',
  },
  radius: 16,
  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },
  shadow: { card: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 } },
  fonts: { title: { fontSize: 20, fontWeight: '800' }, body: { fontSize: 16 }, small: { fontSize: 12 } },
};

export const BrandGradient = ['#8B5CF6', '#6C5CE7'];
export const TabColors = { active: BaseTheme.colors.tabActive, inactive: BaseTheme.colors.tabInactive };


