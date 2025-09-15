import { getSupabase } from './supabase';

interface Profile {
  id: string;
  display_name?: string;
  username?: string;
  avatar_url?: string;
}

// In-memory cache for profiles
const profileCache = new Map<string, Profile>();

/**
 * Prime the profile cache with user data
 * @param userIds - Array of user IDs to fetch
 */
export async function primeProfiles(userIds: string[]): Promise<void> {
  if (userIds.length === 0) return;
  
  // Filter out already cached profiles and invalid IDs
  const uncachedIds = userIds.filter(id => 
    id && 
    id !== 'null' && 
    id !== 'undefined' && 
    id.length > 0 && 
    !profileCache.has(id)
  );
  
  if (uncachedIds.length === 0) return;
  
  console.log('[profileCache] Fetching profiles for:', uncachedIds);
  
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url')
      .in('id', uncachedIds);
    
    if (error) {
      console.warn('[profileCache] Failed to fetch profiles:', error);
      return;
    }
    
    console.log('[profileCache] Fetched profiles:', data);
    
    // Cache the profiles
    data?.forEach(profile => {
      if (profile.id) {
        profileCache.set(profile.id, profile);
      }
    });
  } catch (error) {
    console.warn('[profileCache] Error fetching profiles:', error);
  }
}

/**
 * Get the best available name for a user
 * @param userId - The user ID
 * @returns The best available name (display_name || username || userId.slice(0,6))
 */
export function getName(userId: string): string {
  if (!userId || userId === 'null' || userId === 'undefined' || userId.length === 0) {
    return 'مستخدم';
  }
  
  const profile = profileCache.get(userId);
  if (!profile) {
    // Return first 6 characters of userId as fallback
    console.log('[profileCache] No profile found for userId:', userId, 'returning fallback');
    return userId.slice(0, 6);
  }
  
  const name = profile.display_name || profile.username || userId.slice(0, 6);
  console.log('[profileCache] Found name for userId:', userId, '->', name);
  return name;
}

/**
 * Get the avatar URL for a user
 * @param userId - The user ID
 * @returns The avatar URL or null
 */
export function getAvatar(userId: string): string | null {
  if (!userId) return null;
  
  const profile = profileCache.get(userId);
  return profile?.avatar_url || null;
}

/**
 * Clear the profile cache (useful for testing or memory management)
 */
export function clearProfileCache(): void {
  profileCache.clear();
}

/**
 * Get a cached profile by ID
 * @param userId - The user ID
 * @returns The cached profile or null
 */
export function getCachedProfile(userId: string): Profile | null {
  return profileCache.get(userId) || null;
}
