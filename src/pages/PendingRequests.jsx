// src/pages/PendingRequests.jsx
import { useState, useEffect } from 'react';
import { FiUserPlus, FiCheck, FiX, FiInbox } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function PendingRequests() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendingRequests = async () => {
      if (!user) return;

      setLoading(true);

      try {
        // Fetch pending friend requests where current user is the receiver
        const { data: requests, error } = await supabase
          .from('friend_requests')
          .select(`
            id,
            sender_id,
            created_at,
            sender:profiles!friend_requests_sender_id_fkey (
              id,
              username,
              full_name,
              major,
              university,
              profile_image_url
            )
          `)
          .eq('receiver_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match the expected format
        const formattedRequests = (requests || []).map(request => ({
          id: request.id,
          username: request.sender.username,
          full_name: request.sender.full_name,
          major: request.sender.major,
          university: request.sender.university,
          profile_image_url: request.sender.profile_image_url,
          requestedAt: request.created_at,
          senderId: request.sender_id
        }));

        setPendingRequests(formattedRequests);
      } catch (error) {
        console.error('Error fetching pending requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingRequests();
  }, [user]);

  const handleAcceptRequest = async (requestId) => {
    try {
      // Update the friend request status to 'accepted'
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'accepted' })
        .eq('id', requestId);

      if (error) throw error;

      // Remove from UI
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error accepting friend request:', error);
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      // Update the friend request status to 'declined'
      const { error } = await supabase
        .from('friend_requests')
        .update({ status: 'declined' })
        .eq('id', requestId);

      if (error) throw error;

      // Remove from UI
      setPendingRequests(pendingRequests.filter(req => req.id !== requestId));
    } catch (error) {
      console.error('Error declining friend request:', error);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  // Redirect if not logged in (handled by router)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-dark-border">
            <div className="flex items-center mb-6">
              <FiUserPlus className="text-primary-600 dark:text-primary-400 mr-3" size={28} />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary">
                Pending Friend Requests
              </h1>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="text-center py-12">
                <FiInbox className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                  No pending requests
                </h3>
                <p className="text-gray-500 dark:text-dark-text-secondary">
                  You don't have any pending friend requests at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      {/* Profile Image */}
                      <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                        {request.profile_image_url ? (
                          <img
                            src={request.profile_image_url}
                            alt={`${request.username}'s profile`}
                            className="w-full h-full object-cover rounded-full"
                          />
                        ) : (
                          <span className="text-xl font-semibold">
                            {request.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>

                      {/* User Info */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-dark-text-primary">
                          {request.full_name || request.username}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                          @{request.username}
                        </p>
                        {request.major && (
                          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                            {request.major}
                            {request.university && ` • ${request.university}`}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTimeAgo(request.requestedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleAcceptRequest(request.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-surface"
                      >
                        <FiCheck className="mr-2" size={16} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineRequest(request.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-dark-surface"
                      >
                        <FiX className="mr-2" size={16} />
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
