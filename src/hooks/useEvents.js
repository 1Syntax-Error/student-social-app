// src/hooks/useEvents.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService } from '../services/eventService';

export const eventKeys = {
  all: ['events'],
  lists: () => [...eventKeys.all, 'list'],
  list: (filters) => [...eventKeys.lists(), filters],
  details: () => [...eventKeys.all, 'detail'],
  detail: (id) => [...eventKeys.details(), id],
  userRsvps: (userId) => [...eventKeys.all, 'rsvps', userId],
};

// Get all events
export function useEvents(filters = {}) {
  return useQuery({
    queryKey: eventKeys.list(filters),
    queryFn: () => eventService.getEvents(filters),
  });
}

// Get single event
export function useEvent(eventId) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => eventService.getEvent(eventId),
    enabled: !!eventId,
  });
}

// Get user's RSVPs
export function useUserRsvps(userId) {
  return useQuery({
    queryKey: eventKeys.userRsvps(userId),
    queryFn: () => eventService.getUserRsvps(userId),
    enabled: !!userId,
  });
}

// Create event
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventData) => eventService.createEvent(eventData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
    },
  });
}

// RSVP to event
export function useRsvpEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId, status }) => eventService.rsvpToEvent(eventId, userId, status),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.userRsvps(variables.userId) });
    },
  });
}

// Cancel RSVP
export function useCancelRsvp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, userId }) => eventService.cancelRsvp(eventId, userId),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(variables.eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.userRsvps(variables.userId) });
    },
  });
}
