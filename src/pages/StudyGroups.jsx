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
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course: '',
    maxMembers: 10,
    meetingTime: '',
    location: ''
  });

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

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      // Parse course code and name from COURSES constant
      const [courseCode, courseName] = formData.course ? formData.course.split(' - ') : ['', ''];

      const { data: newGroup, error } = await supabase
        .from('study_groups')
        .insert([
          {
            name: formData.name,
            description: formData.description,
            course_code: courseCode,
            course_name: courseName,
            creator_id: user.id,
            max_members: formData.maxMembers,
            meeting_time: formData.meetingTime || null,
            location: formData.location || null,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator as admin
      await supabase
        .from('study_group_members')
        .insert([
          { group_id: newGroup.id, user_id: user.id, role: 'admin' }
        ]);

      // Reset form and close modal
      setFormData({
        name: '',
        description: '',
        course: '',
        maxMembers: 10,
        meetingTime: '',
        location: ''
      });
      setShowCreateModal(false);

      // Refresh the groups list
      fetchStudyGroups();
    } catch (error) {
      console.error('Error creating study group:', error);
      alert('Failed to create study group. Please try again.');
    } finally {
      setCreating(false);
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

          {/* Create Group Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 dark:text-dark-text-primary">Create Study Group</h2>

                <form onSubmit={handleCreateGroup} className="space-y-4">
                  {/* Group Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., CS 101 Study Group"
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
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                      className="input w-full"
                    >
                      <option value="">Select a course</option>
                      {COURSES.map(course => (
                        <option key={course} value={course}>{course}</option>
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
                      placeholder="What will this study group focus on?"
                    />
                  </div>

                  {/* Max Members */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Maximum Members
                    </label>
                    <input
                      type="number"
                      min="2"
                      max="50"
                      value={formData.maxMembers}
                      onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                      className="input w-full"
                    />
                  </div>

                  {/* Meeting Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Meeting Time (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.meetingTime}
                      onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., Mondays 3-5 PM"
                    />
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., Library Room 204"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="btn btn-secondary flex-1"
                      disabled={creating}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary flex-1"
                      disabled={creating}
                    >
                      {creating ? 'Creating...' : 'Create Group'}
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
