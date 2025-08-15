import { supabase } from './supabase';

export async function isAgencyOwner(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('agencies')
      .select('id')
      .eq('owner_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error checking agency ownership:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Exception checking agency ownership:', error);
    return false;
  }
}

export async function isHost(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('hosts')
      .select('agency_id')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error checking host status:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Exception checking host status:', error);
    return false;
  }
}
