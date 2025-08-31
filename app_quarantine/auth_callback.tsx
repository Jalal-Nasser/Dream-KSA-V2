// app/auth/callback.tsx
// Some flows still hit /auth/callback. Just forward to the same handler.
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function AuthCallback() {
  useEffect(() => {
    router.replace('/auth/redirect');
  }, []);
  return null;
}
