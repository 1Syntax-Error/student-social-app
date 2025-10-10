import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { profileService } from '../services/profileService';
import { supabase } from '../utils/supabaseClient';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);

      if (session?.user) {
        // Set basic user info immediately
        setUser({
          id: session.user.id,
          email: session.user.email
        });

        // Try to load profile, but don't block on it
        loadUserProfile(session.user.id).catch(err => {
          console.error('Failed to load profile, continuing anyway:', err);
          // Set user without profile if it fails
          setUser({
            id: session.user.id,
            email: session.user.email
          });
        });
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  async function checkUser() {
    try {
      console.log('Checking for existing session...');
      const session = await authService.getSession();
      if (session?.user) {
        console.log('Found existing session for user:', session.user.id);
        setUser({
          id: session.user.id,
          email: session.user.email
        });
        loadUserProfile(session.user.id).catch(err => {
          console.error('Failed to load profile on mount, continuing anyway:', err);
        });
      } else {
        console.log('No existing session found');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserProfile(userId) {
    try {
      const profileData = await profileService.getProfile(userId);
      setProfile(profileData);
      // Combine auth user with profile for backward compatibility
      setUser({
        id: userId,
        ...profileData
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('Attempting sign in...');
      const { user: authUser } = await authService.signIn(email, password);
      console.log('Sign in successful, user:', authUser?.id);
      // User state will be set by onAuthStateChange listener
      return { success: true };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  };

  const signUp = async (email, password, userData = {}) => {
    try {
      const { user: authUser } = await authService.signUp(email, password, userData);
      // User state will be set by onAuthStateChange listener
      return { success: true };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await authService.signOut();
      setUser(null);
      setProfile(null);
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      // Sanitize data: convert empty strings to null for integer fields
      const sanitizedData = { ...profileData };

      // Handle integer fields - convert empty strings to null
      if (sanitizedData.graduation_year === '') {
        sanitizedData.graduation_year = null;
      }

      // Remove undefined/null values to avoid overwriting with empty data
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] === undefined) {
          delete sanitizedData[key];
        }
      });

      const updated = await profileService.updateProfile(user.id, sanitizedData);
      setProfile(updated);
      setUser({ ...user, ...updated });
      return { success: true, data: updated };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshProfile: () => user?.id && loadUserProfile(user.id)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}