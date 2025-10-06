// src/utils/fileUpload.js
import { supabase } from './supabaseClient';

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024,      // 5MB for images
  DOCUMENT: 10 * 1024 * 1024,  // 10MB for documents
  VIDEO: 50 * 1024 * 1024,     // 50MB for videos
  DEFAULT: 10 * 1024 * 1024    // 10MB default
};

// Allowed file types
export const ALLOWED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  DOCUMENT: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ],
  VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/x-msvideo']
};

/**
 * Validate file size
 * @param {File} file - The file to validate
 * @param {number} maxSize - Maximum file size in bytes
 * @returns {boolean} - True if valid, throws error if not
 */
export function validateFileSize(file, maxSize = FILE_SIZE_LIMITS.DEFAULT) {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    throw new Error(
      `File size (${fileSizeMB}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
    );
  }
  return true;
}

/**
 * Validate file type
 * @param {File} file - The file to validate
 * @param {string[]} allowedTypes - Array of allowed MIME types
 * @returns {boolean} - True if valid, throws error if not
 */
export function validateFileType(file, allowedTypes) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`
    );
  }
  return true;
}

/**
 * Get file category based on MIME type
 * @param {string} mimeType - The MIME type
 * @returns {string} - 'IMAGE', 'DOCUMENT', 'VIDEO', or 'OTHER'
 */
export function getFileCategory(mimeType) {
  if (ALLOWED_FILE_TYPES.IMAGE.includes(mimeType)) return 'IMAGE';
  if (ALLOWED_FILE_TYPES.DOCUMENT.includes(mimeType)) return 'DOCUMENT';
  if (ALLOWED_FILE_TYPES.VIDEO.includes(mimeType)) return 'VIDEO';
  return 'OTHER';
}

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Upload file to Supabase storage with validation
 * @param {File} file - The file to upload
 * @param {Object} options - Upload options
 * @param {string} options.bucket - Storage bucket name
 * @param {string} options.folder - Folder path within bucket
 * @param {number} options.maxSize - Maximum file size
 * @param {string[]} options.allowedTypes - Allowed MIME types
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export async function uploadFile(file, options = {}) {
  const {
    bucket = 'resources',
    folder = '',
    maxSize,
    allowedTypes
  } = options;

  try {
    // Determine file category and get appropriate limits
    const category = getFileCategory(file.type);
    const sizeLimit = maxSize || FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.DEFAULT;
    const typeList = allowedTypes || ALLOWED_FILE_TYPES[category] || [];

    // Validate file size
    validateFileSize(file, sizeLimit);

    // Validate file type if restrictions are set
    if (typeList.length > 0) {
      validateFileType(file, typeList);
    }

    // Generate unique file name
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * Upload profile image with specific restrictions
 * @param {File} file - The image file
 * @param {string} userId - User ID for folder organization
 * @returns {Promise<string>} - Public URL of uploaded image
 */
export async function uploadProfileImage(file, userId) {
  return uploadFile(file, {
    bucket: 'resources',
    folder: `${userId}/profile`,
    maxSize: FILE_SIZE_LIMITS.IMAGE,
    allowedTypes: ALLOWED_FILE_TYPES.IMAGE
  });
}

/**
 * Upload resource file (study materials)
 * @param {File} file - The resource file
 * @param {string} userId - User ID for folder organization
 * @param {string} subfolder - Optional subfolder (e.g., 'documents', 'images')
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export async function uploadResourceFile(file, userId, subfolder = 'documents') {
  const category = getFileCategory(file.type);

  return uploadFile(file, {
    bucket: 'resources',
    folder: `${userId}/${subfolder}`,
    maxSize: FILE_SIZE_LIMITS[category] || FILE_SIZE_LIMITS.DEFAULT,
    allowedTypes: [
      ...ALLOWED_FILE_TYPES.IMAGE,
      ...ALLOWED_FILE_TYPES.DOCUMENT,
      ...ALLOWED_FILE_TYPES.VIDEO
    ]
  });
}

/**
 * Delete file from Supabase storage
 * @param {string} fileUrl - Public URL of the file
 * @param {string} bucket - Storage bucket name
 * @returns {Promise<void>}
 */
export async function deleteFile(fileUrl, bucket = 'resources') {
  try {
    // Extract file path from public URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');
    const filePath = pathParts.slice(pathParts.indexOf(bucket) + 1).join('/');

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
  } catch (error) {
    console.error('File deletion error:', error);
    throw error;
  }
}
