// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiSearch, FiUser, FiArrowRight, FiEdit3, FiBookOpen, FiMapPin, FiLinkedin, FiUserPlus, FiCalendar, FiBook, FiFile, FiAward, FiActivity, FiMessageCircle, FiTrendingUp, FiClock, FiStar, FiMessageSquare, FiThumbsUp, FiShare2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import UserCard from '../components/social/UserCard';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentUsers, setRecentUsers] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendCount, setFriendCount] = useState(0);
  const [pendingRequestCount, setPendingRequestCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Stats state
  const [stats, setStats] = useState({
    postsCount: 0,
    eventsCount: 0,
    studyGroupsCount: 0,
    resourcesCount: 0
  });

  // Activity feed state
  const [recentActivity, setRecentActivity] = useState([]);

  // Upcoming events state
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // Active study groups state
  const [activeStudyGroups, setActiveStudyGroups] = useState([]);

  // Trending groups state
  const [trendingGroups, setTrendingGroups] = useState([]);

  // Recent resources state
  const [recentResources, setRecentResources] = useState([]);

  // Achievements state
  const [achievements, setAchievements] = useState([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      setLoading(true);

      try {
        // Fetch current user's friends
        const { data: friendsData } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const friendIds = friendsData ? friendsData.map(f => f.following_id) : [];
        setFriends(friendIds);
        setFriendCount(friendIds.length);

        // Fetch pending friend request count
        const { count: pendingCount } = await supabase
          .from('friend_requests')
          .select('*', { count: 'exact', head: true })
          .eq('receiver_id', user.id)
          .eq('status', 'pending');

        setPendingRequestCount(pendingCount || 0);

        // Helper function to add friend counts to users
        const addFriendCounts = async (users) => {
          if (!users || users.length === 0) return [];

          const usersWithCounts = await Promise.all(
            users.map(async (userData) => {
              const { count } = await supabase
                .from('follows')
                .select('*', { count: 'exact', head: true })
                .eq('follower_id', userData.id);

              return {
                ...userData,
                friendCount: count || 0
              };
            })
          );

          return usersWithCounts;
        };

        // Fetch recently joined users from database
        let recentQuery = supabase
          .from('profiles')
          .select('*')
          .neq('id', user.id);

        // Only exclude friends if there are any
        if (friendIds.length > 0) {
          recentQuery = recentQuery.not('id', 'in', `(${friendIds.join(',')})`);
        }

        recentQuery = recentQuery.order('created_at', { ascending: false }).limit(4);

        const { data: recentUsersData, error: recentError } = await recentQuery;

        if (recentError) {
          console.error('Error fetching recent users:', recentError);
        } else {
          const recentUsersWithCounts = await addFriendCounts(recentUsersData);
          setRecentUsers(recentUsersWithCounts);
        }

        // Fetch suggested users with priority:
        // 1. Same school AND same major (highest priority)
        // 2. Same school
        // 3. Same major
        let suggestedUsersWithPriority = [];

        // Priority 1: Same school AND same major
        if (user.university && user.major) {
          let query1 = supabase
            .from('profiles')
            .select('*')
            .eq('university', user.university)
            .eq('major', user.major)
            .neq('id', user.id);

          if (friendIds.length > 0) {
            query1 = query1.not('id', 'in', `(${friendIds.join(',')})`);
          }

          query1 = query1.limit(4);

          const { data: sameSchoolAndMajor } = await query1;

          if (sameSchoolAndMajor && sameSchoolAndMajor.length > 0) {
            suggestedUsersWithPriority = await addFriendCounts(sameSchoolAndMajor);
          }
        }

        // Priority 2: Same school (if we need more users)
        if (suggestedUsersWithPriority.length < 4 && user.university) {
          let query2 = supabase
            .from('profiles')
            .select('*')
            .eq('university', user.university)
            .neq('id', user.id);

          if (friendIds.length > 0) {
            query2 = query2.not('id', 'in', `(${friendIds.join(',')})`);
          }

          query2 = query2.limit(4 - suggestedUsersWithPriority.length);

          const { data: sameSchool } = await query2;

          if (sameSchool && sameSchool.length > 0) {
            const sameSchoolWithCounts = await addFriendCounts(sameSchool);
            // Filter out duplicates
            const newUsers = sameSchoolWithCounts.filter(
              u => !suggestedUsersWithPriority.find(existing => existing.id === u.id)
            );
            suggestedUsersWithPriority = [...suggestedUsersWithPriority, ...newUsers];
          }
        }

        // Priority 3: Same major (if we still need more users)
        if (suggestedUsersWithPriority.length < 4 && user.major) {
          let query3 = supabase
            .from('profiles')
            .select('*')
            .eq('major', user.major)
            .neq('id', user.id);

          if (friendIds.length > 0) {
            query3 = query3.not('id', 'in', `(${friendIds.join(',')})`);
          }

          query3 = query3.limit(4 - suggestedUsersWithPriority.length);

          const { data: sameMajor } = await query3;

          if (sameMajor && sameMajor.length > 0) {
            const sameMajorWithCounts = await addFriendCounts(sameMajor);
            // Filter out duplicates
            const newUsers = sameMajorWithCounts.filter(
              u => !suggestedUsersWithPriority.find(existing => existing.id === u.id)
            );
            suggestedUsersWithPriority = [...suggestedUsersWithPriority, ...newUsers];
          }
        }

        setSuggestedUsers(suggestedUsersWithPriority);

        // Fetch user stats
        const [postsResult, eventsResult, studyGroupsResult, resourcesResult] = await Promise.all([
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('event_attendees').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('study_group_members').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('resources').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
        ]);

        setStats({
          postsCount: postsResult.count || 0,
          eventsCount: eventsResult.count || 0,
          studyGroupsCount: studyGroupsResult.count || 0,
          resourcesCount: resourcesResult.count || 0
        });

        // Fetch recent activity (posts, study groups, events, reviews, resources from friends)
        if (friendIds.length > 0) {
          const [postsData, studyGroupsData, eventsData, reviewsData, resourcesData] = await Promise.all([
            // Posts
            supabase
              .from('posts')
              .select('id, content, image_url, created_at, user_id, user:profiles!posts_user_id_fkey(*)')
              .in('user_id', friendIds)
              .order('created_at', { ascending: false })
              .limit(10),

            // Study groups
            supabase
              .from('study_groups')
              .select('*, creator:profiles!study_groups_creator_id_fkey(*)')
              .in('creator_id', friendIds)
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(10),

            // Events
            supabase
              .from('events')
              .select('*, creator:profiles!events_creator_id_fkey(*)')
              .in('creator_id', friendIds)
              .eq('is_active', true)
              .order('created_at', { ascending: false })
              .limit(10),

            // Reviews
            supabase
              .from('course_reviews')
              .select('*, reviewer:profiles!course_reviews_user_id_fkey(*)')
              .in('user_id', friendIds)
              .order('created_at', { ascending: false })
              .limit(10),

            // Resources
            supabase
              .from('resources')
              .select('*, uploader:profiles(*)')
              .in('uploader_id', friendIds)
              .order('created_at', { ascending: false })
              .limit(10)
          ]);

          // Combine all activities
          const activities = [];

          // Add posts with interaction counts
          if (postsData.data) {
            for (const post of postsData.data) {
              // Fetch interaction counts for each post
              const [likes, dislikes, comments, shares] = await Promise.all([
                supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id).eq('reaction_type', 'like'),
                supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', post.id).eq('reaction_type', 'dislike'),
                supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', post.id),
                supabase.from('post_shares').select('*', { count: 'exact', head: true }).eq('post_id', post.id)
              ]);

              activities.push({
                type: 'post',
                user: post.user,
                content: post.content,
                created_at: post.created_at,
                id: `post-${post.id}`,
                data: {
                  ...post,
                  interactionCounts: {
                    likes: likes.count || 0,
                    dislikes: dislikes.count || 0,
                    comments: comments.count || 0,
                    shares: shares.count || 0
                  }
                }
              });
            }
          }

          // Add study groups
          if (studyGroupsData.data) {
            studyGroupsData.data.forEach(group => {
              activities.push({
                type: 'study_group',
                user: group.creator,
                content: `Created a new study group: ${group.name}`,
                created_at: group.created_at,
                id: `group-${group.id}`,
                data: group
              });
            });
          }

          // Add events
          if (eventsData.data) {
            eventsData.data.forEach(event => {
              activities.push({
                type: 'event',
                user: event.creator,
                content: `Created a new event: ${event.title}`,
                created_at: event.created_at,
                id: `event-${event.id}`,
                data: event
              });
            });
          }

          // Add reviews
          if (reviewsData.data) {
            reviewsData.data.forEach(review => {
              activities.push({
                type: 'review',
                user: review.reviewer,
                content: `Reviewed ${review.course_code || review.course_name}`,
                created_at: review.created_at,
                id: `review-${review.id}`,
                data: review
              });
            });
          }

          // Add resources
          if (resourcesData.data) {
            resourcesData.data.forEach(resource => {
              activities.push({
                type: 'resource',
                user: resource.uploader,
                content: `Shared a new resource: ${resource.title}`,
                created_at: resource.created_at,
                id: `resource-${resource.id}`,
                data: resource
              });
            });
          }

          // Sort by created_at and take the most recent 5
          activities.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setRecentActivity(activities.slice(0, 5));
        }

        // Fetch upcoming events (events user has RSVP'd to)
        const { data: userEvents } = await supabase
          .from('event_attendees')
          .select('event_id')
          .eq('user_id', user.id);

        if (userEvents && userEvents.length > 0) {
          const eventIds = userEvents.map(e => e.event_id);
          const { data: eventsData } = await supabase
            .from('events')
            .select('*')
            .in('id', eventIds)
            .gte('date', new Date().toISOString())
            .order('date', { ascending: true })
            .limit(3);

          setUpcomingEvents(eventsData || []);
        }

        // Fetch active study groups (user's groups with recent activity)
        const { data: userGroups } = await supabase
          .from('study_group_members')
          .select('group_id')
          .eq('user_id', user.id);

        if (userGroups && userGroups.length > 0) {
          const groupIds = userGroups.map(g => g.group_id);
          const { data: groupsData } = await supabase
            .from('study_groups')
            .select('*, study_group_members(count)')
            .in('id', groupIds)
            .order('created_at', { ascending: false })
            .limit(3);

          setActiveStudyGroups(groupsData || []);
        }

        // Fetch trending study groups (most members)
        const { data: popularGroups } = await supabase
          .from('study_groups')
          .select('*, study_group_members(count)')
          .order('created_at', { ascending: false })
          .limit(4);

        setTrendingGroups(popularGroups || []);

        // Fetch recent resources
        const { data: resourcesData } = await supabase
          .from('resources')
          .select('*, profiles!resources_user_id_fkey(*)')
          .order('created_at', { ascending: false })
          .limit(4);

        setRecentResources(resourcesData || []);

        // Calculate achievements
        const userAchievements = [];

        if (friendIds.length >= 10) {
          userAchievements.push({
            icon: FiUsers,
            title: 'Social Butterfly',
            description: 'Connected with 10+ students',
            color: 'text-blue-500'
          });
        }

        if (postsResult.count >= 5) {
          userAchievements.push({
            icon: FiMessageCircle,
            title: 'Active Contributor',
            description: 'Created 5+ posts',
            color: 'text-green-500'
          });
        }

        if (studyGroupsResult.count >= 3) {
          userAchievements.push({
            icon: FiBook,
            title: 'Study Champion',
            description: 'Joined 3+ study groups',
            color: 'text-purple-500'
          });
        }

        if (eventsResult.count >= 5) {
          userAchievements.push({
            icon: FiCalendar,
            title: 'Event Enthusiast',
            description: 'Attended 5+ events',
            color: 'text-orange-500'
          });
        }

        setAchievements(userAchievements);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);
  
  const handleFollowToggle = async (userId) => {
    // Update local state optimistically
    if (friends.includes(userId)) {
      setFriends(friends.filter(id => id !== userId));
      setFriendCount(prev => Math.max(0, prev - 1));
    } else {
      setFriends([...friends, userId]);
      setFriendCount(prev => prev + 1);
    }
  };
  
  // Redirect if not logged in (handled by router)
  if (!user) {
    return null;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 bg-gray-50 dark:bg-dark-bg py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced welcome section */}
          <div className="card p-8 mb-6">
            {/* Name Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl font-extrabold text-gray-900 dark:text-dark-text-primary">
                {user.username}
              </h1>
            </div>

            {/* Three Column Layout: Profile Details | Avatar | Network */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left Column - Profile Information */}
              <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-5 border border-gray-200 dark:border-dark-border hover:shadow-md transition-all duration-300">
                <h2 className="text-lg font-bold mb-4 flex items-center text-gray-900 dark:text-dark-text-primary">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-3">
                    <FiUser size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  Profile Details
                </h2>
                <ul className="space-y-3">
                  <li className="flex items-center p-3 rounded-lg bg-white dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-bg transition-all duration-200 group border border-gray-200 dark:border-dark-border">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg mr-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                      <FiMapPin size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-0.5">University</p>
                      {user.university ? (
                        <p className="font-semibold text-gray-900 dark:text-dark-text-primary">{user.university}</p>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic text-sm">Not specified</p>
                      )}
                    </div>
                  </li>
                  <li className="flex items-center p-3 rounded-lg bg-white dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-bg transition-all duration-200 group border border-gray-200 dark:border-dark-border">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg mr-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                      <FiBookOpen size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-0.5">Major</p>
                      {user.major ? (
                        <p className="font-semibold text-gray-900 dark:text-dark-text-primary">{user.major}</p>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic text-sm">Not specified</p>
                      )}
                    </div>
                  </li>
                  <li className="flex items-center p-3 rounded-lg bg-white dark:bg-dark-surface hover:bg-gray-100 dark:hover:bg-dark-bg transition-all duration-200 group border border-gray-200 dark:border-dark-border">
                    <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg mr-3 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/30 transition-colors">
                      <FiLinkedin size={18} className="text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-0.5">LinkedIn</p>
                      {user.linkedin_url ? (
                        <a
                          href={user.linkedin_url.startsWith('http') ? user.linkedin_url : `https://${user.linkedin_url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary-600 dark:text-primary-400 hover:underline flex items-center"
                        >
                          View Profile <FiArrowRight className="ml-1" size={14} />
                        </a>
                      ) : (
                        <p className="text-gray-400 dark:text-gray-500 italic text-sm">Not added</p>
                      )}
                    </div>
                  </li>
                </ul>
              </div>

              {/* Center Column - Avatar */}
              <div className="flex items-center justify-center">
                <div className="flex-shrink-0 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-primary-600 rounded-full blur-sm group-hover:blur-md transition-all duration-300"></div>
                  <div className="relative w-44 h-44 bg-white dark:bg-dark-surface rounded-full p-1 shadow-2xl border-4 border-gray-100 dark:border-dark-border">
                    <div className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white overflow-hidden">
                      {user.profile_image_url ? (
                        <img
                          src={user.profile_image_url}
                          alt={`${user.username}'s profile`}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <FiUser size={72} />
                      )}
                    </div>
                  </div>
                  {/* Online status indicator */}
                  <div className="absolute bottom-3 right-3 w-7 h-7 bg-green-400 border-4 border-white dark:border-dark-surface rounded-full shadow-lg"></div>
                </div>
              </div>

              {/* Right Column - Network & Bio */}
              <div className="bg-gray-50 dark:bg-dark-bg rounded-xl p-5 border border-gray-200 dark:border-dark-border hover:shadow-md transition-all duration-300">
                <h2 className="text-lg font-bold mb-4 flex items-center text-gray-900 dark:text-dark-text-primary">
                  <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg mr-3">
                    <FiUsers size={20} className="text-primary-600 dark:text-primary-400" />
                  </div>
                  Your Network
                </h2>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <Link
                    to={`/friends/${user.id}`}
                    className="bg-white dark:bg-dark-surface hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-dark-border p-4 rounded-xl transition-all duration-200 hover:shadow-md group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FiUsers className="text-2xl text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-3xl font-bold mb-1 text-gray-900 dark:text-dark-text-primary">{friendCount}</p>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">{friendCount === 1 ? 'Friend' : 'Friends'}</p>
                  </Link>

                  <button
                    onClick={() => navigate('/pending-requests')}
                    className="bg-white dark:bg-dark-surface hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-dark-border p-4 rounded-xl transition-all duration-200 hover:shadow-md relative group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <FiUserPlus className="text-2xl text-primary-600 dark:text-primary-400" />
                      {pendingRequestCount > 0 && (
                        <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg">
                          {pendingRequestCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary text-left">Friend Requests</p>
                  </button>
                </div>

                {/* Bio Section */}
                <div className="bg-white dark:bg-dark-surface rounded-lg p-4 border border-gray-200 dark:border-dark-border">
                  <h3 className="text-sm font-semibold mb-2 flex items-center text-gray-900 dark:text-dark-text-primary">
                    <FiEdit3 size={14} className="mr-2" />
                    Bio
                  </h3>
                  {user.bio ? (
                    <p className="text-sm text-gray-700 dark:text-dark-text-secondary leading-relaxed">{user.bio}</p>
                  ) : (
                    <p className="text-gray-400 dark:text-gray-500 italic text-sm">No bio added yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Enhanced Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Link
              to="/feeds"
              className="card p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 group bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-800"
            >
              <div className="flex items-center justify-center">
                <div className="p-2 bg-primary-100 dark:bg-primary-800/40 rounded-lg mr-3 group-hover:bg-primary-200 dark:group-hover:bg-primary-700/40 transition-colors">
                  <FiActivity className="text-primary-600 dark:text-primary-400" size={20} />
                </div>
                <span className="font-semibold text-primary-700 dark:text-primary-400">Activity Feed</span>
              </div>
            </Link>
            <Link
              to="/explore"
              className="card p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 group bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800"
            >
              <div className="flex items-center justify-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-800/40 rounded-lg mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-700/40 transition-colors">
                  <FiSearch className="text-purple-600 dark:text-purple-400" size={20} />
                </div>
                <span className="font-semibold text-purple-700 dark:text-purple-400">Explore Students</span>
              </div>
            </Link>
            <Link
              to={`/profile/${user.id}`}
              className="card p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 group bg-teal-50 dark:bg-teal-900/20 border-teal-100 dark:border-teal-800"
            >
              <div className="flex items-center justify-center">
                <div className="p-2 bg-teal-100 dark:bg-teal-800/40 rounded-lg mr-3 group-hover:bg-teal-200 dark:group-hover:bg-teal-700/40 transition-colors">
                  <FiUser className="text-teal-600 dark:text-teal-400" size={20} />
                </div>
                <span className="font-semibold text-teal-700 dark:text-teal-400">Your Profile</span>
              </div>
            </Link>
            <Link
              to="/edit-profile"
              className="card p-4 hover:shadow-lg transition-all duration-200 hover:scale-105 group bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800"
            >
              <div className="flex items-center justify-center">
                <div className="p-2 bg-orange-100 dark:bg-orange-800/40 rounded-lg mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-700/40 transition-colors">
                  <FiEdit3 className="text-orange-600 dark:text-orange-400" size={20} />
                </div>
                <span className="font-semibold text-orange-700 dark:text-orange-400">Edit Profile</span>
              </div>
            </Link>
          </div>

          {/* Activity Stats Cards */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              <FiActivity className="inline mr-2" />
              Your Activity
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Posts</p>
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300 mt-1">{stats.postsCount}</p>
                  </div>
                  <div className="p-3 bg-blue-200 dark:bg-blue-800/40 rounded-lg">
                    <FiMessageCircle className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Events Joined</p>
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300 mt-1">{stats.eventsCount}</p>
                  </div>
                  <div className="p-3 bg-green-200 dark:bg-green-800/40 rounded-lg">
                    <FiCalendar className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Study Groups</p>
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300 mt-1">{stats.studyGroupsCount}</p>
                  </div>
                  <div className="p-3 bg-purple-200 dark:bg-purple-800/40 rounded-lg">
                    <FiBook className="text-purple-600 dark:text-purple-400" size={24} />
                  </div>
                </div>
              </div>

              <div className="card p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-orange-200 dark:border-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">Resources Shared</p>
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-300 mt-1">{stats.resourcesCount}</p>
                  </div>
                  <div className="p-3 bg-orange-200 dark:bg-orange-800/40 rounded-lg">
                    <FiFile className="text-orange-600 dark:text-orange-400" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout for Activity & Widgets */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Takes 2/3 width */}
            <div className="lg:col-span-2 space-y-6">
              {/* Recent Activity Feed */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
                    <FiActivity className="mr-2" />
                    Recent Activity
                  </h3>
                  <Link to="/feeds" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    View All
                  </Link>
                </div>
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => {
                      // Determine icon and color based on activity type
                      let ActivityIcon = FiMessageSquare;
                      let iconColor = 'text-purple-600 dark:text-purple-400';
                      let bgColor = 'bg-purple-100 dark:bg-purple-900/30';

                      if (activity.type === 'study_group') {
                        ActivityIcon = FiUsers;
                        iconColor = 'text-primary-600 dark:text-primary-400';
                        bgColor = 'bg-primary-100 dark:bg-primary-900/30';
                      } else if (activity.type === 'event') {
                        ActivityIcon = FiCalendar;
                        iconColor = 'text-accent-teal';
                        bgColor = 'bg-accent-teal/10 dark:bg-accent-teal/20';
                      } else if (activity.type === 'review') {
                        ActivityIcon = FiStar;
                        iconColor = 'text-accent-sage';
                        bgColor = 'bg-accent-sage/10 dark:bg-accent-sage/20';
                      } else if (activity.type === 'resource') {
                        ActivityIcon = FiFile;
                        iconColor = 'text-accent-peach';
                        bgColor = 'bg-accent-peach/10 dark:bg-accent-peach/20';
                      }

                      return (
                        <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-200 dark:border-dark-border last:border-0">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white">
                              {activity.user?.profile_image_url ? (
                                <img
                                  src={activity.user.profile_image_url}
                                  alt={activity.user.username}
                                  className="w-full h-full object-cover rounded-full"
                                />
                              ) : (
                                <FiUser size={20} />
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                                {activity.user?.username || 'Unknown User'}
                              </p>
                              <div className={`p-1 ${bgColor} rounded`}>
                                <ActivityIcon className={iconColor} size={14} />
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-dark-text-secondary mt-1 line-clamp-2">
                              {activity.content}
                            </p>
                            {activity.type === 'post' && activity.data?.image_url && (
                              <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border">
                                <img
                                  src={activity.data.image_url}
                                  alt="Post attachment"
                                  className="w-full max-h-32 object-cover bg-gray-100 dark:bg-dark-bg"
                                />
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </p>
                              {activity.type === 'post' && activity.data?.interactionCounts && (
                                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                  <span className="flex items-center gap-1">
                                    <FiThumbsUp size={12} />
                                    {activity.data.interactionCounts.likes}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FiMessageCircle size={12} />
                                    {activity.data.interactionCounts.comments}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <FiShare2 size={12} />
                                    {activity.data.interactionCounts.shares}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-dark-text-secondary text-center py-8">
                    No recent activity from friends. Start connecting with other students!
                  </p>
                )}
              </div>

              {/* Upcoming Events */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
                    <FiCalendar className="mr-2" />
                    Upcoming Events
                  </h3>
                  <Link to="/events" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    View All
                  </Link>
                </div>
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <Link
                        key={event.id}
                        to={`/events/${event.id}`}
                        className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"
                      >
                        <div className="flex-shrink-0 p-2 bg-accent-teal/10 dark:bg-accent-teal/20 rounded-lg">
                          <FiCalendar className="text-accent-teal" size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                            {event.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                            {new Date(event.date).toLocaleDateString()} at {event.time}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {event.location}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-dark-text-secondary text-center py-8">
                    No upcoming events. Browse events to RSVP!
                  </p>
                )}
              </div>

              {/* Trending Groups */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
                    <FiTrendingUp className="mr-2" />
                    Popular Study Groups
                  </h3>
                  <Link to="/study-groups" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    View All
                  </Link>
                </div>
                {trendingGroups.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {trendingGroups.map((group) => (
                      <Link
                        key={group.id}
                        to={`/study-groups/${group.id}`}
                        className="p-4 border border-gray-200 dark:border-dark-border rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary line-clamp-1">
                            {group.name}
                          </h4>
                          <FiUsers className="text-primary-600 dark:text-primary-400 flex-shrink-0 ml-2" size={16} />
                        </div>
                        <p className="text-xs text-gray-600 dark:text-dark-text-secondary line-clamp-2">
                          {group.description}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <FiUsers size={12} className="mr-1" />
                          <span>{group.study_group_members?.[0]?.count || 0} members</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-dark-text-secondary text-center py-8">
                    No study groups available yet.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column - Takes 1/3 width */}
            <div className="space-y-6">
              {/* Achievements */}
              {achievements.length > 0 && (
                <div className="card p-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary flex items-center mb-4">
                    <FiAward className="mr-2" />
                    Achievements
                  </h3>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                        <div className={`flex-shrink-0 ${achievement.color}`}>
                          <achievement.icon size={24} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary">
                            {achievement.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-dark-text-secondary">
                            {achievement.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Study Groups */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
                    <FiBook className="mr-2" />
                    Your Groups
                  </h3>
                  <Link to="/study-groups" className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
                    View All
                  </Link>
                </div>
                {activeStudyGroups.length > 0 ? (
                  <div className="space-y-3">
                    {activeStudyGroups.map((group) => (
                      <Link
                        key={group.id}
                        to={`/study-groups/${group.id}`}
                        className="block p-3 border border-gray-200 dark:border-dark-border rounded-lg hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary">
                          {group.name}
                        </p>
                        <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                          <FiUsers size={12} className="mr-1" />
                          <span>{group.study_group_members?.[0]?.count || 0} members</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-dark-text-secondary text-sm py-4">
                    You haven't joined any study groups yet.
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-dark-text-primary mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Link
                    to="/feeds"
                    className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-400">Create Post</span>
                    <FiMessageCircle className="text-primary-600 dark:text-primary-400" size={18} />
                  </Link>
                  <Link
                    to="/events"
                    className="flex items-center justify-between p-3 bg-accent-teal/10 dark:bg-accent-teal/20 rounded-lg hover:bg-accent-teal/20 dark:hover:bg-accent-teal/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-accent-teal dark:text-accent-teal">Create Event</span>
                    <FiCalendar className="text-accent-teal" size={18} />
                  </Link>
                  <Link
                    to="/study-groups"
                    className="flex items-center justify-between p-3 bg-accent-sage/10 dark:bg-accent-sage/20 rounded-lg hover:bg-accent-sage/20 dark:hover:bg-accent-sage/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-accent-sage dark:text-accent-sage">Create Group</span>
                    <FiUsers className="text-accent-sage" size={18} />
                  </Link>
                  <Link
                    to="/resources"
                    className="flex items-center justify-between p-3 bg-accent-peach/10 dark:bg-accent-peach/20 rounded-lg hover:bg-accent-peach/20 dark:hover:bg-accent-peach/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-accent-peach dark:text-accent-peach">Share Resource</span>
                    <FiFile className="text-accent-peach" size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Resources */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary flex items-center">
                <FiFile className="mr-2" />
                Recent Resources
              </h2>
              <Link to="/resources" className="text-sm text-primary-600 dark:text-primary-400 hover:underline flex items-center">
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>
            {recentResources.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentResources.map((resource) => (
                  <div key={resource.id} className="card p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="p-2 bg-accent-peach/10 dark:bg-accent-peach/20 rounded-lg">
                        <FiFile className="text-accent-peach" size={20} />
                      </div>
                      <span className="text-xs px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded">
                        {resource.type || 'Resource'}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-dark-text-primary mb-2 line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-dark-text-secondary mb-3 line-clamp-2">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center">
                        <FiUser size={12} className="mr-1" />
                        {resource.profiles?.username || 'Anonymous'}
                      </span>
                      <Link
                        to={`/resources/${resource.id}`}
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card p-8 text-center">
                <p className="text-gray-500 dark:text-dark-text-secondary">
                  No resources available yet. Be the first to share!
                </p>
              </div>
            )}
          </div>

          {/* Quick Access Features */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary mb-4">
              Quick Access
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <Link
                to="/study-groups"
                className="card p-4 sm:p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800/40 transition-colors">
                    <FiUsers className="text-primary-600 dark:text-primary-400" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                  Study Groups
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Join or create study groups with classmates
                </p>
              </Link>

              <Link
                to="/events"
                className="card p-4 sm:p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-accent-teal/10 dark:bg-accent-teal/20 rounded-lg group-hover:bg-accent-teal/20 dark:group-hover:bg-accent-teal/30 transition-colors">
                    <FiCalendar className="text-accent-teal" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                  Campus Events
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Discover and RSVP to campus activities
                </p>
              </Link>

              <Link
                to="/course-reviews"
                className="card p-4 sm:p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-accent-sage/10 dark:bg-accent-sage/20 rounded-lg group-hover:bg-accent-sage/20 dark:group-hover:bg-accent-sage/30 transition-colors">
                    <FiBook className="text-accent-sage" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                  Course Reviews
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Read and share course reviews
                </p>
              </Link>

              <Link
                to="/resources"
                className="card p-4 sm:p-6 hover:shadow-lg transition-shadow group"
              >
                <div className="flex items-center mb-3">
                  <div className="p-3 bg-accent-peach/10 dark:bg-accent-peach/20 rounded-lg group-hover:bg-accent-peach/20 dark:group-hover:bg-accent-peach/30 transition-colors">
                    <FiFile className="text-accent-peach" size={24} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                  Resources
                </h3>
                <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                  Access and share study materials
                </p>
              </Link>
            </div>

          </div>

          {/* Suggested connections section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                <FiUserPlus className="inline mr-2" />
                Suggested Connections
              </h2>
              <Link
                to="/explore"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium inline-flex items-center"
              >
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>

            {suggestedUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {suggestedUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={friends.includes(user.id)}
                    onFollowToggle={handleFollowToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-dark-border p-8 text-center">
                <p className="text-gray-500 dark:text-dark-text-secondary">
                  {user.major
                    ? "We don't have any suggestions based on your major yet"
                    : "Add your major to get personalized suggestions"}
                </p>
              </div>
            )}
          </div>
          
          {/* Recent users section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-dark-text-primary">
                <FiUsers className="inline mr-2" />
                Recently Joined
              </h2>
              <Link
                to="/explore"
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 text-sm font-medium inline-flex items-center"
              >
                View All <FiArrowRight className="ml-1" />
              </Link>
            </div>

            {recentUsers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentUsers.map(user => (
                  <UserCard
                    key={user.id}
                    user={user}
                    isFollowing={friends.includes(user.id)}
                    onFollowToggle={handleFollowToggle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm dark:shadow-none border border-gray-200 dark:border-dark-border p-8 text-center">
                <p className="text-gray-500 dark:text-dark-text-secondary">
                  No new users to show at the moment
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}