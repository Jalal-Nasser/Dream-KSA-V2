import { supabase } from './supabase';
import { getAccessToken } from './session';

/**
 * Call a Supabase Edge Function with automatic JWT authentication
 * @param functionName Name of the Edge Function to invoke
 * @param body Request body to send to the function
 * @returns Promise with the function response
 * @throws Error if user is not authenticated
 */
export async function invokeEdge<T = any>(
  functionName: string, 
  body?: any
): Promise<T> {
  const accessToken = getAccessToken();
  
  if (!accessToken) {
    throw new Error('User not authenticated. Please log in to continue.');
  }

  try {
    const { data, error } = await supabase.functions.invoke(functionName, {
      body,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }

    return data as T;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to invoke Edge Function: ${String(error)}`);
  }
}

/**
 * Convenience function for calling Edge Functions that don't require a body
 * @param functionName Name of the Edge Function to invoke
 * @returns Promise with the function response
 */
export async function invokeEdgeNoBody<T = any>(functionName: string): Promise<T> {
  return invokeEdge<T>(functionName);
}
