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
          <div className="max-w-xl w-full bg-white dark:bg-dark-surface rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal header */}
            <div className="px-5 py-4 border-b border-gray-200 dark:border-dark-border flex justify-between items-start bg-gradient-to-r from-primary-50 to-white dark:from-dark-bg dark:to-dark-surface">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">Student Profile</h2>
              <button
                onClick={closeModal}
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
                  <div className={`w-28 h-28 ${colors.card.secondary} rounded-full flex items-center justify-center ${colors.text.light} shadow-lg ring-4 ring-primary-100 dark:ring-primary-900/30`}>
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={`${user.username}'s profile`}
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
                    {user.full_name || user.username}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    {/* Personal details */}
                    <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-3 border border-gray-100 dark:border-dark-border">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary mb-2 uppercase tracking-wide">Personal Info</h4>
                      <ul className="space-y-2">
                        <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                          <FiUser className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                          <span className="font-medium">@{user.username}</span>
                        </li>
                        {user.university && (
                          <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                            <FiBookOpen className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                            <span>{user.university}</span>
                          </li>
                        )}
                        {user.major && (
                          <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                            <FiBookOpen className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                            <span>{user.major}</span>
                          </li>
                        )}
                        {user.graduation_year && (
                          <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                            <FiCalendar className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                            <span>Graduating {user.graduation_year}</span>
                          </li>
                        )}
                        {user.location && (
                          <li className="flex items-center text-gray-700 dark:text-dark-text-primary">
                            <FiMapPin className="mr-2 text-primary-600 dark:text-primary-400" size={16} />
                            <span>{user.location}</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Social connections */}
                    <div className="bg-gray-50 dark:bg-dark-bg/50 rounded-xl p-3 border border-gray-100 dark:border-dark-border">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary mb-2 uppercase tracking-wide">Connections</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-2 rounded-lg text-center shadow-sm">
                          <div className="text-primary-700 dark:text-primary-400 text-lg font-bold">
                            {user.followerCount || 0}
                          </div>
                          <div className="text-gray-600 dark:text-dark-text-secondary text-xs font-medium">Followers</div>
                        </div>
                        <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 p-2 rounded-lg text-center shadow-sm">
                          <div className="text-primary-700 dark:text-primary-400 text-lg font-bold">
                            {user.followingCount || 0}
                          </div>
                          <div className="text-gray-600 dark:text-dark-text-secondary text-xs font-medium">Following</div>
                        </div>
                      </div>

                      {user.linkedin_url && (
                        <a
                          href={user.linkedin_url.startsWith('http') ? user.linkedin_url : `https://${user.linkedin_url}`}
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
                  {user.bio && (
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-dark-bg/50 dark:to-dark-bg/30 rounded-xl p-3 border border-gray-100 dark:border-dark-border">
                      <h4 className="text-xs font-semibold text-gray-500 dark:text-dark-text-secondary mb-2 uppercase tracking-wide">Bio</h4>
                      <p className="text-gray-700 dark:text-dark-text-primary leading-relaxed text-sm">{user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal footer with actions */}
            <div className="px-5 py-3 border-t border-gray-200 dark:border-dark-border flex justify-between items-center bg-gray-50 dark:bg-dark-bg/30">
              <button
                onClick={closeModal}
                className="px-4 py-2 border-2 border-gray-300 dark:border-dark-border rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-border hover:shadow-md transition-all duration-200"
              >
                Cancel
              </button>
              <div className="flex space-x-2">
                <Link
                  to={`/profile/${user.id}`}
                  className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-dark-bg dark:to-dark-border border-2 border-gray-300 dark:border-dark-border rounded-xl shadow-sm text-sm font-semibold text-gray-700 dark:text-dark-text-primary hover:from-gray-200 hover:to-gray-300 dark:hover:from-dark-border dark:hover:to-dark-border hover:shadow-md transition-all duration-200"
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