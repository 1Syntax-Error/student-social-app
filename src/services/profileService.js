// src/services/profileService.js
import { supabase } from '../utils/supabaseClient';
import { getCachedUserProfile, cacheUserProfile, sessionCache } from '../utils/cache';

export const profileService = {
  // Get profile by user ID with caching
  async getProfile(userId, useCache = true) {
    if (useCache) {
      // Try cache first
      const cached = getCachedUserProfile(userId);
      if (cached) {
        console.log(`Profile cache hit for user ${userId}`);
        return cached;
      }
    }

    // Fetch from database
    console.log(`Fetching profile from database for user ${userId}`);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    // Cache the result
    if (data) {
      cacheUserProfile(userId, data);
    }

    return data;
  },

  // Get all profiles with optional filters (cached in session)
  async getProfiles(filters = {}) {
    // Create cache key from filters
    const cacheKey = `profiles_${JSON.stringify(filters)}`;

    // Check session cache for this query
    const cached = sessionCache.get(cacheKey);
    if (cached) {
      console.log('Profiles cache hit for filters:', filters);
      return cached;
    }

    let query = supabase.from('profiles').select('*');

    if (filters.major) {
      query = query.eq('major', filters.major);
    }
    if (filters.year_level) {
      query = query.eq('year_level', filters.year_level);
    }
    if (filters.search) {
      query = query.or(`username.ilike.%${filters.search}%,full_name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    // Cache results in session storage (temporary)
    if (data) {
      sessionCache.set(cacheKey, data);
    }

    return data;
  },

  // Update profile and invalidate cache
  async updateProfile(userId, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    // Update cache with new data
    if (data) {
      cacheUserProfile(userId, data);
      // Also clear session cache for profile lists
      sessionCache.clear();
    }

    return data;
  },

  // Get follower count
  async getFollowerCount(userId) {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);

    if (error) throw error;
    return count;
  },

  // Get following count
  async getFollowingCount(userId) {
    const { count, error } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);

    if (error) throw error;
    return count;
  },

  // Check if user is following another user
  async isFollowing(followerId, followingId) {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
    return !!data;
  },

  // Follow a user
  async followUser(followerId, followingId) {
    const { data, error } = await supabase
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Unfollow a user
  async unfollowUser(followerId, followingId) {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  },

  // Get followers list
  async getFollowers(userId) {
    const { data, error } = await supabase
      .from('follows')
      .select('follower:profiles!follower_id(*)')
      .eq('following_id', userId);

    if (error) throw error;
    return data.map(f => f.follower);
  },

  // Get following list
  async getFollowing(userId) {
    const { data, error } = await supabase
      .from('follows')
      .select('following:profiles!following_id(*)')
      .eq('follower_id', userId);

    if (error) throw error;
    return data.map(f => f.following);
  }
};
