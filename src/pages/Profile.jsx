// 24. src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import UserList from '../components/social/UserList';
import UserCard from '../components/social/UserCard';
import { FiLoader, FiUserX, FiUsers, FiArrowRight } from 'react-icons/fi';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [friendCount, setFriendCount] = useState(0);
  const [friends, setFriends] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfileData(profileData);

        // Check if current user is friends with this profile
        if (user && user.id !== id) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', id)
            .single();

          setIsFriend(!!followData);
        }

        // Get friend count (mutual follows)
        const { count: friends } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', id);

        setFriendCount(friends || 0);

        // Fetch the user's friends (people they follow)
        const { data: friendsData, error: friendsError } = await supabase
          .from('follows')
          .select(`
            following_id,
            friend:profiles!follows_following_id_fkey (
              id,
              username,
              full_name,
              major,
              university,
              profile_image_url,
              bio
            )
          `)
          .eq('follower_id', id);

        if (!friendsError && friendsData) {
          // Transform the data to match UserCard expectations
          const formattedFriends = friendsData.map(item => ({
            ...item.friend,
            friendCount: 0
          }));
          setFriends(formattedFriends);
        }

        // If current user is logged in, fetch their following list
        if (user) {
          const { data: followingData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', user.id);

          const followingIds = followingData ? followingData.map(f => f.following_id) : [];
          setFollowing(followingIds);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [id, user]);
  
  const handleFollowToggle = async () => {
    if (!user) return;
    if (user.id === id) return; // Can't be friends with yourself

    try {
      if (isFriend) {
        // Unfriend - remove mutual follows
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', id);

        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', id)
          .eq('following_id', user.id);

        setFriendCount(prev => Math.max(0, prev - 1));
        setIsFriend(false);
      } else {
        // Send friend request (handled by FollowButton component)
        setIsFriend(true);
      }
    } catch (error) {
      console.error('Error toggling friend:', error);
    }
  };

  const handleFriendFollowToggle = async (friendId) => {
    // Update local state optimistically
    if (following.includes(friendId)) {
      setFollowing(following.filter(id => id !== friendId));
    } else {
      setFollowing([...following, friendId]);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <FiLoader size={32} className="text-primary-500 dark:text-primary-400 animate-spin mb-4" />
            <p className="text-gray-500 dark:text-dark-text-secondary">Loading profile...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8 flex items-center justify-center">
          <div className="flex flex-col items-center text-center max-w-md px-4">
            <FiUserX size={48} className="text-gray-400 dark:text-gray-500 mb-4" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-dark-text-primary mb-2">Profile Not Found</h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              {error || "The profile you're looking for doesn't exist or has been removed."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Profile header with friend button */}
          <ProfileHeader
            profile={profileData}
            isFriend={isFriend}
            friendCount={friendCount}
            onFollowToggle={handleFollowToggle}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar with profile details */}
            <div className="lg:col-span-1">
              <ProfileDetails profile={profileData} />
            </div>

            {/* Main content area */}
            <div className="lg:col-span-2">
              {/* Friends section */}
              <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm mb-6">
                <div className="border-b border-gray-200 dark:border-dark-border py-4 px-4 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary">
                    Friends ({friendCount})
                  </h3>
                  {friendCount > 6 && (
                    <Link
                      to={`/friends/${id}`}
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium inline-flex items-center"
                    >
                      View All <FiArrowRight className="ml-1" />
                    </Link>
                  )}
                </div>

                <div className="p-4">
                  {friendCount === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <FiUsers className="mx-auto text-gray-400 dark:text-gray-500 mb-2" size={32} />
                        <span className="text-gray-500 dark:text-dark-text-secondary">
                          No friends yet
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friends.slice(0, 6).map((friend) => (
                          <UserCard
                            key={friend.id}
                            user={friend}
                            isFollowing={following.includes(friend.id)}
                            onFollowToggle={handleFriendFollowToggle}
                          />
                        ))}
                      </div>
                      {friendCount > 6 && (
                        <div className="mt-4 text-center">
                          <Link
                            to={`/friends/${id}`}
                            className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                          >
                            View all {friendCount} friends <FiArrowRight className="ml-1" />
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}