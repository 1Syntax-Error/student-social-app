import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiUsers, FiPlus, FiSearch, FiBook, FiClock, FiMapPin } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { COURSES } from '../utils/constants';

const mockStudyGroups = [
  {
    id: 1,
    name: 'Calculus II Study Group',
    course: 'MATH 201 - Calculus II',
    members: 8,
    maxMembers: 12,
    description: 'Weekly study sessions for Calculus II. We focus on practice problems and exam prep.',
    schedule: 'Wednesdays 6-8 PM',
    location: 'Library Room 204',
    creator: 'Sarah Johnson'
  },
  {
    id: 2,
    name: 'Intro to CS Project Team',
    course: 'CS 101 - Introduction to Computer Science',
    members: 5,
    maxMembers: 6,
    description: 'Working on final project together. Looking for someone good with Python!',
    schedule: 'Mondays & Thursdays 4-6 PM',
    location: 'Computer Lab B',
    creator: 'Mike Chen'
  },
  {
    id: 3,
    name: 'Physics I Problem Solving',
    course: 'PHYS 101 - Physics I',
    members: 10,
    maxMembers: 15,
    description: 'Collaborative problem-solving sessions. All skill levels welcome!',
    schedule: 'Tuesdays 7-9 PM',
    location: 'Science Building 301',
    creator: 'Emma Davis'
  },
  {
    id: 4,
    name: 'Psychology Study Circle',
    course: 'PSYCH 101 - Introduction to Psychology',
    members: 6,
    maxMembers: 10,
    description: 'Discussion-based study group covering weekly readings and lecture notes.',
    schedule: 'Fridays 3-5 PM',
    location: 'Student Center Lounge',
    creator: 'Alex Turner'
  }
];

export default function StudyGroups() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [myGroups, setMyGroups] = useState([1, 3]); // Mock joined group IDs

  const filteredGroups = mockStudyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = !selectedCourse || group.course === selectedCourse;
    return matchesSearch && matchesCourse;
  });

  const handleJoinGroup = (groupId) => {
    if (myGroups.includes(groupId)) {
      setMyGroups(myGroups.filter(id => id !== groupId));
    } else {
      setMyGroups([...myGroups, groupId]);
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {filteredGroups.map(group => (
              <div key={group.id} className="card p-4 sm:p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-1">
                      {group.name}
                    </h3>
                    <p className="text-sm text-accent-teal font-medium">{group.course}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600 dark:text-dark-text-secondary">
                    <FiUsers />
                    <span className="text-sm">{group.members}/{group.maxMembers}</span>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-dark-text-secondary mb-4">
                  {group.description}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-600 dark:text-dark-text-secondary">
                    <FiClock className="mr-2" />
                    {group.schedule}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-dark-text-secondary">
                    <FiMapPin className="mr-2" />
                    {group.location}
                  </div>
                  <div className="flex items-center text-gray-600 dark:text-dark-text-secondary">
                    <FiUsers className="mr-2" />
                    Created by {group.creator}
                  </div>
                </div>

                <button
                  onClick={() => handleJoinGroup(group.id)}
                  className={`w-full ${
                    myGroups.includes(group.id)
                      ? 'btn btn-secondary'
                      : 'btn btn-primary'
                  }`}
                  disabled={!myGroups.includes(group.id) && group.members >= group.maxMembers}
                >
                  {myGroups.includes(group.id) ? 'Leave Group' :
                   group.members >= group.maxMembers ? 'Group Full' : 'Join Group'}
                </button>
              </div>
            ))}
          </div>

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
