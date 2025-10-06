-- Row Level Security (RLS) Policies
-- Run this AFTER schema.sql in your Supabase SQL Editor

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
-- Anyone can view profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- =============================================
-- FOLLOWS POLICIES
-- =============================================
-- Anyone can view follows
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT
  USING (true);

-- Users can follow others
CREATE POLICY "Users can create follows"
  ON public.follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

-- Users can unfollow
CREATE POLICY "Users can delete own follows"
  ON public.follows FOR DELETE
  USING (auth.uid() = follower_id);

-- =============================================
-- STUDY GROUPS POLICIES
-- =============================================
-- Anyone can view active study groups
CREATE POLICY "Study groups are viewable by everyone"
  ON public.study_groups FOR SELECT
  USING (true);

-- Authenticated users can create study groups
CREATE POLICY "Authenticated users can create study groups"
  ON public.study_groups FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their study groups
CREATE POLICY "Creators can update own study groups"
  ON public.study_groups FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their study groups
CREATE POLICY "Creators can delete own study groups"
  ON public.study_groups FOR DELETE
  USING (auth.uid() = creator_id);

-- =============================================
-- STUDY GROUP MEMBERS POLICIES
-- =============================================
-- Anyone can view group members
CREATE POLICY "Study group members are viewable by everyone"
  ON public.study_group_members FOR SELECT
  USING (true);

-- Users can join study groups
CREATE POLICY "Users can join study groups"
  ON public.study_group_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can leave study groups
CREATE POLICY "Users can leave study groups"
  ON public.study_group_members FOR DELETE
  USING (auth.uid() = user_id);

-- Group admins can manage members
CREATE POLICY "Group admins can manage members"
  ON public.study_group_members FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.study_group_members
      WHERE group_id = study_group_members.group_id
        AND user_id = auth.uid()
        AND role = 'admin'
    )
  );

-- =============================================
-- EVENTS POLICIES
-- =============================================
-- Anyone can view active events
CREATE POLICY "Events are viewable by everyone"
  ON public.events FOR SELECT
  USING (true);

-- Authenticated users can create events
CREATE POLICY "Authenticated users can create events"
  ON public.events FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

-- Creators can update their events
CREATE POLICY "Creators can update own events"
  ON public.events FOR UPDATE
  USING (auth.uid() = creator_id);

-- Creators can delete their events
CREATE POLICY "Creators can delete own events"
  ON public.events FOR DELETE
  USING (auth.uid() = creator_id);

-- =============================================
-- EVENT RSVPS POLICIES
-- =============================================
-- Anyone can view event RSVPs
CREATE POLICY "Event RSVPs are viewable by everyone"
  ON public.event_rsvps FOR SELECT
  USING (true);

-- Users can RSVP to events
CREATE POLICY "Users can RSVP to events"
  ON public.event_rsvps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own RSVPs
CREATE POLICY "Users can update own RSVPs"
  ON public.event_rsvps FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their RSVPs
CREATE POLICY "Users can delete own RSVPs"
  ON public.event_rsvps FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- COURSE REVIEWS POLICIES
-- =============================================
-- Anyone can view course reviews
CREATE POLICY "Course reviews are viewable by everyone"
  ON public.course_reviews FOR SELECT
  USING (true);

-- Authenticated users can create reviews
CREATE POLICY "Authenticated users can create reviews"
  ON public.course_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.course_reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.course_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- REVIEW VOTES POLICIES
-- =============================================
-- Anyone can view review votes
CREATE POLICY "Review votes are viewable by everyone"
  ON public.review_votes FOR SELECT
  USING (true);

-- Users can vote on reviews
CREATE POLICY "Users can vote on reviews"
  ON public.review_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their votes
CREATE POLICY "Users can update own votes"
  ON public.review_votes FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their votes
CREATE POLICY "Users can delete own votes"
  ON public.review_votes FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- RESOURCES POLICIES
-- =============================================
-- Anyone can view resources
CREATE POLICY "Resources are viewable by everyone"
  ON public.resources FOR SELECT
  USING (true);

-- Authenticated users can upload resources
CREATE POLICY "Authenticated users can upload resources"
  ON public.resources FOR INSERT
  WITH CHECK (auth.uid() = uploader_id);

-- Uploaders can update their resources
CREATE POLICY "Uploaders can update own resources"
  ON public.resources FOR UPDATE
  USING (auth.uid() = uploader_id);

-- Uploaders can delete their resources
CREATE POLICY "Uploaders can delete own resources"
  ON public.resources FOR DELETE
  USING (auth.uid() = uploader_id);

-- =============================================
-- MESSAGES POLICIES
-- =============================================
-- Users can view messages they sent or received
CREATE POLICY "Users can view own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Users can send messages
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Users can update messages they sent
CREATE POLICY "Senders can update own messages"
  ON public.messages FOR UPDATE
  USING (auth.uid() = sender_id);

-- Users can delete messages they sent
CREATE POLICY "Senders can delete own messages"
  ON public.messages FOR DELETE
  USING (auth.uid() = sender_id);
