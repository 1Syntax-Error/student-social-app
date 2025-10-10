// src/components/social/UserCard.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUser, FiBookOpen, FiMapPin, FiCalendar, FiX, FiExternalLink } from 'react-icons/fi';
import FollowButton from './FollowButton';
import Modal from '../common/Modal';
import { colors } from '../../utils/colors';

export default function UserCard({ user, isFollowing, onFollowToggle }) {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <div 
        className="card p-4 flex flex-col hover:shadow-card-hover transition duration-200 cursor-pointer"
        onClick={openModal}
      >
        {/* User avatar/placeholder */}
        <div className={`w-16 h-16 ${colors.card.secondary} rounded-full mx-auto mb-4 flex items-center justify-center ${colors.text.light}`}>
          {user.profile_image_url ? (
            <img 
              src={user.profile_image_url} 
              alt={`${user.username}'s profile`} 
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <FiUser size={24} />
          )}
        </div>
        
        {/* User info */}
        <div className="text-center mb-4">
          <span 
            className={`text-lg font-semibold ${colors.text.primary} hover:text-primary-600`}
          >
            {user.username}
          </span>
          
          {user.major && (
            <div className={`flex items-center justify-center mt-1 text-sm ${colors.text.secondary}`}>
              <FiBookOpen className="mr-1" size={14} />
              {user.major}
            </div>
          )}
        </div>
        
        {/* Bio preview if available */}
        {user.bio && (
          <p className={`${colors.text.secondary} text-sm mb-4 line-clamp-2 text-center`}>
            {user.bio}
          </p>
        )}
        
        {/* View Profile button instead of Follow button */}
        <div className="mt-auto">
          <button 
            className="w-full flex items-center justify-center bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-md transition duration-200"
          >
            View Profile
          </button>
        </div>
      </div>

      {/* Student Detail Modal */}
      {showModal && (
        <Modal onClose={closeModal}>
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl">
            {/* Modal header */}
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
              <button 
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <FiX size={24} />
              </button>
            </div>

            {/* Modal content */}
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile image */}
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className={`w-32 h-32 ${colors.card.secondary} rounded-full flex items-center justify-center ${colors.text.light}`}>
                    {user.profile_image_url ? (
                      <img 
                        src={user.profile_image_url} 
                        alt={`${user.username}'s profile`}
                        className="w-full h-full object-cover rounded-full" 
                      />
                    ) : (
                      <FiUser size={64} />
                    )}
                  </div>
                </div>

                {/* User details */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {user.full_name || user.username}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Personal details */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Personal Info</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-gray-700">
                          <FiUser className="mr-2 text-primary-600" size={16} />
                          <span className="font-medium">@{user.username}</span>
                        </li>
                        {user.university && (
                          <li className="flex items-center text-gray-700">
                            <FiBookOpen className="mr-2 text-primary-600" size={16} />
                            <span>{user.university}</span>
                          </li>
                        )}
                        {user.major && (
                          <li className="flex items-center text-gray-700">
                            <FiBookOpen className="mr-2 text-primary-600" size={16} />
                            <span>{user.major}</span>
                          </li>
                        )}
                        {user.graduation_year && (
                          <li className="flex items-center text-gray-700">
                            <FiCalendar className="mr-2 text-primary-600" size={16} />
                            <span>Graduating {user.graduation_year}</span>
                          </li>
                        )}
                        {user.location && (
                          <li className="flex items-center text-gray-700">
                            <FiMapPin className="mr-2 text-primary-600" size={16} />
                            <span>{user.location}</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Social connections */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Connections</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-primary-50 p-2 rounded-md text-center">
                          <div className="text-primary-700 text-lg font-semibold">
                            {user.followerCount || 0}
                          </div>
                          <div className="text-gray-500 text-xs">Followers</div>
                        </div>
                        <div className="bg-primary-50 p-2 rounded-md text-center">
                          <div className="text-primary-700 text-lg font-semibold">
                            {user.followingCount || 0}
                          </div>
                          <div className="text-gray-500 text-xs">Following</div>
                        </div>
                      </div>

                      {user.linkedin_url && (
                        <a 
                          href={user.linkedin_url.startsWith('http') ? user.linkedin_url : `https://${user.linkedin_url}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center text-primary-600 hover:text-primary-700"
                        >
                          <FiExternalLink className="mr-1" size={14} />
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Bio */}
                  {user.bio && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">Bio</h4>
                      <p className="text-gray-700">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer with actions */}
            <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
              <button
                onClick={closeModal}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <div className="flex space-x-2">
                <Link
                  to={`/profile/${user.id}`}
                  className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  View Full Profile
                </Link>
                <FollowButton 
                  userId={user.id} 
                  isFollowing={isFollowing}
                  onFollowToggle={() => {
                    onFollowToggle(user.id);
                    closeModal();
                  }}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}