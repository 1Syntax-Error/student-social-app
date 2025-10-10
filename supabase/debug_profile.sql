-- Debug script to check profile and RLS
-- Run this in your Supabase SQL Editor

-- 1. Check if the profile exists
SELECT
  'Profile exists check' as test,
  id, username, email, full_name, profile_image_url
FROM public.profiles
WHERE id = 'f24f09ab-f94f-4dd0-afec-d4bf5949b240';

-- 2. Check if RLS is enabled
SELECT
  'RLS status' as test,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- 3. List all RLS policies on profiles table
SELECT
  'RLS policies' as test,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'profiles';

-- 4. Check if auth.users record exists
SELECT
  'Auth user exists' as test,
  id, email, created_at
FROM auth.users
WHERE id = 'f24f09ab-f94f-4dd0-afec-d4bf5949b240';

-- 5. Count total profiles
SELECT
  'Total profiles' as test,
  COUNT(*) as count
FROM public.profiles;
