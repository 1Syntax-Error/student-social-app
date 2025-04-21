import { createContext, useContext, useState } from 'react';
import { currentUser as mockUser } from '../utils/mockData';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(false);

  // Mock auth functions
  const signIn = async (email, password) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockUser);
    setLoading(false);
    return { success: true };
  };

  const signUp = async (email, password) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockUser);
    setLoading(false);
    return { success: true };
  };

  const signOut = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(null);
    setLoading(false);
    return { success: true };
  };

  const updateProfile = async (profileData) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ ...user, ...profileData });
    setLoading(false);
    return { success: true, data: { ...user, ...profileData } };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}