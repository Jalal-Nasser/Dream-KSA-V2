import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function RootLayout() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, _s) => {});
    return () => sub.subscription.unsubscribe();
  }, []);
  return <Slot />;
}

