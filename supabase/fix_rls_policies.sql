-- Fix RLS Policies for follows and friend_requests tables
-- Run this in your Supabase SQL Editor

-- =============================================
-- FIX FOLLOWS TABLE RLS POLICIES
-- =============================================

-- Enable RLS on follows table (in case it's not enabled)
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Drop the old restrictive delete policy
DROP POLICY IF EXISTS "Users can delete own follows" ON public.follows;

-- Create new policy that allows users to delete follows where they are EITHER the follower OR the following
-- This is needed for unfriending, where both directions need to be deleted
CREATE POLICY "Users can delete follows involving themselves"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

-- =============================================
-- ADD FRIEND_REQUESTS TABLE RLS POLICIES
-- =============================================

-- Enable RLS on friend_requests table
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- Anyone can view friend requests they are involved in (sender or receiver)
CREATE POLICY "Users can view friend requests involving themselves"
  ON public.friend_requests FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can send friend requests
CREATE POLICY "Users can send friend requests"
  ON public.friend_requests FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update friend requests where they are the receiver (to accept/decline)
CREATE POLICY "Receivers can update friend requests"
  ON public.friend_requests FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Users can delete friend requests they sent (to cancel)
-- Users can also delete accepted/declined requests where they are involved
CREATE POLICY "Users can delete friend requests involving themselves"
  ON public.friend_requests FOR DELETE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
