import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { colors } from '../../utils/colors';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <nav className={`bg-white border-b ${colors.border} shadow-card sticky top-0 z-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop navigation */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className={`text-xl font-bold ${colors.card.primary} ${colors.text.light} px-3 py-1 rounded`}>
                Campus Connect
              </Link>
            </div>
            
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className={`border-transparent ${colors.text.secondary} hover:border-primary-300 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/explore"
                  className={`border-transparent ${colors.text.secondary} hover:border-primary-300 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Explore
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className={`border-transparent ${colors.text.secondary} hover:border-primary-300 hover:text-primary-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Profile
                </Link>
              </div>
            )}
          </div>
          
          {/* Right side: user info, and auth buttons */}
          <div className="flex items-center space-x-4">
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button 
                onClick={toggleMenu}
                className={`p-2 rounded-md ${colors.text.secondary} hover:bg-gray-100`}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
            
            {/* User info or auth links */}
            <div className="hidden sm:flex items-center">
              {user ? (
                <div className="flex items-center space-x-4">
                  <span className={`text-sm font-medium ${colors.text.primary}`}>
                    {user.username}
                  </span>
                  <button
                    onClick={() => signOut()}
                    className={`btn ${colors.sidebar.bg} ${colors.text.light}`}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className={`${colors.text.primary} hover:text-primary-700 font-medium`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className={`btn ${colors.sidebar.bg} ${colors.text.light}`}
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
        <div className={`sm:hidden bg-white border-t ${colors.border}`}>
          <div className="pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className={`block py-2 px-4 text-base font-medium ${colors.text.secondary} hover:bg-gray-100`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/explore"
                  className={`block py-2 px-4 text-base font-medium ${colors.text.secondary} hover:bg-gray-100`}
                >
                  Explore
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className={`block py-2 px-4 text-base font-medium ${colors.text.secondary} hover:bg-gray-100`}
                >
                  Profile
                </Link>
                <button
                  onClick={() => signOut()}
                  className="block w-full text-left py-2 px-4 text-base font-medium text-red-600 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`block py-2 px-4 text-base font-medium ${colors.text.secondary} hover:bg-gray-100`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className={`block py-2 px-4 text-base font-medium ${colors.text.secondary} hover:bg-gray-100`}
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
