import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockFollowing } from '../../utils/mockData';
import { colors } from '../../utils/colors';

export default function FollowButton({ userId, isFollowing: initialIsFollowing, onFollowToggle }) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing || mockFollowing.includes(userId));
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const handleFollowToggle = async () => {
    if (!user) return;
    if (user.id === userId) return; // Can't follow yourself
    
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setIsFollowing(!isFollowing);
    onFollowToggle && onFollowToggle();
    setIsLoading(false);
  };
  
  // Show disabled button if it's the current user
  if (user && user.id === userId) {
    return (
      <button
        disabled
        className="btn w-full text-text-muted bg-secondary cursor-not-allowed"
      >
        You
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading || !user}
      className={`btn w-full flex items-center justify-center transition duration-200 ${
        isFollowing
          ? 'bg-primary-100 text-primary-700 border border-primary-300 hover:bg-primary-200'
          : `${colors.sidebar.bg} ${colors.text.light}`
      } ${
        (isLoading || !user) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        <span>Loading...</span>
      ) : isFollowing ? (
        <>Following</>
      ) : (
        <>Follow</>
      )}
    </button>
  );
}