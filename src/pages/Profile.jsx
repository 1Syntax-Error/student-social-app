// 24. src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../utils/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileDetails from '../components/profile/ProfileDetails';
import UserList from '../components/social/UserList';
import { FiLoader, FiUserX, FiUsers } from 'react-icons/fi';

export default function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  
  const [profileData, setProfileData] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFollowers, setShowFollowers] = useState(false);
  
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
        
        // Check if current user is following this profile
        if (user && user.id !== id) {
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', id)
            .single();

          setIsFollowing(!!followData);
        }

        // Get follower count
        const { count: followers } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', id);

        setFollowerCount(followers || 0);
        
        // Get following count
        const { count: following } = await supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', id);
          
        setFollowingCount(following || 0);
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
    if (user.id === id) return; // Can't follow yourself

    try {
      if (isFollowing) {
        // Unfollow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', id);

        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        // Follow
        await supabase
          .from('follows')
          .insert([
            { follower_id: user.id, following_id: id }
          ]);

        setFollowerCount(prev => prev + 1);
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error toggling follow:', error);
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
          {/* Profile header with follow button */}
          <ProfileHeader
            profile={profileData}
            isFollowing={isFollowing}
            followers={followerCount}
            following={followingCount}
            onFollowToggle={handleFollowToggle}
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sidebar with profile details */}
            <div className="lg:col-span-1">
              <ProfileDetails profile={profileData} />
            </div>
            
            {/* Main content area */}
            <div className="lg:col-span-2">
              {/* Connection tabs */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm mb-6">
                <div className="flex">
                  <button
                    onClick={() => setShowFollowers(false)}
                    className={`flex-1 py-4 px-4 text-center font-medium ${
                      !showFollowers
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Following ({followingCount})
                  </button>
                  <button
                    onClick={() => setShowFollowers(true)}
                    className={`flex-1 py-4 px-4 text-center font-medium ${
                      showFollowers
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Followers ({followerCount})
                  </button>
                </div>
                
                <div className="p-4">
                  {showFollowers ? (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        People following {profileData.username}
                      </h3>
                      {/* We'd fetch and display followers here */}
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <FiUsers />
                          <span>
                            {followerCount === 0
                              ? 'No followers yet'
                              : `${followerCount} ${followerCount === 1 ? 'follower' : 'followers'}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        People {profileData.username} follows
                      </h3>
                      {/* We'd fetch and display following here */}
                      <div className="flex items-center justify-center py-8">
                        <div className="flex items-center space-x-2 text-gray-500">
                          <FiUsers />
                          <span>
                            {followingCount === 0
                              ? 'Not following anyone yet'
                              : `Following ${followingCount} ${followingCount === 1 ? 'person' : 'people'}`}
                          </span>
                        </div>
                      </div>
                    </div>
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