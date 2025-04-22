import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiUser, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';
import { colors } from '../../utils/colors';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };
  
  return (
    <nav className={`bg-white border-b ${colors.border} shadow-card sticky top-0 z-10`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className={`text-xl font-bold ${colors.card.primary} ${colors.text.light} px-3 py-1 rounded`}>
                Campus Connect
              </Link>
            </div>
          </div>
          
          {/* Right side: user profile or auth buttons */}
          <div className="flex items-center">
            {/* Mobile menu button */}
            <div className="sm:hidden">
              <button 
                onClick={toggleMenu}
                className={`p-2 rounded-md ${colors.text.secondary} hover:bg-gray-100`}
              >
                {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
            
            {/* User profile picture or auth links */}
            <div className="hidden sm:flex items-center">
              {user ? (
                <div className="relative">
                  <button
                    onClick={toggleProfileMenu}
                    className="flex rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <div className={`w-10 h-10 ${colors.card.accent} rounded-full flex items-center justify-center ${colors.text.light}`}>
                      {user.profile_image_url ? (
                        <img 
                          src={user.profile_image_url} 
                          alt={`${user.username}'s profile`}
                          className="w-full h-full object-cover rounded-full" 
                        />
                      ) : (
                        <span className="text-lg font-medium">{user.username?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                  </button>
                  
                  {/* Profile dropdown menu */}
                  {showProfileMenu && (
                    <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        {user.major && (
                          <p className="text-xs text-gray-500">{user.major}</p>
                        )}
                      </div>
                      <Link
                        to={`/profile/${user.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Your Profile
                      </Link>
                      <Link
                        to="/explore"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Explore
                      </Link>
                      <Link
                        to="/edit-profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Edit Profile
                      </Link>
                      <button
                        onClick={signOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
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
                  to={`/profile/${user.id}`}
                  className={`block py-2 px-4 text-base font-medium ${colors.text.secondary} hover:bg-gray-100`}
                >
                  Your Profile
                </Link>
                <Link
                  to="/explore"
                  className={`block py-2 px-4 text-base font-medium ${colors.text.secondary} hover:bg-gray-100`}
                >
                  Explore
                </Link>
                <Link
                  to="/edit-profile"
                  className={`block py-2 px-4 text-base font-medium ${colors.text.secondary} hover:bg-gray-100`}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={signOut}
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
