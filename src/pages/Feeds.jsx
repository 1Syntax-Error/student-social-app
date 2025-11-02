import { Link } from 'react-router-dom';
import { FiUsers, FiCalendar, FiBook, FiFile, FiStar, FiLoader, FiTrendingUp, FiHeart, FiMessageSquare } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import CreatePost from '../components/social/CreatePost';
import PostInteractions from '../components/social/PostInteractions';
import { useAuth } from '../contexts/AuthContext';
import { useActivityFeed } from '../hooks/useFeeds';
import { useQueryClient } from '@tanstack/react-query';
import { feedKeys } from '../hooks/useFeeds';

export default function Feeds() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data, isLoading: loading } = useActivityFeed(user?.id);

  const personalizedFeed = data?.personalizedFeed || [];
  const globalFeed = data?.globalFeed || [];

  const handlePostCreated = () => {
    // Invalidate and refetch the feed when a new post is created
    queryClient.invalidateQueries({ queryKey: feedKeys.feed(user?.id) });
  };

  const renderFeedItem = (item) => {
    const timeAgo = getTimeAgo(item.timestamp);

    switch (item.type) {
      case 'study_group':
        return (
          <Link
            key={item.id}
            to="/study-groups"
            className="card p-4 hover:shadow-lg transition-shadow block"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex-shrink-0">
                <FiUsers className="text-primary-600 dark:text-primary-400" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.data.creator?.profile_image_url ? (
                    <img
                      src={item.data.creator.profile_image_url}
                      alt={item.data.creator.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">
                      {item.data.creator?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    {item.data.creator?.username || 'Someone'}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">
                  Created a new study group
                </p>
                <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
                  {item.data.name}
                </p>
                {(item.data.course_code || item.data.course_name) && (
                  <p className="text-sm text-accent-teal mt-1">
                    {item.data.course_code && item.data.course_name
                      ? `${item.data.course_code} - ${item.data.course_name}`
                      : item.data.course_code || item.data.course_name}
                  </p>
                )}
              </div>
            </div>
          </Link>
        );

      case 'event':
        return (
          <Link
            key={item.id}
            to="/events"
            className="card p-4 hover:shadow-lg transition-shadow block"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-teal/10 dark:bg-accent-teal/20 rounded-lg flex-shrink-0">
                <FiCalendar className="text-accent-teal" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.data.creator?.profile_image_url ? (
                    <img
                      src={item.data.creator.profile_image_url}
                      alt={item.data.creator.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">
                      {item.data.creator?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    {item.data.creator?.username || 'Someone'}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">
                  Created a new event
                </p>
                <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
                  {item.data.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${
                    item.data.event_type === 'Academic' ? 'badge-primary' :
                    item.data.event_type === 'Career' ? 'badge-teal' :
                    item.data.event_type === 'Social' ? 'badge-peach' :
                    'badge-sage'
                  }`}>
                    {item.data.event_type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    {new Date(item.data.start_time).toLocaleDateString()}
                  </span>
                </div>
              </div>
              {item.data.image_url && (
                <img
                  src={item.data.image_url}
                  alt={item.data.title}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              )}
            </div>
          </Link>
        );

      case 'review':
        return (
          <Link
            key={item.id}
            to="/course-reviews"
            className="card p-4 hover:shadow-lg transition-shadow block"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-sage/10 dark:bg-accent-sage/20 rounded-lg flex-shrink-0">
                <FiStar className="text-accent-sage" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.data.reviewer?.profile_image_url ? (
                    <img
                      src={item.data.reviewer.profile_image_url}
                      alt={item.data.reviewer.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">
                      {item.data.reviewer?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    {item.data.reviewer?.username || 'Someone'}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">
                  Reviewed a course
                </p>
                <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
                  {item.data.course_code && item.data.course_name
                    ? `${item.data.course_code} - ${item.data.course_name}`
                    : item.data.course_code || item.data.course_name}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      size={14}
                      className={i < item.data.rating ? 'text-yellow-400 fill-current' : 'text-gray-300 dark:text-gray-600'}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-dark-text-secondary ml-1">
                    {item.data.rating}/5
                  </span>
                </div>
                {item.data.review_text && (
                  <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-2 line-clamp-2">
                    "{item.data.review_text}"
                  </p>
                )}
              </div>
            </div>
          </Link>
        );

      case 'resource':
        return (
          <Link
            key={item.id}
            to="/resources"
            className="card p-4 hover:shadow-lg transition-shadow block"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent-peach/10 dark:bg-accent-peach/20 rounded-lg flex-shrink-0">
                <FiFile className="text-accent-peach" size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.data.uploader?.profile_image_url ? (
                    <img
                      src={item.data.uploader.profile_image_url}
                      alt={item.data.uploader.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs">
                      {item.data.uploader?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                    {item.data.uploader?.username || 'Someone'}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-1">
                  Uploaded a new resource
                </p>
                <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
                  {item.data.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-primary">
                    {item.data.resource_type}
                  </span>
                  {(item.data.course_code || item.data.course_name) && (
                    <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                      {item.data.course_code && item.data.course_name
                        ? `${item.data.course_code} - ${item.data.course_name}`
                        : item.data.course_code || item.data.course_name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        );

      case 'post':
        return (
          <div
            key={item.id}
            className="card p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-shrink-0">
                {item.data.user?.profile_image_url ? (
                  <img
                    src={item.data.user.profile_image_url}
                    alt={item.data.user.username}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm">
                    {item.data.user?.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
                    {item.data.user?.full_name || item.data.user?.username || 'Someone'}
                  </p>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary">
                    @{item.data.user?.username}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    • {timeAgo}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-dark-text-primary whitespace-pre-wrap break-words leading-relaxed">
                  {item.data.content}
                </p>

                {/* Post Image */}
                {item.data.image_url && (
                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border">
                    <img
                      src={item.data.image_url}
                      alt="Post attachment"
                      className="w-full max-h-96 object-contain bg-gray-100 dark:bg-dark-bg"
                    />
                  </div>
                )}

                {/* Post Interactions */}
                <PostInteractions
                  postId={item.data.id}
                  postUserId={item.data.user_id}
                  postContent={item.data.content}
                  initialCounts={item.data.interactionCounts}
                  onInteractionUpdate={() => queryClient.invalidateQueries({ queryKey: feedKeys.feed(user?.id) })}
                  onEdit={() => queryClient.invalidateQueries({ queryKey: feedKeys.feed(user?.id) })}
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Activity Feed
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Stay updated with the latest activity from your friends and the community
            </p>
          </div>

          {/* Create Post */}
          {user && <CreatePost onPostCreated={handlePostCreated} />}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader size={32} className="text-primary-500 dark:text-primary-400 animate-spin" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Personalized Feed Section */}
              {personalizedFeed.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FiHeart className="text-primary-600 dark:text-primary-400" size={20} />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                      From Your Friends
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {personalizedFeed.slice(0, 10).map(item => renderFeedItem(item))}
                  </div>
                </div>
              )}

              {/* Global Feed Section */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FiTrendingUp className="text-accent-teal" size={20} />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                    {personalizedFeed.length > 0 ? 'Global Activity' : 'Recent Activity'}
                  </h2>
                </div>
                {globalFeed.length > 0 ? (
                  <div className="space-y-3">
                    {globalFeed.slice(0, 20).map(item => renderFeedItem(item))}
                  </div>
                ) : (
                  <div className="card p-12 text-center">
                    <FiBook className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                      No activity yet
                    </h3>
                    <p className="text-gray-600 dark:text-dark-text-secondary">
                      Start exploring and connecting with students to see activity here!
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
