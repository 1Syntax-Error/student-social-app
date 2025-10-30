// 24. src/pages/Profile.jsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import Modal from '../components/common/Modal';
import FollowButton from '../components/social/FollowButton';
import { FiLoader, FiUserX, FiUsers, FiArrowRight, FiUser, FiX, FiBookOpen, FiMapPin, FiCalendar, FiExternalLink } from 'react-icons/fi';

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
  const [selectedFriend, setSelectedFriend] = useState(null);

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
          .maybeSingle();

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

  useEffect(() => {
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
    // Refetch the profile data to update friends list and count
    await fetchProfile();
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
                      <div className="space-y-2">
                        {friends.slice(0, 6).map((friend) => (
                          <button
                            key={friend.id}
                            onClick={() => setSelectedFriend(friend)}
                            className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div className="w-12 h-12 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                                {friend.profile_image_url ? (
                                  <img
                                    src={friend.profile_image_url}
                                    alt={`${friend.username}'s profile`}
                                    className="w-full h-full object-cover rounded-full"
                                  />
                                ) : (
                                  <FiUser size={20} />
                                )}
                              </div>

                              {/* User Info */}
                              <div className="min-w-0 text-left">
                                <p className="font-medium text-gray-900 dark:text-dark-text-primary group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                                  {friend.username}
                                </p>
                                <div className="text-sm text-gray-600 dark:text-dark-text-secondary">
                                  {friend.university && <span>{friend.university}</span>}
                                  {friend.university && friend.major && <span> • </span>}
                                  {friend.major && <span>{friend.major}</span>}
                                </div>
                              </div>
                            </div>

                            {/* Friend Count */}
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-dark-text-secondary flex-shrink-0">
                              <FiUsers size={14} />
                              <span>{friend.friendCount || 0}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      {friendCount > 6 && (
                        <div className="mt-4 text-center pt-4 border-t border-gray-200 dark:border-dark-border">
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

      {/* Student Detail Modal */}
      {selectedFriend && (
        <Modal onClose={() => setSelectedFriend(null)}>
          <div className="max-w-xl w-full bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-start bg-gradient-to-r from-primary-50 to-white dark:from-dark-bg dark:to-dark-surface">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Student Profile</h2>
              <button
                onClick={() => setSelectedFriend(null)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 focus:outline-none hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg p-1.5 transition-all duration-200"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Profile image */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-28 h-28 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/30">
                    {selectedFriend.profile_image_url ? (
                      <img
                        src={selectedFriend.profile_image_url}
                        alt={`${selectedFriend.username}'s profile`}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <FiUser size={48} />
                    )}
                  </div>
                </div>

                {/* User details */}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                    {selectedFriend.full_name || selectedFriend.username}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Personal details */}
                    <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-3 border border-gray-100 dark:border-dark-border">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary mb-2 uppercase tracking-wide">Personal Info</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                          <FiUser className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                          <span className="font-medium">@{selectedFriend.username}</span>
                        </li>
                        {selectedFriend.university && (
                          <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                            <FiBookOpen className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                            <span>{selectedFriend.university}</span>
                          </li>
                        )}
                        {selectedFriend.major && (
                          <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                            <FiBookOpen className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                            <span>{selectedFriend.major}</span>
                          </li>
                        )}
                        {selectedFriend.graduation_year && (
                          <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                            <FiCalendar className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                            <span>Graduating {selectedFriend.graduation_year}</span>
                          </li>
                        )}
                        {selectedFriend.location && (
                          <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                            <FiMapPin className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                            <span>{selectedFriend.location}</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Social connections */}
                    <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-3 border border-gray-100 dark:border-dark-border">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary mb-2 uppercase tracking-wide">Connections</h4>
                      <div className="flex justify-center">
                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-3 rounded-lg text-center shadow-sm w-full">
                          <div className="text-primary-700 dark:text-primary-400 text-xl font-bold">
                            {selectedFriend.friendCount || 0}
                          </div>
                          <div className="text-gray-600 dark:text-dark-text-secondary text-xs font-medium">
                            {selectedFriend.friendCount === 1 ? 'Friend' : 'Friends'}
                          </div>
                        </div>
                      </div>

                      {selectedFriend.linkedin_url && (
                        <a
                          href={selectedFriend.linkedin_url.startsWith('http') ? selectedFriend.linkedin_url : `https://${selectedFriend.linkedin_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center justify-center text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium text-xs bg-white dark:bg-dark-bg py-1.5 px-2 rounded-lg hover:shadow-md transition-all duration-200"
                        >
                          <FiExternalLink className="mr-1" size={12} />
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {selectedFriend.bio && (
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg/50 dark:to-dark-bg/30 rounded-xl p-3 border border-gray-100 dark:border-dark-border">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary mb-2 uppercase tracking-wide">Bio</h4>
                      <p className="text-gray-700 dark:text-dark-text-primary leading-relaxed text-sm">{selectedFriend.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer with actions */}
            <div className="px-5 py-3 border-t border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg/30">
              <button
                onClick={() => setSelectedFriend(null)}
                className="px-4 py-2 border-2 border-gray-300 dark:border-dark-border rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-border hover:shadow-md transition-all duration-200"
              >
                Cancel
              </button>
              <div className="flex space-x-2">
                <Link
                  to={`/profile/${selectedFriend.id}`}
                  onClick={() => setSelectedFriend(null)}
                  className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-dark-bg dark:to-dark-border border-2 border-gray-300 dark:border-dark-border rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-dark-text-primary hover:from-gray-200 hover:to-gray-300 dark:hover:from-dark-border dark:hover:to-dark-border hover:shadow-md transition-all duration-200"
                >
                  View Full Profile
                </Link>
                <FollowButton
                  userId={selectedFriend.id}
                  isFollowing={following.includes(selectedFriend.id)}
                  onFollowToggle={() => {
                    handleFriendFollowToggle(selectedFriend.id);
                    setSelectedFriend(null);
                  }}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}

      <Footer />
    </div>
  );
}