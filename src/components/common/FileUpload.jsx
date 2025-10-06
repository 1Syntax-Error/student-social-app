// src/components/common/FileUpload.jsx
import { useState } from 'react';
import { FiUpload, FiX, FiFile, FiImage, FiVideo } from 'react-icons/fi';
import { formatFileSize, validateFileSize, validateFileType, getFileCategory } from '../../utils/fileUpload';

export default function FileUpload({
  onFileSelect,
  maxSize,
  allowedTypes,
  accept,
  label = 'Upload File',
  showPreview = true,
  buttonClassName = 'btn btn-primary'
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError(null);

    if (!file) {
      setSelectedFile(null);
      setPreview(null);
      return;
    }

    try {
      // Validate file size if maxSize is provided
      if (maxSize) {
        validateFileSize(file, maxSize);
      }

      // Validate file type if allowedTypes is provided
      if (allowedTypes && allowedTypes.length > 0) {
        validateFileType(file, allowedTypes);
      }

      setSelectedFile(file);

      // Generate preview for images
      if (showPreview && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }

      // Call parent callback
      if (onFileSelect) {
        onFileSelect(file);
      }
    } catch (err) {
      setError(err.message);
      setSelectedFile(null);
      setPreview(null);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
    setError(null);
    if (onFileSelect) {
      onFileSelect(null);
    }
  };

  const getFileIcon = () => {
    if (!selectedFile) return <FiUpload />;

    const category = getFileCategory(selectedFile.type);
    switch (category) {
      case 'IMAGE':
        return <FiImage />;
      case 'VIDEO':
        return <FiVideo />;
      default:
        return <FiFile />;
    }
  };

  return (
    <div className="w-full">
      {/* Upload Button */}
      {!selectedFile && (
        <label className={`${buttonClassName} cursor-pointer inline-flex items-center`}>
          <FiUpload className="mr-2" />
          {label}
          <input
            type="file"
            onChange={handleFileChange}
            accept={accept}
            className="hidden"
          />
        </label>
      )}

      {/* File Info Display */}
      {selectedFile && (
        <div className="border border-border dark:border-dark-border rounded-lg p-4 bg-white dark:bg-dark-surface">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                {getFileIcon()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-dark-text-primary truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-dark-text-secondary">
                  {formatFileSize(selectedFile.size)}
                </p>
                {preview && (
                  <img
                    src={preview}
                    alt="Preview"
                    className="mt-2 max-w-xs rounded-lg max-h-48 object-cover"
                  />
                )}
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="ml-2 p-1 text-gray-400 hover:text-red-500 dark:text-dark-text-secondary dark:hover:text-red-400 transition-colors"
              aria-label="Remove file"
            >
              <FiX size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded-md">
          {error}
        </div>
      )}

      {/* Helper Text */}
      {!selectedFile && maxSize && (
        <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary">
          Max file size: {formatFileSize(maxSize)}
        </p>
      )}
    </div>
  );
}
