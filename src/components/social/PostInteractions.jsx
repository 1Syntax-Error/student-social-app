// src/components/social/PostInteractions.jsx
import { useState, useEffect, useRef } from 'react';
import { FiThumbsUp, FiThumbsDown, FiMessageCircle, FiSend, FiEdit2, FiTrash2, FiMoreVertical } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';

export default function PostInteractions({ postId, postUserId, postContent, initialCounts, onInteractionUpdate, onDelete, onEdit }) {
  const { user } = useAuth();
  const [counts, setCounts] = useState({
    likes: initialCounts?.likes || 0,
    dislikes: initialCounts?.dislikes || 0,
    comments: initialCounts?.comments || 0
  });
  const [userReaction, setUserReaction] = useState(null); // 'like', 'dislike', or null
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(postContent || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const menuRef = useRef(null);

  const isPostCreator = user && postUserId && user.id === postUserId;

  useEffect(() => {
    if (user) {
      fetchUserInteractions();
    }
  }, [user, postId]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showMenu]);

  const fetchUserInteractions = async () => {
    if (!user) return;

    try {
      // Fetch user's reaction
      const { data: reactionData } = await supabase
        .from('post_likes')
        .select('reaction_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (reactionData) {
        setUserReaction(reactionData.reaction_type);
      }
    } catch (error) {
      console.error('Error fetching user interactions:', error);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user:profiles!post_comments_user_id_fkey (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!user) return;

    try {
      if (userReaction === reactionType) {
        // Remove reaction
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setCounts(prev => ({
          ...prev,
          [reactionType === 'like' ? 'likes' : 'dislikes']: Math.max(0, prev[reactionType === 'like' ? 'likes' : 'dislikes'] - 1)
        }));
        setUserReaction(null);
      } else {
        // Add or update reaction
        const { error } = await supabase
          .from('post_likes')
          .upsert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          }, { onConflict: 'post_id,user_id' });

        if (error) throw error;

        // Update counts
        setCounts(prev => {
          const newCounts = { ...prev };

          // Remove old reaction count
          if (userReaction === 'like') {
            newCounts.likes = Math.max(0, newCounts.likes - 1);
          } else if (userReaction === 'dislike') {
            newCounts.dislikes = Math.max(0, newCounts.dislikes - 1);
          }

          // Add new reaction count
          if (reactionType === 'like') {
            newCounts.likes += 1;
          } else {
            newCounts.dislikes += 1;
          }

          return newCounts;
        });

        setUserReaction(reactionType);
      }

      if (onInteractionUpdate) onInteractionUpdate();
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedContent(postContent || '');
    setShowMenu(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedContent(postContent || '');
  };

  const handleSaveEdit = async () => {
    if (!isPostCreator || !editedContent.trim()) return;

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editedContent.trim() })
        .eq('id', postId);

      if (error) throw error;

      setIsEditing(false);
      if (onEdit) onEdit(postId, editedContent.trim());
      if (onInteractionUpdate) onInteractionUpdate();
    } catch (error) {
      console.error('Error updating post:', error);
      alert('Failed to update post. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isPostCreator || !window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    try {
      // Delete post - cascade will handle likes, comments, etc.
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      if (onDelete) onDelete(postId);
      if (onInteractionUpdate) onInteractionUpdate();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const toggleComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: newComment.trim()
        })
        .select(`
          id,
          content,
          created_at,
          user:profiles!post_comments_user_id_fkey (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setCounts(prev => ({
        ...prev,
        comments: prev.comments + 1
      }));
      setNewComment('');

      if (onInteractionUpdate) onInteractionUpdate();
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="mt-3">
      {/* Edit Mode */}
      {isEditing ? (
        <div className="mb-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full min-h-[100px] p-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-surface text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            maxLength={500}
            autoFocus
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
              {editedContent.length}/500 characters
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleCancelEdit}
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating || !editedContent.trim() || editedContent === postContent}
                className="px-3 py-1.5 text-sm text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Interaction Buttons */}
      <div className="flex items-center gap-4 pb-3 border-b border-gray-200 dark:border-dark-border">
        <button
          onClick={() => handleReaction('like')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            userReaction === 'like'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border'
          }`}
        >
          <FiThumbsUp size={18} className={userReaction === 'like' ? 'fill-current' : ''} />
          <span className="text-sm font-medium">{counts.likes}</span>
        </button>

        <button
          onClick={() => handleReaction('dislike')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            userReaction === 'dislike'
              ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
              : 'text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border'
          }`}
        >
          <FiThumbsDown size={18} className={userReaction === 'dislike' ? 'fill-current' : ''} />
          <span className="text-sm font-medium">{counts.dislikes}</span>
        </button>

        <button
          onClick={toggleComments}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
        >
          <FiMessageCircle size={18} />
          <span className="text-sm font-medium">{counts.comments}</span>
        </button>

        {/* Post Creator Menu */}
        {isPostCreator && !isEditing && (
          <div className="ml-auto relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-gray-600 dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
            >
              <FiMoreVertical size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 mt-1 bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-lg py-1 min-w-[120px] z-10">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-border transition-colors flex items-center gap-2"
                >
                  <FiEdit2 size={16} />
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <FiTrash2 size={16} />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 space-y-3">
          {loadingComments ? (
            <div className="text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Comments List */}
              {comments.length > 0 && (
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-2">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">
                          {comment.user?.profile_image_url ? (
                            <img
                              src={comment.user.profile_image_url}
                              alt={comment.user.username}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span>{comment.user?.username?.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 dark:bg-dark-bg rounded-lg p-2">
                        <p className="text-xs font-semibold text-gray-900 dark:text-dark-text-primary">
                          {comment.user?.full_name || comment.user?.username}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-dark-text-secondary mt-0.5">
                          {comment.content}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {formatTimeAgo(comment.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Comment Form */}
              {user && (
                <form onSubmit={handleSubmitComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    maxLength={300}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <FiSend size={16} />
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
