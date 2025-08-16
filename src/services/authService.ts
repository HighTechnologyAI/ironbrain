// Authentication service with proper session handling
// Consolidates auth logic and prevents common session issues

import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

export class AuthService {
  private static instance: AuthService;
  private session: Session | null = null;
  private user: User | null = null;
  private listeners: Set<(session: Session | null) => void> = new Set();

  private constructor() {
    this.initializeAuth();
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private async initializeAuth() {
    // Set up auth state listener FIRST
    supabase.auth.onAuthStateChange((event, session) => {
      this.session = session;
      this.user = session?.user ?? null;
      
      // Notify all listeners
      this.listeners.forEach(listener => listener(session));
    });

    // THEN check for existing session
    const { data: { session } } = await supabase.auth.getSession();
    this.session = session;
    this.user = session?.user ?? null;
  }

  // Subscribe to auth state changes
  onAuthStateChange(callback: (session: Session | null) => void) {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => this.listeners.delete(callback);
  }

  // Sign up with proper redirect URL
  async signUp(email: string, password: string, additionalData?: any) {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: additionalData
      }
    });

    return { data, error };
  }

  // Sign in
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    return { data, error };
  }

  // Sign out
  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  // Get current session
  getSession(): Session | null {
    return this.session;
  }

  // Get current user
  getUser(): User | null {
    return this.user;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.session && !!this.user;
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();