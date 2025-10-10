// src/components/profile/EditProfileForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../utils/supabaseClient';
import { MAJORS, UNIVERSITIES, GENDER_OPTIONS } from '../../utils/constants';
import { FiSave, FiX, FiPlus, FiTrash2, FiCalendar, FiUser, FiBookOpen, FiMail, FiLinkedin, FiHome, FiUsers, FiCamera, FiUpload } from 'react-icons/fi';

export default function EditProfileForm() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const currentYear = new Date().getFullYear();
  const graduationYears = Array.from({ length: 5 }, (_, i) => currentYear + i);
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    university: '',
    major: '',
    graduation_year: '',
    gender: '',
    birthDate: '',
    bio: '',
    location: '',
    linkedin_url: '',
    profile_image_url: '',
    other_socials: {}
  });
  
  const [socialLinks, setSocialLinks] = useState([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('personal'); // 'personal', 'education', 'social'
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [universitySuggestions, setUniversitySuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        university: profile.university || '',
        major: profile.major || '',
        graduation_year: profile.graduation_year || '',
        gender: profile.gender || '',
        birthDate: profile.birthDate || '',
        bio: profile.bio || '',
        location: profile.location || '',
        linkedin_url: profile.linkedin_url || '',
        profile_image_url: profile.profile_image_url || '',
        other_socials: profile.other_socials || {}
      });

      // Convert other_socials object to array for easier management in form
      setSocialLinks(
        Object.entries(profile.other_socials || {}).map(([platform, url]) => ({
          platform,
          url
        }))
      );
    }
  }, [profile]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const fetchUniversities = async (query) => {
    if (!query || query.length < 2) {
      setUniversitySuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `http://universities.hipolabs.com/search?name=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      // Get unique university names and limit to 10
      const uniqueUniversities = [...new Set(data.map(uni => uni.name))].slice(0, 10);
      setUniversitySuggestions(uniqueUniversities);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching universities:', error);
      setUniversitySuggestions([]);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleUniversityChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, university: value }));
    fetchUniversities(value);
  };

  const selectUniversity = (university) => {
    setFormData(prev => ({ ...prev, university }));
    setShowSuggestions(false);
    setUniversitySuggestions([]);
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  const uploadProfileImage = async (userId) => {
    if (!selectedImage) return null;

    try {
      setUploadingImage(true);

      // Get file extension
      const fileExt = selectedImage.name.split('.').pop();
      const fileName = `profile-picture.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Delete old profile picture if it exists
      if (profile?.profile_image_url) {
        const oldPath = profile.profile_image_url.split('/').slice(-2).join('/');
        await supabase.storage.from('resources').remove([oldPath]);
      }

      // Upload new image
      const { data, error } = await supabase.storage
        .from('resources')
        .upload(filePath, selectedImage, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };
  
  const handleAddSocial = () => {
    if (!newSocialPlatform.trim() || !newSocialUrl.trim()) {
      setError('Please fill in both platform and URL fields');
      return;
    }

    // Check if platform already exists
    if (socialLinks.some(link => link.platform.toLowerCase() === newSocialPlatform.toLowerCase())) {
      setError(`A link for ${newSocialPlatform} already exists`);
      return;
    }

    setSocialLinks([
      ...socialLinks,
      { platform: newSocialPlatform.trim(), url: newSocialUrl.trim() }
    ]);

    setNewSocialPlatform('');
    setNewSocialUrl('');
    setError('');
  };
  
  const handleRemoveSocial = (platformToRemove) => {
    setSocialLinks(socialLinks.filter(link => link.platform !== platformToRemove));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let profile_image_url = formData.profile_image_url;

      // Upload image if one was selected
      if (selectedImage) {
        const uploadedUrl = await uploadProfileImage(profile.id);
        if (uploadedUrl) {
          profile_image_url = uploadedUrl;
        }
      }

      // Convert socialLinks array back to object
      const other_socials = {};
      socialLinks.forEach(link => {
        other_socials[link.platform] = link.url;
      });

      const updatedProfile = {
        ...formData,
        profile_image_url,
        other_socials
      };

      const { success, error } = await updateProfile(updatedProfile);

      if (success) {
        navigate(`/profile/${profile.id}`);
      } else {
        setError(error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderPersonalInfoSection = () => (
    <div className="space-y-6">
      {/* Profile Picture */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-3">
          Profile Picture
        </label>
        <div className="flex items-center space-x-6">
          {/* Current/Preview Image */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {imagePreview || profile?.profile_image_url ? (
                <img
                  src={imagePreview || profile.profile_image_url}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={40} className="text-gray-400 dark:text-gray-500" />
              )}
            </div>
            {uploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1">
            <label
              htmlFor="profile-image"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-border cursor-pointer"
            >
              <FiCamera className="mr-2" />
              {selectedImage ? 'Change Photo' : 'Upload Photo'}
            </label>
            <input
              id="profile-image"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-dark-text-secondary">
              JPG, PNG or GIF. Max size 5MB
            </p>
            {selectedImage && (
              <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                Ready to upload: {selectedImage.name}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Full Name */}
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          Full Name
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            className="input pl-10"
            placeholder="Your full name"
          />
        </div>
      </div>

      {/* Username */}
      <div>
        <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          Username*
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiUser className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="input pl-10"
            required
            placeholder="Choose a username"
          />
        </div>
      </div>

      {/* Gender */}
      <div>
        <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          Gender
        </label>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="input"
        >
          <option value="">Select gender</option>
          {GENDER_OPTIONS.map(gender => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </select>
      </div>

      {/* Birth Date */}
      <div>
        <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          Birth Date
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiCalendar className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="date"
            id="birthDate"
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          Location
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiHome className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input pl-10"
            placeholder="City, State"
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="4"
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Tell others about yourself..."
        ></textarea>
      </div>
    </div>
  );

  const renderEducationSection = () => (
    <div className="space-y-6">
      {/* University */}
      <div className="relative">
        <label htmlFor="university" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          University
        </label>
        <input
          type="text"
          id="university"
          name="university"
          value={formData.university}
          onChange={handleUniversityChange}
          onFocus={() => formData.university.length >= 2 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          placeholder="Start typing your university name..."
          autoComplete="off"
        />
        {loadingSuggestions && (
          <div className="absolute right-3 top-9 text-gray-400 dark:text-gray-500">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
          </div>
        )}
        {showSuggestions && universitySuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-lg max-h-60 overflow-y-auto">
            {universitySuggestions.map((university, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectUniversity(university)}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-border text-gray-900 dark:text-dark-text-primary transition-colors"
              >
                {university}
              </button>
            ))}
          </div>
        )}
        {showSuggestions && universitySuggestions.length === 0 && !loadingSuggestions && formData.university.length >= 2 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md shadow-lg px-4 py-2 text-gray-500 dark:text-dark-text-secondary text-sm">
            No universities found
          </div>
        )}
      </div>

      {/* Major */}
      <div>
        <label htmlFor="major" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          Major
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiBookOpen className="text-gray-400 dark:text-gray-500" />
          </div>
          <select
            id="major"
            name="major"
            value={formData.major}
            onChange={handleChange}
            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a major</option>
            {MAJORS.map(major => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Graduation Year */}
      <div>
        <label htmlFor="graduation_year" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          Expected Graduation Year
        </label>
        <select
          id="graduation_year"
          name="graduation_year"
          value={formData.graduation_year}
          onChange={handleChange}
          className="w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        >
          <option value="">Select graduation year</option>
          {graduationYears.map(year => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderSocialSection = () => (
    <div className="space-y-6">
      {/* LinkedIn URL */}
      <div>
        <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-1">
          LinkedIn URL
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiLinkedin className="text-gray-400 dark:text-gray-500" />
          </div>
          <input
            type="text"
            id="linkedin_url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://linkedin.com/in/your-profile"
          />
        </div>
      </div>

      {/* Other Social Links */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-3">
          Other Social Links
        </label>

        {socialLinks.length > 0 && (
          <div className="space-y-3 mb-4">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-1 bg-gray-50 dark:bg-dark-border p-3 rounded-md border border-gray-200 dark:border-dark-border flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900 dark:text-dark-text-primary">{link.platform}: </span>
                    <a
                      href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 dark:text-primary-400 hover:underline truncate"
                    >
                      {link.url}
                    </a>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSocial(link.platform)}
                    className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    aria-label={`Remove ${link.platform}`}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newSocialPlatform}
            onChange={(e) => setNewSocialPlatform(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSocial()}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Platform (e.g. Twitter, GitHub)"
          />
          <input
            type="text"
            value={newSocialUrl}
            onChange={(e) => setNewSocialUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSocial()}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-dark-border bg-white dark:bg-dark-bg text-gray-900 dark:text-dark-text-primary rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="URL"
          />
          <button
            type="button"
            onClick={handleAddSocial}
            disabled={!newSocialPlatform.trim() || !newSocialUrl.trim()}
            className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary-600"
            aria-label="Add social link"
          >
            <FiPlus />
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="bg-white dark:bg-dark-surface border border-gray-200 dark:border-dark-border rounded-lg shadow-sm p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-dark-text-primary mb-6">Edit Profile</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md mb-4">
          {error}
        </div>
      )}

      {/* Section Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border mb-6">
        <nav className="flex -mb-px space-x-4 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveSection('personal')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSection === 'personal'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:border-gray-300 dark:hover:border-dark-border'
            }`}
          >
            <FiUser className="inline mr-2" />
            Personal Info
          </button>
          <button
            onClick={() => setActiveSection('education')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSection === 'education'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:border-gray-300 dark:hover:border-dark-border'
            }`}
          >
            <FiBookOpen className="inline mr-2" />
            Education
          </button>
          <button
            onClick={() => setActiveSection('social')}
            className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeSection === 'social'
                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text-primary hover:border-gray-300 dark:hover:border-dark-border'
            }`}
          >
            <FiUsers className="inline mr-2" />
            Social Links
          </button>
        </nav>
      </div>

      <form onSubmit={handleSubmit}>
        {activeSection === 'personal' && renderPersonalInfoSection()}
        {activeSection === 'education' && renderEducationSection()}
        {activeSection === 'social' && renderSocialSection()}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-dark-border">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-dark-text-primary bg-white dark:bg-dark-bg hover:bg-gray-50 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <FiX className="mr-2" /> Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              'Saving...'
            ) : (
              <>
                <FiSave className="mr-2" /> Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}