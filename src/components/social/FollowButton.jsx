import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { colors } from '../../utils/colors';

export default function FollowButton({ userId, isFollowing: initialIsFollowing, onFollowToggle }) {
  const [requestStatus, setRequestStatus] = useState('none'); // 'none', 'pending', 'accepted'
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkFriendRequestStatus = async () => {
      if (!user || !userId) return;

      try {
        // Check if there's already a friend request
        const { data: sentRequest } = await supabase
          .from('friend_requests')
          .select('status')
          .eq('sender_id', user.id)
          .eq('receiver_id', userId)
          .single();

        if (sentRequest) {
          setRequestStatus(sentRequest.status);
        } else {
          // Check if they're already following (accepted request)
          const { data: followData } = await supabase
            .from('follows')
            .select('*')
            .eq('follower_id', user.id)
            .eq('following_id', userId)
            .single();

          if (followData) {
            setRequestStatus('accepted');
          } else {
            setRequestStatus('none');
          }
        }
      } catch (error) {
        console.error('Error checking friend request status:', error);
      }
    };

    checkFriendRequestStatus();
  }, [user, userId]);

  const handleFollowToggle = async () => {
    if (!user) return;
    if (user.id === userId) return; // Can't follow yourself

    setIsLoading(true);

    try {
      if (requestStatus === 'none') {
        // Send friend request
        const { error } = await supabase
          .from('friend_requests')
          .insert([
            {
              sender_id: user.id,
              receiver_id: userId,
              status: 'pending'
            }
          ]);

        if (error) throw error;
        setRequestStatus('pending');
      } else if (requestStatus === 'pending') {
        // Cancel friend request
        const { error } = await supabase
          .from('friend_requests')
          .delete()
          .eq('sender_id', user.id)
          .eq('receiver_id', userId);

        if (error) throw error;
        setRequestStatus('none');
      } else if (requestStatus === 'accepted') {
        // Unfollow (remove follow relationship)
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);

        if (error) throw error;

        // Also remove the reverse follow
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', userId)
          .eq('following_id', user.id);

        setRequestStatus('none');
      }

      onFollowToggle && onFollowToggle();
    } catch (error) {
      console.error('Error toggling friend request:', error);
    } finally {
      setIsLoading(false);
    }
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
        requestStatus === 'accepted'
          ? 'bg-primary-100 text-primary-700 border border-primary-300 hover:bg-primary-200'
          : requestStatus === 'pending'
          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200'
          : `${colors.sidebar.bg} ${colors.text.light}`
      } ${
        (isLoading || !user) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isLoading ? (
        <span>Loading...</span>
      ) : requestStatus === 'accepted' ? (
        <>Friends</>
      ) : requestStatus === 'pending' ? (
        <>Request Sent</>
      ) : (
        <>Add Friend</>
      )}
    </button>
  );
}