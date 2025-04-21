// 18. src/components/profile/EditProfileForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MAJORS } from '../../utils/constants';
import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';

export default function EditProfileForm() {
  const { profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    major: '',
    bio: '',
    linkedin_url: '',
    other_socials: {}
  });
  
  const [socialLinks, setSocialLinks] = useState([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Initialize form with current profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        major: profile.major || '',
        bio: profile.bio || '',
        linkedin_url: profile.linkedin_url || '',
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
  
  const handleAddSocial = () => {
    if (!newSocialPlatform.trim() || !newSocialUrl.trim()) return;
    
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
      // Convert socialLinks array back to object
      const other_socials = {};
      socialLinks.forEach(link => {
        other_socials[link.platform] = link.url;
      });
      
      const updatedProfile = {
        ...formData,
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
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            Username*
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            required
          />
        </div>
        
        {/* Major */}
        <div>
          <label htmlFor="major" className="block text-sm font-medium text-gray-700 mb-1">
            Major
          </label>
          <select
            id="major"
            name="major"
            value={formData.major}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select a major</option>
            {MAJORS.map(major => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
        </div>
        
        {/* Bio */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Tell others about yourself..."
          ></textarea>
        </div>
        
        {/* LinkedIn URL */}
        <div>
          <label htmlFor="linkedin_url" className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn URL
          </label>
          <input
            type="text"
            id="linkedin_url"
            name="linkedin_url"
            value={formData.linkedin_url}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://linkedin.com/in/your-profile"
          />
        </div>
        
        {/* Other Social Links */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Other Social Links
          </label>
          
          {socialLinks.length > 0 && (
            <div className="space-y-3 mb-4">
              {socialLinks.map((link, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-1 bg-gray-50 p-3 rounded-md border border-gray-200 flex justify-between items-center">
                    <div>
                      <span className="font-medium">{link.platform}: </span>
                      <a 
                        href={link.url.startsWith('http') ? link.url : `https://${link.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline truncate"
                      >
                        {link.url}
                      </a>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocial(link.platform)}
                      className="text-red-500 hover:text-red-700"
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
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Platform (e.g. Twitter, GitHub)"
            />
            <input
              type="text"
              value={newSocialUrl}
              onChange={(e) => setNewSocialUrl(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="URL"
            />
            <button
              type="button"
              onClick={handleAddSocial}
              className="inline-flex items-center p-2 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              aria-label="Add social link"
            >
              <FiPlus />
            </button>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
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
