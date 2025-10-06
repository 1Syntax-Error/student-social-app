// src/hooks/useProfiles.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { profileService } from '../services/profileService';

// Query keys for cache management
export const profileKeys = {
  all: ['profiles'],
  lists: () => [...profileKeys.all, 'list'],
  list: (filters) => [...profileKeys.lists(), filters],
  details: () => [...profileKeys.all, 'detail'],
  detail: (id) => [...profileKeys.details(), id],
  followers: (id) => [...profileKeys.all, 'followers', id],
  following: (id) => [...profileKeys.all, 'following', id],
};

// Get single profile
export function useProfile(userId) {
  return useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => profileService.getProfile(userId),
    enabled: !!userId,
  });
}

// Get all profiles with filters
export function useProfiles(filters = {}) {
  return useQuery({
    queryKey: profileKeys.list(filters),
    queryFn: () => profileService.getProfiles(filters),
  });
}

// Get followers
export function useFollowers(userId) {
  return useQuery({
    queryKey: profileKeys.followers(userId),
    queryFn: () => profileService.getFollowers(userId),
    enabled: !!userId,
  });
}

// Get following
export function useFollowing(userId) {
  return useQuery({
    queryKey: profileKeys.following(userId),
    queryFn: () => profileService.getFollowing(userId),
    enabled: !!userId,
  });
}

// Follow/unfollow mutation
export function useFollowUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ followerId, followingId, action }) => {
      if (action === 'follow') {
        return profileService.followUser(followerId, followingId);
      } else {
        return profileService.unfollowUser(followerId, followingId);
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate followers/following queries to refetch
      queryClient.invalidateQueries({ queryKey: profileKeys.followers(variables.followingId) });
      queryClient.invalidateQueries({ queryKey: profileKeys.following(variables.followerId) });
    },
  });
}

// Update profile mutation
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }) => profileService.updateProfile(userId, updates),
    onSuccess: (data, variables) => {
      // Update the cache with new profile data
      queryClient.setQueryData(profileKeys.detail(variables.userId), data);
      // Invalidate profile lists to refetch
      queryClient.invalidateQueries({ queryKey: profileKeys.lists() });
    },
  });
}
