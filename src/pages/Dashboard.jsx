// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiSearch, FiUser, FiArrowRight, FiEdit3, FiBookOpen, FiMail, FiLinkedin, FiUserPlus, FiCalendar, FiBook, FiFile, FiAward } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import UserCard from '../components/social/UserCard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentUsers, setRecentUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendCount, setFriendCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);

      try {
        // Fetch current user's friends
        const { data: friendsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const friendIds = friendsData ? friendsData.map(f => f.following_id) : [];
        setFriends(friendIds);
        setFriendCount(friendIds.length);

        // Helper function to add friend counts to users
        const addFriendCounts = async (users) => {
          if (!users || users.length === 0) return [];

          const usersWithCounts = await Promise.all(
            users.map(async (userData) => {
              const { count } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', userData.id);

              return {
                ...userData,
                friendCount: count || 0
              };
            })
          );

          return usersWithCounts;
        };

        // Fetch recently joined users from database
        let recentQuery = supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id);

        // Only exclude friends if there are any
        if (friendIds.length > 0) {
          recentQuery = recentQuery.not('id', 'in', `(${friendIds.join(',')})`);
        }

        recentQuery = recentQuery.order('created_at', { ascending: false }).limit(4);

        const { data: recentUsersData, error: recentError } = await recentQuery;

        if (recentError) {
          console.error('Error fetching recent users:', recentError);
        } else {
          const recentUsersWithCounts = await addFriendCounts(recentUsersData);
          setRecentUsers(recentUsersWithCounts);
        }

        // Fetch suggested users with priority:
        // 1. Same school AND same major (highest priority)
        // 2. Same school
        // 3. Same major
        let suggestedUsersWithPriority = [];

        // Priority 1: Same school AND same major
        if (user.university && user.major) {
          let query1 = supabase
            .from('profiles')
            .select('*')
            .eq('university', user.university)
            .eq('major', user.major)
            .neq('id', user.id);

          if (friendIds.length > 0) {
            query1 = query1.not('id', 'in', `(${friendIds.join(',')})`);
          }

          query1 = query1.limit(4);

          const { data: sameSchoolAndMajor } = await query1;

          if (sameSchoolAndMajor && sameSchoolAndMajor.length > 0) {
            suggestedUsersWithPriority = await addFriendCounts(sameSchoolAndMajor);
          }
        }

        // Priority 2: Same school (if we need more users)
        if (suggestedUsersWithPriority.length < 4 && user.university) {
          let query2 = supabase
            .from('profiles')
            .select('*')
            .eq('university', user.university)
            .neq('id', user.id);

          if (friendIds.length > 0) {
            query2 = query2.not('id', 'in', `(${friendIds.join(',')})`);
          }

          query2 = query2.limit(4 - suggestedUsersWithPriority.length);

          const { data: sameSchool } = await query2;

          if (sameSchool && sameSchool.length > 0) {
            const sameSchoolWithCounts = await addFriendCounts(sameSchool);
            // Filter out duplicates
            const newUsers = sameSchoolWithCounts.filter(
              u => !suggestedUsersWithPriority.find(existing => existing.id === u.id)
            );
            suggestedUsersWithPriority = [...suggestedUsersWithPriority, ...newUsers];
          }
        }

        // Priority 3: Same major (if we still need more users)
        if (suggestedUsersWithPriority.length < 4 && user.major) {
          let query3 = supabase
            .from('profiles')
            .select('*')
            .eq('major', user.major)
            .neq('id', user.id);

          if (friendIds.length > 0) {
            query3 = query3.not('id', 'in', `(${friendIds.join(',')})`);
          }

          query3 = query3.limit(4 - suggestedUsersWithPriority.length);

          const { data: sameMajor } = await query3;

          if (sameMajor && sameMajor.length > 0) {
            const sameMajorWithCounts = await addFriendCounts(sameMajor);
            // Filter out duplicates
            const newUsers = sameMajorWithCounts.filter(
              u => !suggestedUsersWithPriority.find(existing => existing.id === u.id)
            );
            suggestedUsersWithPriority = [...suggestedUsersWithPriority, ...newUsers];
          }
        }

        setSuggestedUsers(suggestedUsersWithPriority);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);
  
  const handleFollowToggle = async (userId) => {
    // Update local state optimistically
    if (friends.includes(userId)) {
      setFriends(friends.filter(id => id !== userId));
      setFriendCount(prev => Math.max(0, prev - 1));
    } else {
      setFriends([...friends, userId]);
      setFriendCount(prev => prev + 1);
    }
  };
  
  // Redirect if not logged in (handled by router)
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enlarged welcome section */}
          <div className="bg-gradient-to-br from-white to-primary-50 dark:from-dark-surface dark:to-dark-surface rounded-lg shadow-md dark:shadow-none p-8 mb-6 border border-primary-200 dark:border-dark-border">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar with larger size */}
              <div className="flex-shrink-0">
                <div className="w-36 h-36 bg-primary-600 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-primary-300">
                  {user.profile_image_url ? (
                    <img 
                      src={user.profile_image_url} 
                      alt={`${user.username}'s profile`} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <FiUser size={56} />
                  )}
                </div>
              </div>
              
              {/* User info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-primary-800 dark:text-dark-text-primary mb-2 border-b-2 border-primary-300 dark:border-dark-border pb-2">
                  {user.username}
                </h1>
                
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h2 className="text-lg font-medium text-primary-700 dark:text-dark-text-primary">Profile</h2>
                    <ul className="mt-2 space-y-2">
                      <li className="flex items-center text-gray-700 dark:text-dark-text-secondary p-2 rounded-md bg-white dark:bg-dark-bg bg-opacity-60 hover:bg-primary-100 dark:hover:bg-dark-border transition-colors duration-200 shadow-sm">
                        <FiMail className="mr-2 text-primary-600 dark:text-primary-400" />
                        {user.email}
                      </li>
                      <li className="flex items-center text-gray-700 dark:text-dark-text-secondary p-2 rounded-md bg-white dark:bg-dark-bg bg-opacity-60 hover:bg-primary-100 dark:hover:bg-dark-border transition-colors duration-200 shadow-sm">
                        <FiBookOpen className="mr-2 text-primary-600 dark:text-primary-400" />
                        {user.major ? user.major : <span className="text-gray-400 dark:text-gray-500">Add your major</span>}
                      </li>
                      <li className="flex items-center text-gray-700 dark:text-dark-text-secondary p-2 rounded-md bg-white dark:bg-dark-bg bg-opacity-60 hover:bg-primary-100 dark:hover:bg-dark-border transition-colors duration-200 shadow-sm">
                        <FiLinkedin className="mr-2 text-primary-600 dark:text-primary-400" />
                        {user.linkedin_url ?
                          <a
                            href={user.linkedin_url.startsWith('http') ? user.linkedin_url : `https://${user.linkedin_url}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-700 dark:text-primary-400 hover:underline font-medium"
                          >
                            LinkedIn Profile
                          </a> :
                          <span className="text-gray-400 dark:text-gray-500">Add LinkedIn URL</span>
                        }
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h2 className="text-lg font-medium text-primary-700 dark:text-dark-text-primary mb-2">Your Network</h2>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                      <Link
                        to={`/friends/${user.id}`}
                        className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-md shadow-sm flex items-center justify-center space-x-1.5 transition-colors duration-200"
                      >
                        <FiUsers className="text-base" />
                        <span className="text-sm font-medium whitespace-nowrap">
                          {friendCount} {friendCount === 1 ? 'Friend' : 'Friends'}
                        </span>
                      </Link>
                      <button
                        className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-md shadow-sm flex items-center justify-center space-x-1.5 transition-colors duration-200"
                        onClick={() => navigate('/pending-requests')}
                      >
                        <FiUserPlus className="text-base" />
                        <span className="text-sm font-medium whitespace-nowrap">Friend Requests</span>
                      </button>
                    </div>
                    
                    <div className="mt-4">
                      {user.bio ? (
                        <div className="bg-white dark:bg-dark-bg rounded-lg p-3 shadow-sm border border-primary-100 dark:border-dark-border">
                          <h3 className="text-sm font-medium text-primary-700 dark:text-dark-text-primary mb-1">Bio</h3>
                          <p className="text-gray-700 dark:text-dark-text-secondary">{user.bio}</p>
                        </div>
                      ) : (
                        <div className="bg-white dark:bg-dark-bg rounded-lg p-3 shadow-sm border border-gray-200 dark:border-dark-border">
                          <h3 className="text-sm font-medium text-primary-700 dark:text-dark-text-primary mb-1">Bio</h3>
                          <p className="text-gray-400 dark:text-gray-500 italic text-sm">Add a bio to tell others about yourself</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Action buttons moved outside the card with consistent styling */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
            <Link
              to="/explore"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-surface"
            >
              <FiSearch className="mr-2" />
              <span>Explore Students</span>
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-surface"
            >
              <FiUser className="mr-2" />
              <span>View Your Profile</span>
            </Link>
            <Link
              to="/edit-profile"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-surface"
            >
              <FiEdit3 className="mr-2" />
              <span>Edit Profile</span>
            </Link>
          </div>
          
          {/* Quick Access Features */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <Link
                to="/study-groups"
                className="card p-4 sm:p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                    <FiUsers className="text-primary-600 dark:text-primary-400" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                  Study Groups
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Join or create study groups with classmates
                </p>
              </Link>

              <Link
                to="/events"
                className="card p-4 sm:p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-accent-teal/10 dark:bg-accent-teal/20 rounded-lg group-hover:bg-accent-teal/20 dark:group-hover:bg-accent-teal/30 transition-colors">
                    <FiCalendar className="text-accent-teal" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                  Campus Events
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Discover and RSVP to campus activities
                </p>
              </Link>

              <Link
                to="/course-reviews"
                className="card p-4 sm:p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-accent-sage/10 dark:bg-accent-sage/20 rounded-lg group-hover:bg-accent-sage/20 dark:group-hover:bg-accent-sage/30 transition-colors">
                    <FiBook className="text-accent-sage" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                  Course Reviews
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Read and share course reviews
                </p>
              </Link>

              <Link
                to="/resources"
                className="card p-4 sm:p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-accent-peach/10 dark:bg-accent-peach/20 rounded-lg group-hover:bg-accent-peach/20 dark:group-hover:bg-accent-peach/30 transition-colors">
                    <FiFile className="text-accent-peach" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                  Resources
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Access and share study materials
                </p>
              </Link>
            </div>

          </div>

          {/* Suggested connections section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                <FiUserPlus className="inline mr-2" />
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
                    isFollowing={friends.includes(user.id)}
                    onFollowToggle={handleFollowToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-dark-border p-8 text-center">
                <p className="text-gray-500 dark:text-dark-text-secondary">
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
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
                    isFollowing={friends.includes(user.id)}
                    onFollowToggle={handleFollowToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-dark-border p-8 text-center">
                <p className="text-gray-500 dark:text-dark-text-secondary">
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