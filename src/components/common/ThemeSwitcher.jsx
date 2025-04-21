import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';
import { useTheme, THEMES } from '../../contexts/ThemeContext';

export default function ThemeSwitcher() {
  const { theme, toggleTheme, setThemeMode } = useTheme();
  
  // Get the appropriate icon based on current theme
  const getThemeIcon = () => {
    switch(theme) {
      case THEMES.LIGHT:
        return <FiSun className="h-5 w-5" />;
      case THEMES.DARK:
        return <FiMoon className="h-5 w-5" />;
      case THEMES.SYSTEM:
        return <FiMonitor className="h-5 w-5" />;
      default:
        return <FiSun className="h-5 w-5" />;
    }
  };
  
  // Get text label for current theme
  const getThemeLabel = () => {
    switch(theme) {
      case THEMES.LIGHT:
        return 'Light';
      case THEMES.DARK:
        return 'Dark';
      case THEMES.SYSTEM:
        return 'System';
      default:
        return 'Light';
    }
  };
  
  return (
    <div className="relative">
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        className="flex items-center space-x-2 px-3 py-2 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Toggle theme"
      >
        {getThemeIcon()}
        <span className="hidden md:inline">{getThemeLabel()}</span>
      </button>
      
      {/* Dropdown menu for precise selection */}
      <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 hidden group-hover:block">
        <button
          onClick={() => setThemeMode(THEMES.LIGHT)}
          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiSun className="h-4 w-4" />
          <span>Light</span>
        </button>
        
        <button
          onClick={() => setThemeMode(THEMES.DARK)}
          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiMoon className="h-4 w-4" />
          <span>Dark</span>
        </button>
        
        <button
          onClick={() => setThemeMode(THEMES.SYSTEM)}
          className="flex items-center space-x-2 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <FiMonitor className="h-4 w-4" />
          <span>System</span>
        </button>
      </div>
    </div>
  );
}