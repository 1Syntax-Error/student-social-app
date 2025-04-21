import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { mockFollowing } from '../../utils/mockData';

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
        className="w-full py-2 px-4 border border-gray-300 rounded-md text-gray-400 bg-gray-50 cursor-not-allowed text-sm font-medium"
      >
        You
      </button>
    );
  }

  return (
    <button
      onClick={handleFollowToggle}
      disabled={isLoading || !user}
      className={`w-full py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center transition duration-200 ${
        isFollowing
          ? 'bg-blue-50 text-blue-700 border border-blue-300 hover:bg-blue-100'
          : 'bg-blue-600 text-white border border-transparent hover:bg-blue-700'
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