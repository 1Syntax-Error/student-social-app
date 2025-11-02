// src/components/social/CreatePost.jsx
import { useState } from 'react';
import { FiEdit3, FiX, FiImage, FiSend } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';

const MAX_POST_LENGTH = 500; // Character limit for posts
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

export default function CreatePost({ onPostCreated }) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const remainingChars = MAX_POST_LENGTH - content.length;

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > MAX_IMAGE_SIZE) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const uploadImage = async () => {
    if (!selectedImage) return null;

    const fileExt = selectedImage.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/posts/${fileName}`;

    const { data, error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, selectedImage, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !selectedImage) {
      setError('Post cannot be empty');
      return;
    }

    if (content.length > MAX_POST_LENGTH) {
      setError(`Post exceeds the maximum length of ${MAX_POST_LENGTH} characters`);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Upload image if selected
      let imageUrl = null;
      if (selectedImage) {
        imageUrl = await uploadImage();
      }

      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            image_url: imageUrl
          }
        ])
        .select(`
          id,
          content,
          image_url,
          created_at,
          user:profiles!posts_user_id_fkey (
            id,
            username,
            full_name,
            profile_image_url
          )
        `)
        .single();

      if (insertError) throw insertError;

      // Reset form
      setContent('');
      setSelectedImage(null);
      setImagePreview(null);
      setShowForm(false);

      // Callback to refresh feed
      if (onPostCreated) {
        onPostCreated(data);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
    setShowForm(false);
  };

  if (!user) return null;

  return (
    <div className="bg-white dark:bg-dark-surface rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200 dark:border-dark-border mb-6">
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full flex items-center gap-3 p-4 text-left bg-gray-50 dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-dark-border hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
        >
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            {user.user_metadata?.profile_image_url ? (
              <img
                src={user.user_metadata.profile_image_url}
                alt="Your profile"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-lg font-semibold">
                {user.user_metadata?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <span className="text-gray-500 dark:text-dark-text-secondary">
            What's on your mind?
          </span>
          <FiEdit3 className="ml-auto text-gray-400" size={20} />
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              {user.user_metadata?.profile_image_url ? (
                <img
                  src={user.user_metadata.profile_image_url}
                  alt="Your profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <span className="text-lg font-semibold">
                  {user.user_metadata?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 dark:text-dark-text-primary">
                {user.user_metadata?.full_name || user.user_metadata?.username || 'You'}
              </p>
              <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                Share your thoughts...
              </p>
            </div>
            <button
              type="button"
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <FiX size={24} />
            </button>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's happening on campus?"
            className="w-full min-h-[120px] p-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary placeholder-gray-400 dark:placeholder-gray-500 resize-none"
            maxLength={MAX_POST_LENGTH}
            autoFocus
          />

          {/* Image Preview */}
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full max-h-64 object-contain rounded-lg border border-gray-300 dark:border-dark-border"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <FiX size={20} />
              </button>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Image Upload Button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isSubmitting}
                />
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-border transition-colors ${
                  selectedImage ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-300 dark:border-primary-700' : ''
                }`}>
                  <FiImage size={18} className={selectedImage ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-dark-text-secondary'} />
                  <span className={`text-sm font-medium ${selectedImage ? 'text-primary-600 dark:text-primary-400' : 'text-gray-600 dark:text-dark-text-secondary'}`}>
                    {selectedImage ? 'Image added' : 'Add image'}
                  </span>
                </div>
              </label>

              <span className={`text-sm ${
                remainingChars < 50
                  ? 'text-red-600 dark:text-red-400 font-semibold'
                  : 'text-gray-500 dark:text-dark-text-secondary'
              }`}>
                {remainingChars} characters remaining
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || (!content.trim() && !selectedImage) || content.length > MAX_POST_LENGTH}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <FiSend size={16} />
                    Post
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
