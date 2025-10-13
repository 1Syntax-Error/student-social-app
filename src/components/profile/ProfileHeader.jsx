import { Link } from 'react-router-dom';
import { FiEdit2, FiUser, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import FollowButton from '../social/FollowButton';
import { colors } from '../../utils/colors';

export default function ProfileHeader({ profile, isFriend, friendCount, onFollowToggle }) {
  const { user } = useAuth();
  const isOwnProfile = user && user.id === profile.id;

  return (
    <div className="card p-4 sm:p-6 mb-6">
      <div className="flex flex-col md:flex-row">
        {/* Profile image/avatar */}
        <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
          <div className="w-24 h-24 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center text-white">
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">{profile.username}</h1>
              {profile.major && (
                <p className="text-gray-600 dark:text-dark-text-secondary">{profile.major}</p>
              )}
            </div>

            <div className="mt-3 sm:mt-0">
              {isOwnProfile ? (
                <Link
                  to="/edit-profile"
                  className="btn btn-primary inline-flex items-center"
                >
                  <FiEdit2 className="mr-2" />
                  Edit Profile
                </Link>
              ) : (
                <FollowButton
                  userId={profile.id}
                  isFollowing={isFriend}
                  onFollowToggle={onFollowToggle}
                />
              )}
            </div>
          </div>

          {profile.bio && (
            <p className="text-gray-600 dark:text-dark-text-secondary mb-4">{profile.bio}</p>
          )}

          {/* Friends count - clickable */}
          <div className="flex space-x-4">
            <Link
              to={`/friends/${profile.id}`}
              className="flex items-center text-gray-600 dark:text-dark-text-secondary hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200 group"
            >
              <FiUsers className="mr-1 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">{friendCount} {friendCount === 1 ? 'Friend' : 'Friends'}</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
