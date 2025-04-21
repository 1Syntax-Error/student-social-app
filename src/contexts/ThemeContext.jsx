import { createContext, useContext, useState, useEffect } from 'react';

// Create theme context
const ThemeContext = createContext();

// Theme options
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export function ThemeProvider({ children }) {
  // Get saved theme preference or default to 'system'
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || THEMES.SYSTEM;
  });
  
  // Track whether dark theme is active (based on theme choice or system preference)
  const [isDark, setIsDark] = useState(false);
  
  // Update theme in localStorage and document when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Handle system preference
    if (theme === THEMES.SYSTEM) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      
      // Set data-theme attribute based on system preference
      document.documentElement.setAttribute('data-theme', prefersDark ? THEMES.DARK : THEMES.LIGHT);
    } else {
      // Set data-theme attribute to explicit choice
      document.documentElement.setAttribute('data-theme', theme);
      setIsDark(theme === THEMES.DARK);
    }
  }, [theme]);
  
  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      if (theme === THEMES.SYSTEM) {
        setIsDark(e.matches);
        document.documentElement.setAttribute('data-theme', e.matches ? THEMES.DARK : THEMES.LIGHT);
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);
  
  // Theme toggler function
  const toggleTheme = () => {
    if (theme === THEMES.LIGHT) {
      setTheme(THEMES.DARK);
    } else if (theme === THEMES.DARK) {
      setTheme(THEMES.SYSTEM);
    } else {
      setTheme(THEMES.LIGHT);
    }
  };
  
  // Set specific theme
  const setThemeMode = (mode) => {
    if (Object.values(THEMES).includes(mode)) {
      setTheme(mode);
    }
  };
  
  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using theme
export function useTheme() {
  return useContext(ThemeContext);
}