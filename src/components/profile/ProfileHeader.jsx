// 16. src/components/profile/ProfileHeader.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEdit2, FiUser, FiUsers, FiUserCheck } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import FollowButton from '../social/FollowButton';

export default function ProfileHeader({ profile, isFollowing, followers, following, onFollowToggle }) {
  const { user } = useAuth();
  const isOwnProfile = user && user.id === profile.id;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
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
              <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
              {profile.major && (
                <p className="text-gray-600">{profile.major}</p>
              )}
            </div>
            
            <div className="mt-3 sm:mt-0">
              {isOwnProfile ? (
                <Link
                  to="/edit-profile"
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
            <p className="text-gray-700 mb-4">{profile.bio}</p>
          )}
          
          {/* Follower/Following counts */}
          <div className="flex space-x-4">
            <div className="flex items-center text-gray-600">
              <FiUsers className="mr-1" />
              <span>{followers} Followers</span>
            </div>
            <div className="flex items-center text-gray-600">
              <FiUserCheck className="mr-1" />
              <span>{following} Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}