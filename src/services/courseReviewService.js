// src/services/courseReviewService.js
import { supabase } from '../utils/supabaseClient';

export const courseReviewService = {
  // Get all course reviews with filters
  async getCourseReviews(filters = {}) {
    let query = supabase
      .from('course_reviews')
      .select(`
        *,
        user:profiles!user_id(username, full_name, major),
        votes:review_votes(count)
      `);

    if (filters.course_code) {
      query = query.eq('course_code', filters.course_code);
    }
    if (filters.professor) {
      query = query.ilike('professor_name', `%${filters.professor}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single review by ID
  async getCourseReview(reviewId) {
    const { data, error } = await supabase
      .from('course_reviews')
      .select(`
        *,
        user:profiles!user_id(*),
        votes:review_votes(
          *,
          user:profiles(*)
        )
      `)
      .eq('id', reviewId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create course review
  async createCourseReview(reviewData) {
    const { data, error } = await supabase
      .from('course_reviews')
      .insert(reviewData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update course review
  async updateCourseReview(reviewId, updates) {
    const { data, error } = await supabase
      .from('course_reviews')
      .update(updates)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete course review
  async deleteCourseReview(reviewId) {
    const { error } = await supabase
      .from('course_reviews')
      .delete()
      .eq('id', reviewId);

    if (error) throw error;
  },

  // Vote on review
  async voteOnReview(reviewId, userId, isHelpful = true) {
    const { data, error } = await supabase
      .from('review_votes')
      .upsert(
        { review_id: reviewId, user_id: userId, is_helpful: isHelpful },
        { onConflict: 'review_id,user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove vote
  async removeVote(reviewId, userId) {
    const { error } = await supabase
      .from('review_votes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get course statistics
  async getCourseStats(courseCode) {
    const { data, error } = await supabase
      .from('course_reviews')
      .select('rating, difficulty, would_take_again')
      .eq('course_code', courseCode);

    if (error) throw error;

    if (!data || data.length === 0) {
      return {
        avgRating: 0,
        avgDifficulty: 0,
        totalReviews: 0,
        wouldTakeAgainPercent: 0
      };
    }

    const stats = {
      avgRating: data.reduce((sum, r) => sum + r.rating, 0) / data.length,
      avgDifficulty: data.reduce((sum, r) => sum + r.difficulty, 0) / data.length,
      totalReviews: data.length,
      wouldTakeAgainPercent: (data.filter(r => r.would_take_again).length / data.length) * 100
    };

    return stats;
  }
};
