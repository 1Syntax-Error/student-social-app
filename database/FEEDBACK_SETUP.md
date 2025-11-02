# Feedback & Bug Reporting System Setup

This document explains how to set up the Feedback and Bug Reporting feature for Campus Connect.

## Overview

The feedback system allows users to:
- **Submit Feature Suggestions** - Users can suggest new features they'd like to see
- **Vote on Suggestions** - Users can upvote suggestions to show which features should be prioritized
- **Report Bugs** - Users can report bugs with detailed descriptions and steps to reproduce

## Database Setup

### Step 1: Run the SQL Migration

Execute the SQL file to create the necessary database tables:

```bash
# If using Supabase, run the SQL in the SQL Editor:
# 1. Go to your Supabase project dashboard
# 2. Click on "SQL Editor" in the left sidebar
# 3. Copy the contents of feedback_tables.sql
# 4. Paste and run the SQL
```

Or run directly:
```sql
-- Copy and paste the contents from feedback_tables.sql
```

### Step 2: Verify Tables Created

After running the migration, you should have these tables:
1. `feature_suggestions` - Stores user feature suggestions
2. `suggestion_votes` - Stores user votes on suggestions
3. `bug_reports` - Stores bug reports

### Database Schema

#### feature_suggestions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to profiles table |
| title | TEXT | Suggestion title |
| description | TEXT | Detailed description |
| status | TEXT | Status: pending, under_review, planned, in_progress, completed, rejected |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### suggestion_votes
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| suggestion_id | UUID | Reference to feature_suggestions |
| user_id | UUID | Reference to profiles table |
| created_at | TIMESTAMP | Vote timestamp |

**Note:** There's a unique constraint on (suggestion_id, user_id) to prevent duplicate votes.

#### bug_reports
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Reference to profiles table |
| title | TEXT | Bug title |
| description | TEXT | Bug description |
| steps_to_reproduce | TEXT | Steps to reproduce (optional) |
| status | TEXT | Status: open, in_progress, closed, wont_fix |
| created_at | TIMESTAMP | Report timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## Features

### For Users

1. **Submit Feature Suggestions**
   - Users can submit ideas for new features
   - Must include title and description
   - Automatically set to "pending" status

2. **Vote on Suggestions**
   - Users can upvote suggestions they want to see
   - One vote per user per suggestion
   - Click again to remove vote
   - Suggestions are sorted by vote count

3. **Report Bugs**
   - Users can report bugs with title and description
   - Optional: Steps to reproduce
   - Automatically set to "open" status

### For Admins

To update the status of suggestions or bugs, use the Supabase dashboard:

1. Go to Table Editor
2. Select the appropriate table (`feature_suggestions` or `bug_reports`)
3. Find the row you want to update
4. Change the `status` column to the desired value

**Suggestion Statuses:**
- `pending` - Newly submitted
- `under_review` - Being reviewed by team
- `planned` - Approved and planned for implementation
- `in_progress` - Currently being worked on
- `completed` - Feature has been implemented
- `rejected` - Will not be implemented

**Bug Statuses:**
- `open` - Newly reported
- `in_progress` - Being worked on
- `closed` - Bug has been fixed
- `wont_fix` - Won't be fixed (not a bug or out of scope)

## Access

Users can access the feedback page at: `/feedback`

The link is also available in the footer of every page as "Feedback & Bugs"

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only create/update/delete their own submissions
- All users can view all suggestions and bug reports
- Votes are tracked per user to prevent duplicate voting

## Future Enhancements

Consider adding:
- Comments on suggestions/bugs
- Email notifications when status changes
- Admin dashboard for managing feedback
- Search and filter functionality
- Screenshots/file uploads for bugs
- Duplicate detection
- Tags/categories for better organization
