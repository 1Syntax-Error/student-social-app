// 22. src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiSearch, FiUserCheck, FiUser, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import UserCard from '../components/social/UserCard';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [recentUsers, setRecentUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // Fetch following
        const { data: followingData } = await supabase
          .from('follows')
          .select('followed_id')
          .eq('follower_id', user.id);
          
        const followingIds = followingData?.map(f => f.followed_id) || [];
        setFollowing(followingIds);
        
        // Fetch follower count
        const { count: followerCount } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('followed_id', user.id);
          
        setFollowers(followerCount || 0);
        
        // Fetch recent users (excluding self and already following)
        const { data: recentUsersData } = await supabase
          .from('profiles')
          .select('*')
          .not('id', 'in', [user.id, ...followingIds])
          .order('created_at', { ascending: false })
          .limit(4);
          
        setRecentUsers(recentUsersData || []);
        
        // Fetch suggested users based on same major (if the user has set a major)
        if (profile?.major) {
          const { data: suggestedByMajor } = await supabase
            .from('profiles')
            .select('*')
            .eq('major', profile.major)
            .not('id', 'in', [user.id, ...followingIds])
            .limit(4);
            
          setSuggestedUsers(suggestedByMajor || []);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user, profile]);
  
  const handleFollowToggle = async (userId) => {
    // Update local state optimistically
    if (following.includes(userId)) {
      setFollowing(following.filter(id => id !== userId));
    } else {
      setFollowing([...following, userId]);
    }
  };
  
  // Redirect if not logged in (handled by router)
  if (!user || !profile) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {profile.username}!
            </h1>
            <p className="text-gray-600 mt-2">
              Your network: <span className="font-medium">{following.length}</span> Following · <span className="font-medium">{followers}</span> Followers
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                to="/explore"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiSearch className="mr-2" /> 
                Explore Students
              </Link>
              <Link
                to={`/profile/${user.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <FiUser className="mr-2" /> 
                View Your Profile
              </Link>
            </div>
          </div>
          
          {/* Complete profile reminder if needed */}
          {(!profile.major || !profile.bio || !profile.linkedin_url) && (
            <div className="bg-yellow-50 rounded-lg shadow-sm p-6 mb-6 border border-yellow-200">
              <h2 className="text-lg font-semibold text-yellow-800">
                Complete your profile
              </h2>
              <p className="text-yellow-700 mt-1 mb-4">
                A complete profile helps you connect with more students and build your network
              </p>
              <Link
                to="/edit-profile"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Update Profile
              </Link>
            </div>
          )}
          
          {/* Suggested connections section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                <FiUserCheck className="inline mr-2" />
                Suggested Connections
              </h2>
              <Link 
                to="/explore" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
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
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">
                  {profile.major 
                    ? "We don't have any suggestions based on your major yet"
                    : "Add your major to get personalized suggestions"}
                </p>
              </div>
            )}
          </div>
          
          {/* Recent users section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                <FiUsers className="inline mr-2" />
                Recently Joined
              </h2>
              <Link 
                to="/explore" 
                className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center"
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
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">
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
}import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { mockUsers, mockFollowing } from '../utils/mockData';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import UserCard from '../components/social/UserCard'; // You'll need to create this

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
      
      <main className="flex-1 bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.username}!
            </h1>
            <p className="text-gray-600 mt-2">
              Your network: <span className="font-medium">{following.length}</span> Following · <span className="font-medium">{followers}</span> Followers
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <Link
                to="/explore"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Explore Students
              </Link>
              <Link
                to={`/profile/${user.id}`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Your Profile
              </Link>
            </div>
          </div>
          
          {/* Suggested connections section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Suggested Connections
              </h2>
              <Link 
                to="/explore" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {suggestedUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestedUsers.map(user => (
                  <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.major}</p>
                    <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                    <button 
                      className="mt-3 w-full py-1.5 px-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                      onClick={() => handleFollowToggle(user.id)}
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">
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
              <h2 className="text-xl font-bold text-gray-900">
                Recently Joined
              </h2>
              <Link 
                to="/explore" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            
            {recentUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="font-medium">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.major}</p>
                    <p className="text-sm text-gray-500 mt-1">{user.bio}</p>
                    <button 
                      className="mt-3 w-full py-1.5 px-3 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-md text-sm"
                      onClick={() => handleFollowToggle(user.id)}
                    >
                      Follow
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">
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