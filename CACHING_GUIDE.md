# Caching Guide

Your app now has **automatic data caching** using React Query! This means:

- ✅ **No unnecessary refetches** - Data is cached for 5 minutes
- ✅ **Instant navigation** - Cached data shows immediately
- ✅ **Auto-updates** - New data updates the cache automatically
- ✅ **Background refresh** - Stale data refetches in the background

## How It Works

### Before (without caching):
```javascript
// Every time component loads, it fetches from server
const [profiles, setProfiles] = useState([]);

useEffect(() => {
  profileService.getProfiles().then(setProfiles);
}, []); // Fetches every mount
```

### After (with caching):
```javascript
// First load: fetches from server
// Next loads: uses cache (5 min), then refreshes in background
const { data: profiles, isLoading } = useProfiles();
```

## Using Cached Hooks

### Get Profiles (with filters)
```javascript
import { useProfiles, useProfile } from '../hooks';

function ExploreProfiles() {
  // Cached for 5 minutes
  const { data: profiles, isLoading, error } = useProfiles({
    major: 'Computer Science'
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {profiles.map(profile => (
        <ProfileCard key={profile.id} profile={profile} />
      ))}
    </div>
  );
}
```

### Get Single Profile
```javascript
import { useProfile } from '../hooks';

function ProfilePage({ userId }) {
  const { data: profile, isLoading } = useProfile(userId);

  if (isLoading) return <div>Loading...</div>;

  return <div>{profile.username}</div>;
}
```

### Follow/Unfollow (with auto-update)
```javascript
import { useFollowUser } from '../hooks';

function FollowButton({ followerId, followingId, isFollowing }) {
  const followMutation = useFollowUser();

  const handleClick = () => {
    followMutation.mutate({
      followerId,
      followingId,
      action: isFollowing ? 'unfollow' : 'follow'
    });
    // Cache automatically updates!
  };

  return (
    <button onClick={handleClick} disabled={followMutation.isPending}>
      {followMutation.isPending ? 'Loading...' : (isFollowing ? 'Unfollow' : 'Follow')}
    </button>
  );
}
```

### Study Groups
```javascript
import { useStudyGroups, useJoinStudyGroup } from '../hooks';

function StudyGroupList() {
  const { data: groups } = useStudyGroups({ course_code: 'CS101' });
  const joinMutation = useJoinStudyGroup();

  const handleJoin = (groupId) => {
    joinMutation.mutate({ groupId, userId: user.id });
    // Group list automatically refetches!
  };

  return (
    <div>
      {groups?.map(group => (
        <div key={group.id}>
          <h3>{group.name}</h3>
          <button onClick={() => handleJoin(group.id)}>Join</button>
        </div>
      ))}
    </div>
  );
}
```

### Events with RSVP
```javascript
import { useEvents, useRsvpEvent } from '../hooks';

function EventsList() {
  const { data: events } = useEvents({ upcoming: true });
  const rsvpMutation = useRsvpEvent();

  const handleRsvp = (eventId) => {
    rsvpMutation.mutate({
      eventId,
      userId: user.id,
      status: 'going'
    });
  };

  return (
    <div>
      {events?.map(event => (
        <div key={event.id}>
          <h3>{event.title}</h3>
          <button onClick={() => handleRsvp(event.id)}>RSVP</button>
        </div>
      ))}
    </div>
  );
}
```

### Course Reviews
```javascript
import { useCourseReviews, useCourseStats } from '../hooks';

function CourseReviewPage({ courseCode }) {
  const { data: reviews } = useCourseReviews({ course_code: courseCode });
  const { data: stats } = useCourseStats(courseCode);

  return (
    <div>
      <h2>{courseCode}</h2>
      <p>Average Rating: {stats?.avgRating.toFixed(1)} ⭐</p>
      <p>Total Reviews: {stats?.totalReviews}</p>

      {reviews?.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
```

