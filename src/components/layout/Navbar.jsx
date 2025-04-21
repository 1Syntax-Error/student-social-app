import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeSwitcher from '../common/ThemeSwitcher';
import { FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { isDark } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className="bg-white dark:bg-dark-surface shadow-sm dark:shadow-none border-b border-gray-200 dark:border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-primary-600 dark:text-dark-primary">
                Campus Connect
              </Link>
            </div>
            
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="border-transparent text-gray-500 dark:text-dark-secondary hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/explore"
                  className="border-transparent text-gray-500 dark:text-dark-secondary hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Explore
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="border-transparent text-gray-500 dark:text-dark-secondary hover:border-primary-300 dark:hover:border-primary-700 hover:text-primary-700 dark:hover:text-primary-500 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Profile
                </Link>
              </div>
            )}
          </div>
          
          {/* Right side: Theme toggle, user info, and auth buttons */}
          <div className="flex items-center space-x-4">
            {/* Theme switcher */}
            <ThemeSwitcher />
            
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
            
            {/* User info or auth links */}
            <div className="hidden sm:flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-dark-primary">
                    {user.username}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-surface"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden bg-white dark:bg-dark-surface border-t border-gray-200 dark:border-dark-border">
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block py-2 px-4 text-base font-medium text-gray-500 dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-700 dark:hover:text-primary-500"
                >
                  Dashboard
                </Link>
                <Link
                  to="/explore"
                  className="block py-2 px-4 text-base font-medium text-gray-500 dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-700 dark:hover:text-primary-500"
                >
                  Explore
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="block py-2 px-4 text-base font-medium text-gray-500 dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-700 dark:hover:text-primary-500"
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left py-2 px-4 text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block py-2 px-4 text-base font-medium text-gray-500 dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-700 dark:hover:text-primary-500"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block py-2 px-4 text-base font-medium text-gray-500 dark:text-dark-secondary hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary-700 dark:hover:text-primary-500"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}