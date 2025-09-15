import { getSupabase } from './supabase';

export async function getAccess(): Promise<{ token: string; userId: string }> {
  const supabase = getSupabase();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('auth/missing');
  }
  
  return { 
    token: session.access_token, 
    userId: session.user.id 
  };
}
