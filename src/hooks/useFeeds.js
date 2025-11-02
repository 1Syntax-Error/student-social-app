import { useQuery } from '@tanstack/react-query';
import { supabase } from '../utils/supabaseClient';

export const feedKeys = {
  all: ['feeds'],
  feed: (userId) => [...feedKeys.all, userId],
};

// Fetch activity feed
export function useActivityFeed(userId) {
  return useQuery({
    queryKey: feedKeys.feed(userId),
    queryFn: async () => {
      if (!userId) return { personalizedFeed: [], globalFeed: [] };

      // Fetch user's friends
      const { data: friendsData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', userId);

      const friendIds = friendsData ? friendsData.map(f => f.following_id) : [];

      // Fetch all recent activity in parallel
      const [studyGroupsRes, eventsRes, reviewsRes, resourcesRes, postsRes] = await Promise.all([
        // Study groups
        supabase
          .from('study_groups')
          .select(`
            id,
            name,
            course_code,
            course_name,
            created_at,
            creator_id,
            creator:profiles!study_groups_creator_id_fkey(username, university, profile_image_url)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20),

        // Events
        supabase
          .from('events')
          .select(`
            id,
            title,
            event_type,
            start_time,
            created_at,
            creator_id,
            image_url,
            creator:profiles!events_creator_id_fkey(username, university, profile_image_url)
          `)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(20),

        // Course reviews
        supabase
          .from('course_reviews')
          .select(`
            id,
            course_code,
            course_name,
            rating,
            review_text,
            created_at,
            user_id,
            reviewer:profiles!course_reviews_user_id_fkey(username, university, profile_image_url)
          `)
          .order('created_at', { ascending: false })
          .limit(20),

        // Resources
        supabase
          .from('resources')
          .select(`
            id,
            title,
            resource_type,
            course_code,
            created_at,
            uploader_id,
            uploader:profiles(username, university, profile_image_url)
          `)
          .order('created_at', { ascending: false })
          .limit(20),

        // Posts
        supabase
          .from('posts')
          .select(`
            id,
            content,
            image_url,
            created_at,
            user_id,
            user:profiles!posts_user_id_fkey(username, university, profile_image_url, full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(30)
      ]);

      const feedItems = [];

      // Process study groups
      if (studyGroupsRes.data) {
        studyGroupsRes.data.forEach(group => {
          feedItems.push({
            id: `group-${group.id}`,
            type: 'study_group',
            data: group,
            timestamp: new Date(group.created_at),
            userId: group.creator_id,
            isFriend: friendIds.includes(group.creator_id)
          });
        });
      }

      // Process events
      if (eventsRes.data) {
        eventsRes.data.forEach(event => {
          feedItems.push({
            id: `event-${event.id}`,
            type: 'event',
            data: event,
            timestamp: new Date(event.created_at),
            userId: event.creator_id,
            isFriend: friendIds.includes(event.creator_id)
          });
        });
      }

      // Process reviews
      if (reviewsRes.data) {
        reviewsRes.data.forEach(review => {
          feedItems.push({
            id: `review-${review.id}`,
            type: 'review',
            data: review,
            timestamp: new Date(review.created_at),
            userId: review.user_id,
            isFriend: friendIds.includes(review.user_id)
          });
        });
      }

      // Process resources
      if (resourcesRes.data) {
        resourcesRes.data.forEach(resource => {
          feedItems.push({
            id: `resource-${resource.id}`,
            type: 'resource',
            data: resource,
            timestamp: new Date(resource.created_at),
            userId: resource.uploader_id,
            isFriend: friendIds.includes(resource.uploader_id)
          });
        });
      }

      // Process posts with interaction counts
      if (postsRes.data) {
        // Get detailed counts per post
        const getCountsForPost = async (postId) => {
          const [likes, dislikes, comments] = await Promise.all([
            supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId).eq('reaction_type', 'like'),
            supabase.from('post_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId).eq('reaction_type', 'dislike'),
            supabase.from('post_comments').select('*', { count: 'exact', head: true }).eq('post_id', postId)
          ]);

          return {
            likes: likes.count || 0,
            dislikes: dislikes.count || 0,
            comments: comments.count || 0
          };
        };

        for (const post of postsRes.data) {
          const counts = await getCountsForPost(post.id);

          feedItems.push({
            id: `post-${post.id}`,
            type: 'post',
            data: {
              ...post,
              interactionCounts: counts
            },
            timestamp: new Date(post.created_at),
            userId: post.user_id,
            isFriend: friendIds.includes(post.user_id)
          });
        }
      }

      // Sort all feed items by timestamp
      feedItems.sort((a, b) => b.timestamp - a.timestamp);

      // Split into personalized (friends) and global feeds
      const personalized = feedItems.filter(item => item.isFriend);
      const global = feedItems.filter(item => !item.isFriend);

      return {
        personalizedFeed: personalized,
        globalFeed: global,
        friendIds
      };
    },
    staleTime: 3 * 60 * 1000, // 3 minutes - feeds should be relatively fresh
    enabled: !!userId
  });
}
