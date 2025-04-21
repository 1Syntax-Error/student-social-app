// src/utils/supabaseClient.js
// This is a mock implementation since we're not doing backend coding

export const supabase = {
    // Mock methods that return promises with mock data
    from: (table) => ({
      select: () => ({
        eq: () => ({ 
          single: () => Promise.resolve({ data: null }),
          limit: () => Promise.resolve({ data: [] })
        }),
        order: () => ({
          limit: () => Promise.resolve({ data: [] })
        }),
        limit: () => Promise.resolve({ data: [] })
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null })
    }),
    auth: {
      signIn: () => Promise.resolve({ user: null, error: null }),
      signUp: () => Promise.resolve({ user: null, error: null }),
      signOut: () => Promise.resolve()
    }
  };