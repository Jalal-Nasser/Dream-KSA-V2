import { supabase } from '@/lib/supabase';

export async function listFeatured(limit: number = 10) {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, name, featured, created_at, agency_id')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data || [];
}

