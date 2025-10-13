import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiPlus, FiSearch, FiBook, FiClock, FiMapPin, FiLoader } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';
import { COURSES } from '../utils/constants';

export default function StudyGroups() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [studyGroups, setStudyGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudyGroups();
  }, [user]);

  const fetchStudyGroups = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all study groups with creator info and member count
      const { data: groups, error: groupsError } = await supabase
        .from('study_groups')
        .select(`
          *,
          creator:profiles!study_groups_creator_id_fkey(username),
          members:study_group_members(count)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      // Fetch user's joined groups
      const { data: userGroups, error: userGroupsError } = await supabase
        .from('study_group_members')
        .select('group_id')
        .eq('user_id', user.id);

      if (userGroupsError) throw userGroupsError;

      setMyGroups(userGroups ? userGroups.map(g => g.group_id) : []);
      setStudyGroups(groups || []);
    } catch (error) {
      console.error('Error fetching study groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const courseFull = group.course_code && group.course_name ?
      `${group.course_code} - ${group.course_name}` : group.course_code || group.course_name || '';
    const matchesCourse = !selectedCourse || courseFull === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleJoinGroup = async (groupId) => {
    if (!user) return;

    try {
      if (myGroups.includes(groupId)) {
        // Leave group
        const { error } = await supabase
          .from('study_group_members')
          .delete()
          .eq('group_id', groupId)
          .eq('user_id', user.id);

        if (error) throw error;
        setMyGroups(myGroups.filter(id => id !== groupId));
      } else {
        // Join group
        const { error } = await supabase
          .from('study_group_members')
          .insert([
            { group_id: groupId, user_id: user.id, role: 'member' }
          ]);

        if (error) throw error;
        setMyGroups([...myGroups, groupId]);
      }

      // Refresh the groups to update member count
      fetchStudyGroups();
    } catch (error) {
      console.error('Error joining/leaving group:', error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Study Groups
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Join or create study groups with your classmates
            </p>
          </div>

          {/* Search and Filter */}
          <div className="card p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search study groups..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input"
                  />
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary whitespace-nowrap"
                >
                  <FiPlus className="mr-2" />
                  Create Group
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
            </div>
          </div>

          {/* Study Groups Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader size={32} className="text-primary-500 dark:text-primary-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {filteredGroups.map(group => {
                const memberCount = group.members?.[0]?.count || 0;
                const courseFull = group.course_code && group.course_name ?
                  `${group.course_code} - ${group.course_name}` : group.course_code || group.course_name || 'No course';

                return (
                  <div key={group.id} className="card p-4 sm:p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                          {group.name}
                        </h3>
                        <p className="text-sm text-accent-teal font-medium">{courseFull}</p>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600 dark:text-dark-text-secondary">
                        <FiUsers />
                        <span className="text-sm">{memberCount}/{group.max_members}</span>
                      </div>
                    </div>

                    {group.description && (
                      <p className="text-gray-700 dark:text-dark-text-secondary mb-4">
                        {group.description}
                      </p>
                    )}

                    <div className="space-y-2 mb-4 text-sm">
                      {group.meeting_schedule && (
                        <div className="flex items-center text-gray-600 dark:text-dark-text-secondary">
                          <FiClock className="mr-2" />
                          {group.meeting_schedule}
                        </div>
                      )}
                      {group.location && (
                        <div className="flex items-center text-gray-600 dark:text-dark-text-secondary">
                          <FiMapPin className="mr-2" />
                          {group.location}
                        </div>
                      )}
                      {group.creator && (
                        <div className="flex items-center text-gray-600 dark:text-dark-text-secondary">
                          <FiUsers className="mr-2" />
                          Created by {group.creator.username}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleJoinGroup(group.id)}
                      className={`w-full ${
                        myGroups.includes(group.id)
                          ? 'btn btn-secondary'
                          : 'btn btn-primary'
                      }`}
                      disabled={!myGroups.includes(group.id) && memberCount >= group.max_members}
                    >
                      {myGroups.includes(group.id) ? 'Leave Group' :
                       memberCount >= group.max_members ? 'Group Full' : 'Join Group'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {filteredGroups.length === 0 && (
            <div className="card p-12 text-center">
              <FiBook className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                No study groups found
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                Be the first to create a study group for this course!
              </p>
              <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                <FiPlus className="mr-2" />
                Create Study Group
              </button>
            </div>
          )}

          {/* Create Group Modal Placeholder */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-4 dark:text-dark-text-primary">Create Study Group</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary mb-4">
                  This feature will allow you to create a new study group with course selection, schedule, and location.
                </p>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-primary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
