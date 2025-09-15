export const DEMO_MODE =
  String(process.env.EXPO_PUBLIC_DEMO_MODE || '').trim() === '1' ||
  String(process.env.EXPO_PUBLIC_DEMO_MODE || '').toLowerCase() === 'true';


