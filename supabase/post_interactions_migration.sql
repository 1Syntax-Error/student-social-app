-- Post Interactions Migration
-- Add likes, dislikes, comments, and shares functionality to posts
-- Run this in your Supabase SQL Editor

-- =============================================
-- POST LIKES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS post_likes_post_id_idx ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS post_likes_user_id_idx ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS post_likes_reaction_type_idx ON public.post_likes(reaction_type);

-- =============================================
-- POST COMMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 300),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS post_comments_post_id_idx ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS post_comments_user_id_idx ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS post_comments_created_at_idx ON public.post_comments(created_at DESC);

-- =============================================
-- POST SHARES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.post_shares (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS post_shares_post_id_idx ON public.post_shares(post_id);
CREATE INDEX IF NOT EXISTS post_shares_user_id_idx ON public.post_shares(user_id);

-- =============================================
-- RLS POLICIES FOR POST LIKES
-- =============================================

-- Enable RLS
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view likes
CREATE POLICY "Post likes are viewable by everyone"
  ON public.post_likes
  FOR SELECT
  USING (true);

-- Allow authenticated users to create likes
CREATE POLICY "Users can create post likes"
  ON public.post_likes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own likes (change reaction)
CREATE POLICY "Users can update their own post likes"
  ON public.post_likes
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own likes
CREATE POLICY "Users can delete their own post likes"
  ON public.post_likes
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES FOR POST COMMENTS
-- =============================================

-- Enable RLS
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view comments
CREATE POLICY "Post comments are viewable by everyone"
  ON public.post_comments
  FOR SELECT
  USING (true);

-- Allow authenticated users to create comments
CREATE POLICY "Users can create post comments"
  ON public.post_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own comments
CREATE POLICY "Users can update their own post comments"
  ON public.post_comments
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own comments
CREATE POLICY "Users can delete their own post comments"
  ON public.post_comments
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RLS POLICIES FOR POST SHARES
-- =============================================

-- Enable RLS
ALTER TABLE public.post_shares ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view shares
CREATE POLICY "Post shares are viewable by everyone"
  ON public.post_shares
  FOR SELECT
  USING (true);

-- Allow authenticated users to create shares
CREATE POLICY "Users can create post shares"
  ON public.post_shares
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own shares
CREATE POLICY "Users can delete their own post shares"
  ON public.post_shares
  FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- FUNCTION TO UPDATE updated_at FOR COMMENTS
-- =============================================

-- Create or replace function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_post_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS post_comments_updated_at_trigger ON public.post_comments;
CREATE TRIGGER post_comments_updated_at_trigger
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_updated_at();
