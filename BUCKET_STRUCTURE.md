# Single Bucket Storage Structure

## Overview

All files are stored in **one bucket** called `resources`, organized by user ID.

## Folder Structure

```
resources/
│
├── a1b2c3d4-user-uuid-1/
│   ├── profile/
│   │   └── avatar-12345.jpg              ← Profile picture
│   ├── documents/
│   │   ├── cs101-notes.pdf               ← Study materials
│   │   ├── midterm-guide.docx
│   │   └── homework-solution.txt
│   ├── images/
│   │   ├── diagram-1.png                 ← Image uploads
│   │   └── screenshot.jpg
│   └── events/
│       └── event-banner.jpg              ← Event images
│
├── e5f6g7h8-user-uuid-2/
│   ├── profile/
│   │   └── avatar-67890.png
│   ├── documents/
│   │   └── bio101-study-guide.pdf
│   └── videos/
│       └── presentation.mp4
│
└── i9j0k1l2-user-uuid-3/
    ├── profile/
    │   └── avatar-11111.jpg
    └── documents/
        └── notes.pdf
```

## How It Works

### 1. Profile Pictures
```javascript
uploadProfileImage(file, userId)
// Saves to: resources/{userId}/profile/filename.jpg
```

### 2. Study Resources
```javascript
uploadResourceFile(file, userId, 'documents')
// Saves to: resources/{userId}/documents/filename.pdf
```

### 3. Custom Folders
```javascript
uploadResourceFile(file, userId, 'events')
// Saves to: resources/{userId}/events/filename.jpg

uploadResourceFile(file, userId, 'courses/CS101')
// Saves to: resources/{userId}/courses/CS101/filename.pdf
```

## Security

The Supabase policies ensure:

✅ **Users can only upload to their own folder**
```
Path: resources/{their-user-id}/...  ← Allowed
Path: resources/{someone-else-id}/... ← Blocked
```

✅ **Users can only delete their own files**
```
DELETE resources/{their-user-id}/profile/pic.jpg    ← Allowed
DELETE resources/{someone-else-id}/profile/pic.jpg  ← Blocked
```

✅ **Everyone can view/download files** (public read)
```
GET resources/{any-user-id}/documents/notes.pdf  ← Allowed
```

## Benefits

1. **Simple**: Only one bucket to manage
2. **Organized**: Each user has their own space
3. **Secure**: Users can't modify others' files
4. **Flexible**: Create any subfolder structure you want
5. **Traceable**: Easy to see all files for a user

## Example File Paths

| Type | Path Example |
|------|-------------|
| Profile pic | `a1b2c3d4/profile/avatar-123.jpg` |
| Study guide | `a1b2c3d4/documents/cs101-guide.pdf` |
| Event image | `a1b2c3d4/events/hackathon-banner.jpg` |
| Course notes | `a1b2c3d4/courses/CS101/lecture1.pdf` |
| Screenshot | `a1b2c3d4/images/diagram.png` |

## Quick Setup

1. Create ONE bucket: `resources`
2. Make it public
3. Run `storage-policies.sql`
4. Done! 🎉

Files are automatically organized by user ID, and you can create any subfolder structure you need!
