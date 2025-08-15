import { supabase } from './supabase';

type TokenCallback = (token: string | null) => void;

class SessionStore {
  private accessToken: string | null = null;
  private listeners: Set<TokenCallback> = new Set();
  private isInitialized = false;

  /**
   * Get the current access token
   * @returns The current access token or null if not authenticated
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Subscribe to token changes
   * @param callback Function to call when token changes
   * @returns Unsubscribe function
   */
  subscribeToToken(callback: TokenCallback): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current token
    callback(this.accessToken);
    
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Update the access token and notify all listeners
   * @param token New access token or null to clear
   */
  private updateToken(token: string | null) {
    this.accessToken = token;
    this.listeners.forEach(callback => callback(token));
  }

  /**
   * Initialize auth listeners for token management
   * This should be called once at app startup
   */
  initAuthListeners(): void {
    if (this.isInitialized) {
      console.log('Auth listeners already initialized');
      return;
    }

    console.log('Initializing auth listeners...');

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.access_token) {
            console.log('JWT ready');
            this.updateToken(session.access_token);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing token');
          this.updateToken(null);
        }
      }
    );

    // Check for existing session
    this.checkExistingSession();
    
    this.isInitialized = true;
  }

  /**
   * Check if there's an existing session and update token
   */
  private async checkExistingSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting existing session:', error.message);
        return;
      }

      if (session?.access_token) {
        console.log('Found existing session, JWT ready');
        this.updateToken(session.access_token);
      } else {
        console.log('No existing session found');
      }
    } catch (error) {
      console.error('Error checking existing session:', error);
    }
  }

  /**
   * Clear the current session (useful for logout)
   */
  clearSession(): void {
    this.updateToken(null);
  }
}

// Export singleton instance
export const sessionStore = new SessionStore();

// Export convenience functions
export const getAccessToken = () => sessionStore.getAccessToken();
export const subscribeToToken = (callback: TokenCallback) => sessionStore.subscribeToToken(callback);
export const initAuthListeners = () => sessionStore.initAuthListeners();
export const clearSession = () => sessionStore.clearSession();

export const getSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error getting session:', error);
      return null;
    }
    return session;
  } catch (error) {
    console.error('Exception getting session:', error);
    return null;
  }
};
