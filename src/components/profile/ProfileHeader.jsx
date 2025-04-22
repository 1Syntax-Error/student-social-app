import { Link } from 'react-router-dom';
import { FiEdit2, FiUser, FiUsers, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import FollowButton from '../social/FollowButton';

export default function ProfileHeader({ profile, isFollowing, followers, following, onFollowToggle }) {
  const { user } = useAuth();
  const isOwnProfile = user && user.id === profile.id;
  
  return (
    <div className="card p-6 mb-6">
      <div className="flex flex-col md:flex-row">
        {/* Profile image/avatar */}
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
            {profile.profile_image_url ? (
              <img 
                src={profile.profile_image_url} 
                alt={`${profile.username}'s profile`}
                className="w-full h-full object-cover rounded-full" 
              />
            ) : (
              <FiUser size={36} />
            )}
          </div>
        </div>
        
        {/* Profile info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{profile.username}</h1>
              {profile.major && (
                <p className="text-text-secondary">{profile.major}</p>
              )}
            </div>
            
            <div className="mt-3 sm:mt-0">
              {isOwnProfile ? (
                <Link
                  to="/edit-profile"
                  className="btn inline-flex items-center"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Profile
                </Link>
              ) : (
                <FollowButton 
                  userId={profile.id} 
                  isFollowing={isFollowing}
                  onFollowToggle={onFollowToggle}
                />
              )}
            </div>
          </div>
          
          {profile.bio && (
            <p className="text-text-secondary mb-4">{profile.bio}</p>
          )}
          
          {/* Follower/Following counts */}
          <div className="flex space-x-4">
            <div className="flex items-center text-text-secondary">
              <FiUsers className="mr-1" />
              <span>{followers} Followers</span>
            </div>
            <div className="flex items-center text-text-secondary">
              <FiUserCheck className="mr-1" />
              <span>{following} Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}