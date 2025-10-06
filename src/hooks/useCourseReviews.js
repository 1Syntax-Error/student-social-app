// src/hooks/useCourseReviews.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseReviewService } from '../services/courseReviewService';

export const reviewKeys = {
  all: ['reviews'],
  lists: () => [...reviewKeys.all, 'list'],
  list: (filters) => [...reviewKeys.lists(), filters],
  details: () => [...reviewKeys.all, 'detail'],
  detail: (id) => [...reviewKeys.details(), id],
  stats: (courseCode) => [...reviewKeys.all, 'stats', courseCode],
};

// Get all course reviews
export function useCourseReviews(filters = {}) {
  return useQuery({
    queryKey: reviewKeys.list(filters),
    queryFn: () => courseReviewService.getCourseReviews(filters),
  });
}

// Get single review
export function useCourseReview(reviewId) {
  return useQuery({
    queryKey: reviewKeys.detail(reviewId),
    queryFn: () => courseReviewService.getCourseReview(reviewId),
    enabled: !!reviewId,
  });
}

// Get course statistics
export function useCourseStats(courseCode) {
  return useQuery({
    queryKey: reviewKeys.stats(courseCode),
    queryFn: () => courseReviewService.getCourseStats(courseCode),
    enabled: !!courseCode,
  });
}

// Create review
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewData) => courseReviewService.createCourseReview(reviewData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      if (data.course_code) {
        queryClient.invalidateQueries({ queryKey: reviewKeys.stats(data.course_code) });
      }
    },
  });
}

// Vote on review
export function useVoteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, userId, isHelpful }) =>
      courseReviewService.voteOnReview(reviewId, userId, isHelpful),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.detail(variables.reviewId) });
    },
  });
}