### Resources
```javascript
import { useResources, useIncrementDownload } from '../hooks';

function ResourcesList() {
  const { data: resources } = useResources({ course_code: 'CS101' });
  const downloadMutation = useIncrementDownload();

  const handleDownload = (resourceId, fileUrl) => {
    downloadMutation.mutate(resourceId);
    window.open(fileUrl, '_blank');
  };

  return (
    <div>
      {resources?.map(resource => (
        <div key={resource.id}>
          <h3>{resource.title}</h3>
          <button onClick={() => handleDownload(resource.id, resource.file_url)}>
            Download ({resource.downloads_count})
          </button>
        </div>
      ))}
    </div>
  );
}
```

## Cache Settings

Configured in `src/lib/queryClient.js`:

```javascript
{
  staleTime: 5 * 60 * 1000,        // 5 minutes - data is fresh
  gcTime: 10 * 60 * 1000,          // 10 minutes - keep in memory
  retry: 1,                         // Retry failed requests once
  refetchOnWindowFocus: false,      // Don't refetch on tab focus
  refetchOnReconnect: true,         // Refetch when internet reconnects
}
```

### Customize Cache Duration

To change cache duration for specific queries:

```javascript
// Cache profiles for 10 minutes instead of 5
const { data: profiles } = useProfiles(filters, {
  staleTime: 10 * 60 * 1000
});

// Never cache (always fresh)
const { data: liveData } = useSomeData({
  staleTime: 0
});

// Cache forever (until manually invalidated)
const { data: staticData } = useSomeData({
  staleTime: Infinity
});
```

## Manual Cache Updates

### Invalidate cache (force refetch)
```javascript
import { useQueryClient } from '@tanstack/react-query';
import { profileKeys } from '../hooks/useProfiles';

const queryClient = useQueryClient();

// Invalidate all profiles
queryClient.invalidateQueries({ queryKey: profileKeys.all });

// Invalidate specific profile
queryClient.invalidateQueries({ queryKey: profileKeys.detail(userId) });
```

### Manually update cache
```javascript
// Update profile in cache without refetching
queryClient.setQueryData(profileKeys.detail(userId), newProfileData);
```

## Benefits

✅ **Faster app** - No waiting for repeated fetches
✅ **Better UX** - Instant page loads with cached data
✅ **Less bandwidth** - Fewer API calls
✅ **Auto sync** - Mutations update cache automatically
✅ **Optimistic updates** - UI updates before server confirms

## All Available Hooks

### Profiles
- `useProfiles(filters)` - Get all profiles
- `useProfile(userId)` - Get single profile
- `useFollowers(userId)` - Get followers list
- `useFollowing(userId)` - Get following list
- `useFollowUser()` - Follow/unfollow mutation
- `useUpdateProfile()` - Update profile mutation

### Study Groups
- `useStudyGroups(filters)` - Get all groups
- `useStudyGroup(groupId)` - Get single group
- `useUserStudyGroups(userId)` - Get user's groups
- `useCreateStudyGroup()` - Create group
- `useJoinStudyGroup()` - Join group
- `useLeaveStudyGroup()` - Leave group

### Events
- `useEvents(filters)` - Get all events
- `useEvent(eventId)` - Get single event
- `useUserRsvps(userId)` - Get user's RSVPs
- `useCreateEvent()` - Create event
- `useRsvpEvent()` - RSVP to event
- `useCancelRsvp()` - Cancel RSVP

### Course Reviews
- `useCourseReviews(filters)` - Get reviews
- `useCourseReview(reviewId)` - Get single review
- `useCourseStats(courseCode)` - Get course stats
- `useCreateReview()` - Create review
- `useVoteReview()` - Vote on review

### Resources
- `useResources(filters)` - Get all resources
- `useResource(resourceId)` - Get single resource
- `useCreateResource()` - Create resource
- `useDeleteResource()` - Delete resource
- `useIncrementDownload()` - Track downloads

Import from: `import { useProfiles, useEvents, ... } from '../hooks';`
