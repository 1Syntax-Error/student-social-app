-- Add image support to posts
-- Run this in your Supabase SQL Editor

-- Add image_url column to posts table
ALTER TABLE public.posts
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS posts_image_url_idx ON public.posts(image_url)
WHERE image_url IS NOT NULL;
