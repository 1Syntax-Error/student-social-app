// 17. src/components/profile/ProfileDetails.jsx
import { FiLink, FiLinkedin, FiTwitter, FiGithub, FiGlobe } from 'react-icons/fi';

export default function ProfileDetails({ profile }) {
  // Parse other_socials JSON object
  const otherSocials = profile.other_socials || {};
  
  // Function to render social media links
  const renderSocialLink = (url, icon, label) => {
    if (!url) return null;
    
    return (
      <a
        href={url.startsWith('http') ? url : `https://${url}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center text-gray-600 hover:text-primary-600"
      >
        {icon}
        <span className="ml-2">{label}</span>
      </a>
    );
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Connect</h2>
      
      <div className="space-y-3">
        {/* LinkedIn */}
        {profile.linkedin_url && (
          <div>
            {renderSocialLink(
              profile.linkedin_url,
              <FiLinkedin className="text-blue-700" />,
              'LinkedIn'
            )}
          </div>
        )}
        
        {/* Twitter */}
        {otherSocials.twitter && (
          <div>
            {renderSocialLink(
              otherSocials.twitter,
              <FiTwitter className="text-blue-400" />,
              'Twitter'
            )}
          </div>
        )}
        
        {/* GitHub */}
        {otherSocials.github && (
          <div>
            {renderSocialLink(
              otherSocials.github,
              <FiGithub className="text-gray-800" />,
              'GitHub'
            )}
          </div>
        )}
        
        {/* Personal website */}
        {otherSocials.website && (
          <div>
            {renderSocialLink(
              otherSocials.website,
              <FiGlobe className="text-green-600" />,
              'Website'
            )}
          </div>
        )}
        
        {/* Other custom links */}
        {Object.entries(otherSocials).filter(([key]) => !['twitter', 'github', 'website'].includes(key)).map(([key, value]) => (
          <div key={key}>
            {renderSocialLink(
              value,
              <FiLink className="text-gray-500" />,
              key.charAt(0).toUpperCase() + key.slice(1)
            )}
          </div>
        ))}
        
        {/* Message if no links are available */}
        {!profile.linkedin_url && Object.keys(otherSocials).length === 0 && (
          <p className="text-gray-500 italic">No social links added yet</p>
        )}
      </div>
    </div>
  );
}
