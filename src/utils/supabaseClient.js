// src/utils/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Automatically refresh tokens before they expire
    autoRefreshToken: true,
    // Persist session in localStorage (uses cookies internally)
    persistSession: true,
    // Detect OAuth redirects
    detectSessionInUrl: true,
    // Use localStorage for session storage (more persistent than sessionStorage)
    storage: window.localStorage,
    // Store session with a specific key prefix
    storageKey: 'student-social-auth',
    // Flow type for authentication
    flowType: 'pkce'
  },
  // Global settings for database queries
  db: {
    schema: 'public'
  },
  // Enable realtime features if needed
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});