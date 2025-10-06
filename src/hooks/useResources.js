// src/hooks/useResources.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceService } from '../services/resourceService';

export const resourceKeys = {
  all: ['resources'],
  lists: () => [...resourceKeys.all, 'list'],
  list: (filters) => [...resourceKeys.lists(), filters],
  details: () => [...resourceKeys.all, 'detail'],
  detail: (id) => [...resourceKeys.details(), id],
};

// Get all resources
export function useResources(filters = {}) {
  return useQuery({
    queryKey: resourceKeys.list(filters),
    queryFn: () => resourceService.getResources(filters),
  });
}

// Get single resource
export function useResource(resourceId) {
  return useQuery({
    queryKey: resourceKeys.detail(resourceId),
    queryFn: () => resourceService.getResource(resourceId),
    enabled: !!resourceId,
  });
}

// Create resource
export function useCreateResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceData) => resourceService.createResource(resourceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

// Delete resource
export function useDeleteResource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId) => resourceService.deleteResource(resourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.lists() });
    },
  });
}

// Increment download count
export function useIncrementDownload() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (resourceId) => resourceService.incrementDownloadCount(resourceId),
    onSuccess: (data, resourceId) => {
      queryClient.invalidateQueries({ queryKey: resourceKeys.detail(resourceId) });
    },
  });
}
