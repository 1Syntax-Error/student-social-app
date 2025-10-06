# Storage Setup Guide

## Create Storage Bucket

### Single Resources Bucket (for ALL files)

1. Go to **Storage** in Supabase dashboard
2. Click **New Bucket**
3. Configure:
   - **Name**: `resources`
   - **Public**: ✅ Yes
   - **File size limit**: `52428800` (50MB) - max for free tier
   - **Allowed MIME types**: Leave empty (we validate in the app)
4. Click **Create Bucket**

**Folder Structure:**
```
resources/
├── {user-id-1}/
│   ├── profile/
│   │   └── avatar.jpg
│   ├── documents/
│   │   ├── study-guide.pdf
│   │   └── notes.docx
│   └── images/
│       └── diagram.png
├── {user-id-2}/
│   ├── profile/
│   └── documents/
...
```

Each user gets their own folder identified by their user ID!

## Run Storage Policies

After creating buckets:

1. Go to **SQL Editor**
2. Open `supabase/storage-policies.sql` from your project
3. Copy and paste the content
4. Click **Run**

This sets up security so:
- ✅ Anyone can view/download files (public read)
- ✅ Users can only upload to their own folder (`{user-id}/...`)
- ✅ Users can only update/delete files in their own folder
- ❌ Users cannot modify other users' files

## File Upload Limits

The app enforces these limits in the frontend:

| Type | Max Size | Allowed Formats |
|------|----------|----------------|
| **Images** | 5MB | JPEG, PNG, GIF, WebP |
| **Documents** | 10MB | PDF, Word, Excel, PowerPoint, TXT |
| **Videos** | 50MB | MP4, MPEG, MOV, AVI |

You can customize these in `src/utils/fileUpload.js`:

```javascript
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024,      // 5MB
  DOCUMENT: 10 * 1024 * 1024,  // 10MB
  VIDEO: 50 * 1024 * 1024,     // 50MB
  DEFAULT: 10 * 1024 * 1024    // 10MB
};
```

## Using File Upload in Your App

### Example 1: Upload Profile Picture

```javascript
import { uploadProfileImage } from '../utils/fileUpload';

const handleProfilePictureUpload = async (file) => {
  try {
    // Uploads to: resources/{user.id}/profile/filename.jpg
    const imageUrl = await uploadProfileImage(file, user.id);
    await updateProfile({ profile_image_url: imageUrl });
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Example 2: Upload Study Resource

```javascript
import { uploadResourceFile } from '../utils/fileUpload';
import { resourceService } from '../services/resourceService';

const handleResourceUpload = async (file) => {
  try {
    // Uploads to: resources/{user.id}/documents/filename.pdf
    const fileUrl = await uploadResourceFile(file, user.id, 'documents');

    await resourceService.createResource({
      title: 'My Notes',
      description: 'CS101 Midterm Notes',
      resource_type: 'Study Guide',
      course_code: 'CS101',
      file_url: fileUrl,
      uploader_id: user.id
    });
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Example 3: Upload to Custom Subfolder

```javascript
// Upload event image to: resources/{user.id}/events/filename.jpg
const eventImageUrl = await uploadResourceFile(file, user.id, 'events');

// Upload course material to: resources/{user.id}/courses/filename.pdf
const courseFileUrl = await uploadResourceFile(file, user.id, 'courses');
```

### Example 3: Using the FileUpload Component

```javascript
import FileUpload from '../components/common/FileUpload';
import { FILE_SIZE_LIMITS } from '../utils/fileUpload';

function MyForm() {
  const [selectedFile, setSelectedFile] = useState(null);

  return (
    <FileUpload
      onFileSelect={setSelectedFile}
      maxSize={FILE_SIZE_LIMITS.IMAGE}
      accept="image/*"
      label="Upload Profile Picture"
      showPreview={true}
    />
  );
}
```

## Supabase Storage Limits (Free Plan)

- **Total Storage**: 1GB
- **File Upload Size**: 50MB per file
- **Bandwidth**: 2GB/month

If you need more, upgrade your Supabase plan.

## Testing

1. Create a test upload in your app
2. Check Supabase Storage to see the file
3. Try uploading a file that's too large (should show error)
4. Try uploading wrong file type (should show error)

## Troubleshooting

**Error: "new row violates row-level security policy"**
- Run the `storage-policies.sql` file in SQL Editor

**Files not uploading**
- Check bucket is public
- Check user is authenticated
- Check file size and type are within limits

**Can't delete files**
- Ensure storage policies are set up correctly
- Check user owns the file they're trying to delete
