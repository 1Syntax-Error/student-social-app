// src/hooks/useStudyGroups.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studyGroupService } from '../services/studyGroupService';

export const studyGroupKeys = {
  all: ['study-groups'],
  lists: () => [...studyGroupKeys.all, 'list'],
  list: (filters) => [...studyGroupKeys.lists(), filters],
  details: () => [...studyGroupKeys.all, 'detail'],
  detail: (id) => [...studyGroupKeys.details(), id],
  userGroups: (userId) => [...studyGroupKeys.all, 'user', userId],
};

// Get all study groups
export function useStudyGroups(filters = {}) {
  return useQuery({
    queryKey: studyGroupKeys.list(filters),
    queryFn: () => studyGroupService.getStudyGroups(filters),
  });
}

// Get single study group
export function useStudyGroup(groupId) {
  return useQuery({
    queryKey: studyGroupKeys.detail(groupId),
    queryFn: () => studyGroupService.getStudyGroup(groupId),
    enabled: !!groupId,
  });
}

// Get user's study groups
export function useUserStudyGroups(userId) {
  return useQuery({
    queryKey: studyGroupKeys.userGroups(userId),
    queryFn: () => studyGroupService.getUserStudyGroups(userId),
    enabled: !!userId,
  });
}

// Create study group
export function useCreateStudyGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupData) => studyGroupService.createStudyGroup(groupData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.lists() });
    },
  });
}

// Join study group
export function useJoinStudyGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }) => studyGroupService.joinStudyGroup(groupId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.detail(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.userGroups(variables.userId) });
    },
  });
}

// Leave study group
export function useLeaveStudyGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, userId }) => studyGroupService.leaveStudyGroup(groupId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.detail(variables.groupId) });
      queryClient.invalidateQueries({ queryKey: studyGroupKeys.userGroups(variables.userId) });
    },
  });
}
