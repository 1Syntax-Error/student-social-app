-- Migration: Update profile fields to match current schema
-- Run this in your Supabase SQL Editor

-- Add profile_image_url column if it doesn't exist (rename from avatar_url if needed)
DO $$
BEGIN
  -- Check if avatar_url exists and profile_image_url doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'avatar_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN avatar_url TO profile_image_url;
    RAISE NOTICE 'Renamed avatar_url to profile_image_url';
  END IF;

  -- Add profile_image_url if neither exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'profile_image_url'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN profile_image_url TEXT;
    RAISE NOTICE 'Added profile_image_url column';
  END IF;
END $$;

-- Add full_name column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'full_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
    RAISE NOTICE 'Added full_name column';
  END IF;
END $$;

-- Migrate firstName and lastName to full_name if they exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'firstName'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'lastName'
  ) THEN
    -- Copy data from firstName and lastName to full_name
    UPDATE public.profiles
    SET full_name = TRIM(CONCAT("firstName", ' ', "lastName"))
    WHERE full_name IS NULL AND ("firstName" IS NOT NULL OR "lastName" IS NOT NULL);

    -- Drop old columns
    ALTER TABLE public.profiles DROP COLUMN IF EXISTS "firstName";
    ALTER TABLE public.profiles DROP COLUMN IF EXISTS "lastName";
    RAISE NOTICE 'Migrated firstName and lastName to full_name';
  END IF;
END $$;

-- Add other_socials column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'other_socials'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN other_socials JSONB DEFAULT '{}'::jsonb;
    RAISE NOTICE 'Added other_socials column';
  END IF;
END $$;

-- Add location column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'location'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN location TEXT;
    RAISE NOTICE 'Added location column';
  END IF;
END $$;

-- Add gender column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'gender'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN gender TEXT;
    RAISE NOTICE 'Added gender column';
  END IF;
END $$;

-- Add birthDate column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'birthDate'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN "birthDate" TEXT;
    RAISE NOTICE 'Added birthDate column';
  END IF;
END $$;

-- Add university column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'university'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN university TEXT;
    RAISE NOTICE 'Added university column';
  END IF;
END $$;

-- Add graduationYear column if it doesn't exist (note: schema has graduation_year)
DO $$
BEGIN
  -- Check if graduationYear exists but graduation_year doesn't
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'graduationYear'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'graduation_year'
  ) THEN
    ALTER TABLE public.profiles RENAME COLUMN "graduationYear" TO graduation_year;
    ALTER TABLE public.profiles ALTER COLUMN graduation_year TYPE INTEGER USING graduation_year::integer;
    RAISE NOTICE 'Renamed graduationYear to graduation_year';
  END IF;

  -- Add graduation_year if neither exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND (column_name = 'graduation_year' OR column_name = 'graduationYear')
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN graduation_year INTEGER;
    RAISE NOTICE 'Added graduation_year column';
  END IF;
END $$;

SELECT 'Migration completed successfully!' as status;
