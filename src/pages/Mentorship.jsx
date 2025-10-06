import { useState } from 'react';
import { FiUsers, FiStar, FiMessageCircle, FiAward, FiFilter, FiSearch } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { MAJORS, YEAR_LEVELS } from '../utils/constants';

const mockMentors = [
  {
    id: 1,
    name: 'Sarah Martinez',
    year: 'Senior',
    major: 'Computer Science',
    avatar: null,
    rating: 4.9,
    mentees: 8,
    maxMentees: 10,
    skills: ['Python', 'Web Development', 'Career Advice'],
    bio: 'Former Google intern, happy to help with coding projects and interview prep!',
    availability: 'Weekday evenings'
  },
  {
    id: 2,
    name: 'Michael Chen',
    year: 'Graduate Student',
    major: 'Engineering',
    avatar: null,
    rating: 5.0,
    mentees: 5,
    maxMentees: 8,
    skills: ['Research', 'Graduate School', 'Project Management'],
    bio: 'PhD candidate specializing in mechanical engineering. Love helping undergrads navigate research opportunities.',
    availability: 'Flexible'
  },
  {
    id: 3,
    name: 'Emma Davis',
    year: 'Junior',
    major: 'Psychology',
    avatar: null,
    rating: 4.8,
    mentees: 6,
    maxMentees: 10,
    skills: ['Study Strategies', 'Time Management', 'Freshman Guidance'],
    bio: 'Passionate about helping first-year students adjust to college life and academics.',
    availability: 'Weekends'
  },
  {
    id: 4,
    name: 'Alex Johnson',
    year: 'Senior',
    major: 'Business Administration',
    avatar: null,
    rating: 4.7,
    mentees: 9,
    maxMentees: 12,
    skills: ['Entrepreneurship', 'Networking', 'Internships'],
    bio: 'Started two campus clubs and landed multiple internships. Here to share what I learned!',
    availability: 'Weekday afternoons'
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    year: 'Graduate Student',
    major: 'Biology',
    avatar: null,
    rating: 4.9,
    mentees: 4,
    maxMentees: 6,
    skills: ['Lab Techniques', 'Research Papers', 'Graduate Applications'],
    bio: 'Working on my PhD in molecular biology. Happy to mentor students interested in research careers.',
    availability: 'By appointment'
  }
];

const mockMentees = [
  {
    id: 6,
    name: 'David Kim',
    year: 'Freshman',
    major: 'Computer Science',
    avatar: null,
    interests: ['Programming', 'Game Development', 'Campus Activities'],
    bio: 'New to CS and looking for guidance on course selection and building a strong foundation.',
    lookingFor: 'Career guidance and coding help'
  },
  {
    id: 7,
    name: 'Rachel Adams',
    year: 'Sophomore',
    major: 'Psychology',
    avatar: null,
    interests: ['Clinical Psychology', 'Research', 'Volunteering'],
    bio: 'Interested in clinical psychology and need advice on preparing for grad school.',
    lookingFor: 'Graduate school preparation'
  }
];

export default function Mentorship() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('find-mentor'); // 'find-mentor' or 'find-mentee'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [myConnections, setMyConnections] = useState([1, 3]); // Mock connected mentor IDs

  const displayList = viewMode === 'find-mentor' ? mockMentors : mockMentees;

  const filteredList = displayList.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMajor = !selectedMajor || person.major === selectedMajor;
    return matchesSearch && matchesMajor;
  });

  const handleConnect = (personId) => {
    if (myConnections.includes(personId)) {
      setMyConnections(myConnections.filter(id => id !== personId));
    } else {
      setMyConnections([...myConnections, personId]);
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
              Mentorship Program
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Connect with mentors or become a mentor to help fellow students
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex bg-white dark:bg-dark-surface rounded-lg p-1 border border-border dark:border-dark-border">
              <button
                onClick={() => setViewMode('find-mentor')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'find-mentor'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              >
                Find a Mentor
              </button>
              <button
                onClick={() => setViewMode('find-mentee')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'find-mentee'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              >
                Find Mentees
              </button>
            </div>
            <button className="btn btn-accent">
              <FiAward className="mr-2" />
              Become a Mentor
            </button>
          </div>

          {/* Search and Filter */}
          <div className="card p-4 sm:p-6 mb-6">
            <div className="flex flex-col gap-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search ${viewMode === 'find-mentor' ? 'mentors' : 'mentees'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 input"
                />
              </div>
              <select
                value={selectedMajor}
                onChange={(e) => setSelectedMajor(e.target.value)}
                className="input"
              >
                <option value="">All Majors</option>
                {MAJORS.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))}
              </select>
            </div>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredList.map(person => (
              <div key={person.id} className="card p-4 sm:p-6 flex flex-col">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {person.name.charAt(0)}
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-text-primary">
                      {person.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-dark-text-secondary">
                      {person.year} • {person.major}
                    </p>
                  </div>
                </div>

                {viewMode === 'find-mentor' && (
                  <>
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <div className="flex items-center text-yellow-500">
                        <FiStar className="fill-yellow-500 mr-1" />
                        <span className="font-semibold">{person.rating}</span>
                      </div>
                      <div className="text-gray-600 dark:text-dark-text-secondary">
                        {person.mentees}/{person.maxMentees} mentees
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {person.skills.map((skill, idx) => (
                        <span key={idx} className="tag tag-skill text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                {viewMode === 'find-mentee' && (
                  <>
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Looking for: {person.lookingFor}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {person.interests.map((interest, idx) => (
                        <span key={idx} className="tag tag-interest text-xs">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </>
                )}

                <p className="text-sm text-gray-600 dark:text-dark-text-secondary mb-4 flex-1">
                  {person.bio}
                </p>

                {viewMode === 'find-mentor' && person.availability && (
                  <p className="text-xs text-gray-500 dark:text-dark-text-secondary mb-4">
                    Available: {person.availability}
                  </p>
                )}

                <button
                  onClick={() => handleConnect(person.id)}
                  className={`w-full ${
                    myConnections.includes(person.id)
                      ? 'btn btn-secondary'
                      : 'btn btn-primary'
                  }`}
                  disabled={viewMode === 'find-mentor' && !myConnections.includes(person.id) && person.mentees >= person.maxMentees}
                >
                  <FiMessageCircle className="mr-2" />
                  {myConnections.includes(person.id)
                    ? 'Connected'
                    : (viewMode === 'find-mentor' && person.mentees >= person.maxMentees)
                      ? 'Not Available'
                      : 'Connect'}
                </button>
              </div>
            ))}
          </div>

          {filteredList.length === 0 && (
            <div className="card p-12 text-center">
              <FiUsers className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                No {viewMode === 'find-mentor' ? 'mentors' : 'mentees'} found
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
