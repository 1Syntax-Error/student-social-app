# Backend Setup Guide

This app uses **Supabase** as the backend - a simple yet powerful solution that provides authentication, PostgreSQL database, storage, and real-time features out of the box.

## Quick Setup Steps

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in project details (name, database password, region)
5. Wait for your project to be created (~2 minutes)

### 2. Get Your API Keys

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy your **Project URL** and **anon/public** key
3. Update your `.env` file:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 3. Run Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Copy and paste the entire content into the SQL Editor
4. Click **Run** to create all tables and functions

### 4. Enable Row Level Security

1. In the SQL Editor, create a new query
2. Open `supabase/rls-policies.sql` from this project
3. Copy and paste the entire content
4. Click **Run** to enable security policies

### 5. Create Storage Bucket (Optional - for file uploads)

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Name it `resources`
4. Set it to **Public** (for easy file access)
5. Click **Create**

## What's Included

### Database Tables

- **profiles** - User profiles with major, bio, interests, etc.
- **follows** - User following/follower relationships
- **study_groups** - Study group information
- **study_group_members** - Group membership
- **events** - Campus events
- **event_rsvps** - Event attendance tracking
- **course_reviews** - Course and professor reviews
- **review_votes** - Helpful votes on reviews
- **resources** - Shared study materials
- **messages** - Direct messaging between users

### API Services

All service functions are in `src/services/`:

- **authService.js** - Sign up, sign in, sign out, password reset
- **profileService.js** - User profiles, follow/unfollow
- **studyGroupService.js** - Create, join, manage study groups
- **eventService.js** - Create events, RSVP management
- **courseReviewService.js** - Course reviews and ratings
- **resourceService.js** - File uploads and sharing

### Example Usage

```javascript
import { authService } from './services/authService';
import { profileService } from './services/profileService';

// Sign up a new user
const result = await authService.signUp('user@email.com', 'password', {
  username: 'johndoe',
  full_name: 'John Doe'
});

// Get all users by major
const csStudents = await profileService.getProfiles({ major: 'Computer Science' });

// Follow a user
await profileService.followUser(myUserId, theirUserId);
```

## Security Features

✅ **Row Level Security (RLS)** enabled on all tables
✅ Users can only update their own profiles
✅ Users can only delete their own content
✅ Authentication required for creating content
✅ Public read access for discovery features

## Real-time Features (Optional)

Supabase supports real-time subscriptions. To enable:

```javascript
// Subscribe to new messages
supabase
  .from('messages')
  .on('INSERT', payload => {
    console.log('New message:', payload.new);
  })
  .subscribe();
```

## Testing

1. Start your app: `npm run dev`
2. Try signing up a new account
3. Complete your profile
4. Explore features like creating study groups, events, etc.

## Troubleshooting

**Error: "Missing Supabase environment variables"**
- Check your `.env` file has the correct keys
- Restart your dev server after updating `.env`

**Error: "relation does not exist"**
- Run the `schema.sql` file in Supabase SQL Editor

**Can't insert/update data**
- Run the `rls-policies.sql` file to enable permissions

**Sign up works but profile not created**
- The trigger should auto-create profiles
- Check the SQL Editor for any errors in the `handle_new_user` function

## Next Steps

- Customize the database schema for your needs
- Add email templates in Supabase Auth settings
- Set up file storage buckets
- Configure social auth providers (Google, GitHub, etc.)
- Add real-time subscriptions for chat features

## Support

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
