import { useState, useEffect } from 'react';
import { FiFile, FiDownload, FiUpload, FiSearch, FiFilter, FiFolder, FiFileText, FiImage, FiLoader, FiTrash2 } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { COURSES } from '../utils/constants';

export default function Resources() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileTypes = ['All', 'Study Guide', 'Notes', 'Past Exam', 'Tutorial', 'Other'];

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    course: '',
    customCourse: '',
    resourceType: 'Study Guide',
    file: null
  });

  useEffect(() => {
    fetchResources();
  }, [user]);

  const fetchResources = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data: resourcesData, error } = await supabase
        .from('resources')
        .select(`
          *,
          uploader:profiles!resources_uploader_id_fkey(username)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResources(resourcesData || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (resource.description && resource.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCourse = !selectedCourse || resource.course_code === selectedCourse;
    const matchesType = !selectedType || selectedType === 'All' || resource.resource_type === selectedType;
    return matchesSearch && matchesCourse && matchesType;
  });

  const handleDeleteResource = async (resourceId) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }

    try {
      // First, get the resource details to check for file
      const { data: resource, error: fetchError } = await supabase
        .from('resources')
        .select('file_url, uploader_id')
        .eq('id', resourceId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user is the uploader
      if (resource.uploader_id !== user.id) {
        alert('You can only delete resources you uploaded.');
        return;
      }

      // If resource has a file, delete it from storage
      if (resource.file_url) {
        try {
          // Extract file path from the URL
          // URL format: https://{project}.supabase.co/storage/v1/object/public/resources/{path}
          const urlParts = resource.file_url.split('/storage/v1/object/public/resources/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];

            const { error: storageError } = await supabase.storage
              .from('resources')
              .remove([filePath]);

            if (storageError) {
              console.error('Error deleting file from storage:', storageError);
              // Continue with resource deletion even if file deletion fails
            }
          }
        } catch (storageError) {
          console.error('Error parsing file URL:', storageError);
          // Continue with resource deletion even if file deletion fails
        }
      }

      // Delete the resource record from the database
      const { error: deleteError } = await supabase
        .from('resources')
        .delete()
        .eq('id', resourceId)
        .eq('uploader_id', user.id);

      if (deleteError) throw deleteError;

      // Refresh the resources list
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource. Please try again.');
    }
  };

  const handleUploadResource = async (e) => {
    e.preventDefault();
    if (!user || !formData.file) return;

    setUploading(true);
    try {
      // Use custom course if "Other" is selected, otherwise use the selected course
      const courseCode = formData.course === 'Other' ? formData.customCourse : formData.course;

      // Upload file to Supabase Storage
      const fileExt = formData.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('resources')
        .upload(fileName, formData.file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      // Create resource record
      const { error: insertError } = await supabase
        .from('resources')
        .insert([
          {
            title: formData.title,
            description: formData.description || null,
            course_code: courseCode,
            resource_type: formData.resourceType,
            file_url: urlData.publicUrl,
            uploader_id: user.id,
            downloads_count: 0
          }
        ]);

      if (insertError) throw insertError;

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        course: '',
        customCourse: '',
        resourceType: 'Study Guide',
        file: null
      });
      setShowUploadModal(false);

      // Refresh resources
      fetchResources();
    } catch (error) {
      console.error('Error uploading resource:', error);
      alert('Failed to upload resource. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (fileUrl) => {
    if (!fileUrl) return <FiFile className="text-gray-500" size={24} />;

    const ext = fileUrl.split('.').pop()?.toUpperCase();

    if (ext === 'PDF' || ext === 'DOC' || ext === 'DOCX') return <FiFileText className="text-blue-500" size={24} />;
    if (ext === 'ZIP') return <FiFolder className="text-yellow-500" size={24} />;
    if (ext === 'PNG' || ext === 'JPG' || ext === 'JPEG' || ext === 'GIF') return <FiImage className="text-green-500" size={24} />;
    return <FiFile className="text-gray-500" size={24} />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Study Resources
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Share and access study materials, notes, and resources
            </p>
          </div>

          {/* Search and Filters */}
          <div className="card p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input"
                  />
                </div>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn btn-primary whitespace-nowrap"
                >
                  <FiUpload className="mr-2" />
                  Upload Resource
                </button>
              </div>

              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input"
              >
                <option value="">All Courses</option>
                {COURSES.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>

              <div className="flex gap-2 flex-wrap">
                {fileTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type === 'All' ? '' : type)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      (type === 'All' && !selectedType) || selectedType === type
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-border/80'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Resources Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader size={32} className="text-primary-500 dark:text-primary-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredResources.map(resource => {
                const courseDisplay = resource.course_code || 'No course';
                const resourceTypeBadge = resource.resource_type || 'Other';
                const isUploader = user && resource.uploader_id === user.id;

                return (
                  <div key={resource.id} className="card p-4 sm:p-6 flex flex-col">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0">
                        {getFileIcon(resource.file_url)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary mb-1 truncate">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-accent-teal mb-1">{courseDisplay}</p>
                            <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded badge badge-primary`}>
                              {resourceTypeBadge}
                            </span>
                          </div>
                          {isUploader && (
                            <button
                              onClick={() => handleDeleteResource(resource.id)}
                              className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors flex-shrink-0"
                              title="Delete resource"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {resource.description && (
                      <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4 flex-1">
                        {resource.description}
                      </p>
                    )}

                    <div className="border-t border-gray-200 dark:border-dark-border pt-4 mt-auto">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-dark-text-secondary mb-3">
                        <span>By {resource.uploader?.username || 'Unknown'}</span>
                        <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-dark-text-secondary">
                          <FiDownload className="inline mr-1" />
                          {resource.downloads_count || 0} downloads
                        </span>
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary text-sm py-1.5 px-3"
                        >
                          <FiDownload className="mr-1" size={14} />
                          Download
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {filteredResources.length === 0 && (
            <div className="card p-12 text-center">
              <FiFile className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                No resources found
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                Be the first to share a resource for this course!
              </p>
              <button onClick={() => setShowUploadModal(true)} className="btn btn-primary">
                <FiUpload className="mr-2" />
                Upload Resource
              </button>
            </div>
          )}

          {/* Upload Resource Modal */}
          {showUploadModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowUploadModal(false)}>
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 dark:text-dark-text-primary">Upload Resource</h2>

                <form onSubmit={handleUploadResource} className="space-y-4">
                  {/* Resource Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., CS 101 Final Exam Study Guide"
                    />
                  </div>

                  {/* Course Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Course *
                    </label>
                    <select
                      required
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value, customCourse: '' })}
                      className="input w-full"
                    >
                      <option value="">Select a course</option>
                      {COURSES.map(course => (
                        <option key={course} value={course}>{course}</option>
                      ))}
                      <option value="Other">Other (Type your own)</option>
                    </select>
                  </div>

                  {/* Custom Course Input - shown when "Other" is selected */}
                  {formData.course === 'Other' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Enter Course Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.customCourse}
                        onChange={(e) => setFormData({ ...formData, customCourse: e.target.value })}
                        className="input w-full"
                        placeholder="e.g., CHEM 202 - Organic Chemistry"
                      />
                    </div>
                  )}

                  {/* Resource Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Resource Type *
                    </label>
                    <select
                      required
                      value={formData.resourceType}
                      onChange={(e) => setFormData({ ...formData, resourceType: e.target.value })}
                      className="input w-full"
                    >
                      {fileTypes.filter(t => t !== 'All').map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input w-full"
                      rows="3"
                      placeholder="Brief description of the resource..."
                    />
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      File *
                    </label>
                    <input
                      type="file"
                      required
                      onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
                      className="input w-full"
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.zip"
                    />
                    <p className="text-xs text-gray-500 dark:text-dark-text-secondary mt-1">
                      Accepted formats: PDF, DOC, DOCX, PPT, PPTX, TXT, ZIP
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowUploadModal(false)}
                      className="btn btn-secondary flex-1"
                      disabled={uploading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={uploading}
                    >
                      {uploading ? 'Uploading...' : 'Upload Resource'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
