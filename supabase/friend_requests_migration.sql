-- Friend Requests Migration
-- Run this in your Supabase SQL Editor to add friend request functionality

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS public.friend_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id),
  CHECK (sender_id != receiver_id)
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON public.friend_requests(receiver_id, status);
CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON public.friend_requests(sender_id, status);

-- Add trigger for updated_at
CREATE TRIGGER update_friend_requests_updated_at BEFORE UPDATE ON public.friend_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create follow relationship when friend request is accepted
CREATE OR REPLACE FUNCTION handle_friend_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- If status changed to 'accepted', create mutual follow relationships
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    -- Create follow from sender to receiver
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (NEW.sender_id, NEW.receiver_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;

    -- Create follow from receiver to sender (mutual connection)
    INSERT INTO public.follows (follower_id, following_id)
    VALUES (NEW.receiver_id, NEW.sender_id)
    ON CONFLICT (follower_id, following_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create follow relationships on acceptance
CREATE TRIGGER on_friend_request_accepted
  AFTER UPDATE ON public.friend_requests
  FOR EACH ROW
  EXECUTE FUNCTION handle_friend_request_accepted();
