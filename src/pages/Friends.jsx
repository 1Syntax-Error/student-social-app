// src/pages/Friends.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FiUsers, FiInbox, FiLoader } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import UserCard from '../components/social/UserCard';

export default function Friends() {
  const { userId } = useParams(); // Get user ID from URL params
  const { user: currentUser } = useAuth();
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [following, setFollowing] = useState([]);

  useEffect(() => {
    const fetchFriends = async () => {
      if (!userId) return;

      setLoading(true);

      try {
        // Fetch profile data of the user whose friends we're viewing
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setProfileData(profile);

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
          .eq('follower_id', userId);

        if (friendsError) throw friendsError;

        // Transform the data to match UserCard expectations
        const formattedFriends = (friendsData || []).map(item => ({
          ...item.friend,
          friendCount: 0 // We can optionally fetch each friend's friend count
        }));

        setFriends(formattedFriends);

        // If current user is logged in, fetch their following list
        if (currentUser) {
          const { data: followingData } = await supabase
            .from('follows')
            .select('following_id')
            .eq('follower_id', currentUser.id);

          const followingIds = followingData ? followingData.map(f => f.following_id) : [];
          setFollowing(followingIds);
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, [userId, currentUser]);

  const handleFollowToggle = async (friendId) => {
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
            <p className="text-gray-500 dark:text-dark-text-secondary">Loading friends...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
        <Navbar />
        <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-500 dark:text-dark-text-secondary">User not found</p>
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
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-dark-border mb-6">
            <div className="flex items-center mb-6">
              <FiUsers className="text-primary-600 dark:text-primary-400 mr-3" size={28} />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                  {currentUser && currentUser.id === userId ? 'Your Friends' : `${profileData.username}'s Friends`}
                </h1>
                <p className="text-gray-600 dark:text-dark-text-secondary">
                  {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12">
                <FiInbox className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                  No friends yet
                </h3>
                <p className="text-gray-500 dark:text-dark-text-secondary">
                  {currentUser && currentUser.id === userId
                    ? "Start connecting with other students!"
                    : `${profileData.username} hasn't added any friends yet.`}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {friends.map((friend) => (
                  <UserCard
                    key={friend.id}
                    user={friend}
                    isFollowing={following.includes(friend.id)}
                    onFollowToggle={handleFollowToggle}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
