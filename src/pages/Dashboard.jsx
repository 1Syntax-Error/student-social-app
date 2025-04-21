// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiSearch, FiUserCheck, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers, mockFollowing } from '../utils/mockData';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import UserCard from '../components/social/UserCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [recentUsers, setRecentUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [following, setFollowing] = useState(mockFollowing);
  const [followers, setFollowers] = useState(2); // Mock value
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filter users to exclude current user and those already followed
      const filteredUsers = mockUsers.filter(
        u => u.id !== user.id && !mockFollowing.includes(u.id)
      );
      
      // Get "recent" users (just a subset of mock users)
      setRecentUsers(filteredUsers.slice(0, 2));
      
      // Get "suggested" users (users with same major as current user)
      const suggestedByMajor = filteredUsers.filter(
        u => u.major === user.major
      ).slice(0, 2);
      
      setSuggestedUsers(suggestedByMajor);
      setLoading(false);
    };
    
    fetchDashboardData();
  }, [user]);
  
  const handleFollowToggle = async (userId) => {
    // Update local state optimistically
    if (following.includes(userId)) {
      setFollowing(following.filter(id => id !== userId));
    } else {
      setFollowing([...following, userId]);
    }
  };
  
  // Redirect if not logged in (handled by router)
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 dark:bg-dark-page py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome section */}
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-none p-6 mb-6 border border-gray-200 dark:border-dark-border">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-primary">
              Welcome back, {user.username}!
            </h1>
            <p className="text-gray-600 dark:text-dark-secondary mt-2">
              Your network: <span className="font-medium">{following.length}</span> Following · <span className="font-medium">{followers}</span> Followers
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                to="/explore"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 dark:bg-primary-700 hover:bg-primary-700 dark:hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-surface"
              >
                <FiSearch className="mr-2" /> 
                Explore Students
              </Link>
              <Link
                to={`/profile/${user.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-elevated hover:bg-gray-50 dark:hover:bg-dark-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-surface"
              >
                <FiUser className="mr-2" /> 
                View Your Profile
              </Link>
            </div>
          </div>
          
          {/* Complete profile reminder if needed */}
          {(!user.major || !user.bio || !user.linkedin_url) && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg shadow-sm dark:shadow-none p-6 mb-6 border border-yellow-200 dark:border-yellow-800">
              <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                Complete your profile
              </h2>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1 mb-4">
                A complete profile helps you connect with more students and build your network
              </p>
              <Link
                to="/edit-profile"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 dark:focus:ring-offset-dark-surface"
              >
                Update Profile
              </Link>
            </div>
          )}
          
          {/* Suggested connections section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-primary">
                <FiUserCheck className="inline mr-2" />
                Suggested Connections
              </h2>
              <Link 
                to="/explore" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium inline-flex items-center"
              >
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
            
            {suggestedUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestedUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={following.includes(user.id)}
                    onFollowToggle={handleFollowToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-dark-border p-8 text-center">
                <p className="text-gray-500 dark:text-dark-secondary">
                  {user.major 
                    ? "We don't have any suggestions based on your major yet"
                    : "Add your major to get personalized suggestions"}
                </p>
              </div>
            )}
          </div>
          
          {/* Recent users section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-primary">
                <FiUsers className="inline mr-2" />
                Recently Joined
              </h2>
              <Link 
                to="/explore" 
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium inline-flex items-center"
              >
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
            
            {recentUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={following.includes(user.id)}
                    onFollowToggle={handleFollowToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-dark-border p-8 text-center">
                <p className="text-gray-500 dark:text-dark-secondary">
                  No new users to show at the moment
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}