// 15. src/components/social/UserList.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../contexts/AuthContext';
import UserCard from './UserCard';
import { FiLoader, FiUserX } from 'react-icons/fi';

export default function UserList({ filter = {}, searchTerm = '', maxUsers = 12 }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState([]);
  const { user } = useAuth();
  
  // Fetch users and following status
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      
      try {
        // Fetch following relationships first
        let followingIds = [];
        
        if (user) {
          const { data: followingData } = await supabase
            .from('follows')
            .select('followed_id')
            .eq('follower_id', user.id);
            
          if (followingData) {
            followingIds = followingData.map(f => f.followed_id);
            setFollowing(followingIds);
          }
        }
        
        // Build query for users
        let query = supabase
          .from('profiles')
          .select('*');
        
        // Apply filters
        if (filter.major) {
          query = query.eq('major', filter.major);
        }
        
        // Apply search term
        if (searchTerm) {
          query = query.ilike('username', `%${searchTerm}%`);
        }
        
        // Exclude current user if logged in
        if (user) {
          query = query.neq('id', user.id);
        }
        
        // Limit results
        query = query.limit(maxUsers);
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        setUsers(data || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [user, filter, searchTerm, maxUsers]);
  
  const handleFollowToggle = async (userId) => {
    // Update local state optimistically
    if (following.includes(userId)) {
      setFollowing(following.filter(id => id !== userId));
    } else {
      setFollowing([...following, userId]);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FiLoader size={32} className="text-primary-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading users...</p>
      </div>
    );
  }
  
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <FiUserX size={48} className="mb-4" />
        <h3 className="text-lg font-medium mb-1">No users found</h3>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map(user => (
        <UserCard
          key={user.id}
          user={user}
          isFollowing={following.includes(user.id)}
          onFollowToggle={handleFollowToggle}
        />
      ))}
    </div>
  );
}