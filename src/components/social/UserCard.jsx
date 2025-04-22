import { Link } from 'react-router-dom';
import { FiUser, FiBookOpen } from 'react-icons/fi';
import FollowButton from './FollowButton';
import { colors } from '../../utils/colors';

export default function UserCard({ user, isFollowing, onFollowToggle }) {
  return (
    <div className="card p-4 flex flex-col hover:shadow-card-hover transition duration-200">
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
        <Link 
          to={`/profile/${user.id}`}
          className={`text-lg font-semibold ${colors.text.primary} hover:text-primary-600`}
        >
          {user.username}
        </Link>
        
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
      
      {/* Follow button */}
      <div className="mt-auto">
        <FollowButton 
          userId={user.id} 
          isFollowing={isFollowing}
          onFollowToggle={() => onFollowToggle(user.id)}
        />
      </div>
    </div>
  );
}