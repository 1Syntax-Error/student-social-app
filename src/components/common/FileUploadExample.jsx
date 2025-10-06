// src/components/common/FileUploadExample.jsx
// Example component showing how to use FileUpload in a form

import { useState } from 'react';
import FileUpload from './FileUpload';
import { FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES } from '../../utils/fileUpload';
import { uploadResourceFile } from '../../utils/fileUpload';
import { resourceService } from '../../services/resourceService';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

export default function FileUploadExample() {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    try {
      setUploading(true);

      // Upload file to storage
      const fileUrl = await uploadResourceFile(selectedFile, user.id);

      // Create resource in database
      await resourceService.createResource({
        title: title.trim(),
        description: description.trim(),
        resource_type: 'Study Guide',
        file_url: fileUrl,
        uploader_id: user.id
      });

      toast.success('Resource uploaded successfully!');

      // Reset form
      setSelectedFile(null);
      setTitle('');
      setDescription('');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload resource');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">
        Upload Study Resource
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="e.g., CS101 Midterm Study Guide"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows={3}
            placeholder="Brief description of the resource..."
          />
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
            File *
          </label>
          <FileUpload
            onFileSelect={setSelectedFile}
            maxSize={FILE_SIZE_LIMITS.DOCUMENT}
            allowedTypes={[
              ...ALLOWED_FILE_TYPES.DOCUMENT,
              ...ALLOWED_FILE_TYPES.IMAGE
            ]}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
            label="Choose File"
            showPreview={true}
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary">
            Accepted formats: PDF, Word, Images • Max 10MB
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={uploading || !selectedFile || !title.trim()}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : 'Upload Resource'}
        </button>
      </form>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
          File Upload Limits
        </h3>
        <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
          <li>• Images: Max 5MB (JPEG, PNG, GIF, WebP)</li>
          <li>• Documents: Max 10MB (PDF, Word, Excel, etc.)</li>
          <li>• Videos: Max 50MB (MP4, MOV, AVI)</li>
        </ul>
      </div>
    </div>
  );
}
