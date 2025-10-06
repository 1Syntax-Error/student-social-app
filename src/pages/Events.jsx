import { useState } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiFilter, FiPlus } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';

const mockEvents = [
  {
    id: 1,
    title: 'Computer Science Career Fair',
    date: '2025-10-15',
    time: '10:00 AM - 4:00 PM',
    location: 'Student Union Ballroom',
    category: 'Career',
    attendees: 250,
    description: 'Meet with top tech companies and explore internship opportunities.',
    rsvpd: true
  },
  {
    id: 2,
    title: 'Psychology Club Meeting',
    date: '2025-10-08',
    time: '6:00 PM - 7:30 PM',
    location: 'Psychology Building Room 101',
    category: 'Club',
    attendees: 30,
    description: 'Monthly meeting to discuss upcoming events and guest speakers.',
    rsvpd: false
  },
  {
    id: 3,
    title: 'Hackathon 2025',
    date: '2025-10-20',
    time: '9:00 AM - 9:00 PM',
    location: 'Engineering Building',
    category: 'Competition',
    attendees: 120,
    description: '12-hour coding competition with prizes. Form teams of 2-4 students.',
    rsvpd: true
  },
  {
    id: 4,
    title: 'Midterm Study Session - Calculus',
    date: '2025-10-12',
    time: '4:00 PM - 7:00 PM',
    location: 'Library Study Hall',
    category: 'Academic',
    attendees: 45,
    description: 'Group study session led by TAs. Bring your questions!',
    rsvpd: false
  },
  {
    id: 5,
    title: 'Fall Festival',
    date: '2025-10-25',
    time: '2:00 PM - 8:00 PM',
    location: 'Campus Quad',
    category: 'Social',
    attendees: 500,
    description: 'Food, music, games, and fun activities for all students.',
    rsvpd: false
  },
  {
    id: 6,
    title: 'Research Symposium',
    date: '2025-10-18',
    time: '1:00 PM - 5:00 PM',
    location: 'Science Center Auditorium',
    category: 'Academic',
    attendees: 80,
    description: 'Student research presentations across all disciplines.',
    rsvpd: false
  }
];

const categories = ['All', 'Academic', 'Career', 'Social', 'Club', 'Competition', 'Other'];

export default function Events() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [myRSVPs, setMyRSVPs] = useState([1, 3]); // Mock RSVP'd event IDs
  const [viewMode, setViewMode] = useState('upcoming'); // 'upcoming' or 'my-events'

  const handleRSVP = (eventId) => {
    if (myRSVPs.includes(eventId)) {
      setMyRSVPs(myRSVPs.filter(id => id !== eventId));
    } else {
      setMyRSVPs([...myRSVPs, eventId]);
    }
  };

  const filteredEvents = mockEvents.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesView = viewMode === 'upcoming' || myRSVPs.includes(event.id);
    return matchesCategory && matchesView;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
              Campus Events
            </h1>
            <p className="text-gray-600 dark:text-dark-text-secondary">
              Discover and attend events happening on campus
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex bg-white dark:bg-dark-surface rounded-lg p-1 border border-border dark:border-dark-border">
              <button
                onClick={() => setViewMode('upcoming')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'upcoming'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              >
                Upcoming Events
              </button>
              <button
                onClick={() => setViewMode('my-events')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'my-events'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              >
                My Events ({myRSVPs.length})
              </button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="card p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
              <FiFilter className="text-gray-600 dark:text-dark-text-secondary" />
              <span className="text-sm font-medium text-gray-700 dark:text-dark-text-primary">Category:</span>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-dark-border text-gray-700 dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-dark-border/80'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {sortedEvents.map(event => (
              <div key={event.id} className="card p-4 sm:p-6 flex flex-col">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`badge ${
                      event.category === 'Academic' ? 'badge-primary' :
                      event.category === 'Career' ? 'badge-teal' :
                      event.category === 'Social' ? 'badge-peach' :
                      event.category === 'Club' ? 'badge-sage' :
                      'badge-primary'
                    }`}>
                      {event.category}
                    </span>
                    {myRSVPs.includes(event.id) && (
                      <span className="text-xs font-semibold text-accent-teal">✓ RSVP'd</span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">
                    {event.description}
                  </p>
                </div>

                <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-dark-text-secondary flex-1">
                  <div className="flex items-center">
                    <FiCalendar className="mr-2 flex-shrink-0" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center">
                    <FiClock className="mr-2 flex-shrink-0" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <FiMapPin className="mr-2 flex-shrink-0" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <FiUsers className="mr-2 flex-shrink-0" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRSVP(event.id)}
                  className={`w-full ${
                    myRSVPs.includes(event.id)
                      ? 'btn btn-secondary'
                      : 'btn btn-primary'
                  }`}
                >
                  {myRSVPs.includes(event.id) ? 'Cancel RSVP' : 'RSVP'}
                </button>
              </div>
            ))}
          </div>

          {sortedEvents.length === 0 && (
            <div className="card p-12 text-center">
              <FiCalendar className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-medium text-gray-900 dark:text-dark-text-primary mb-2">
                No events found
              </h3>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                {viewMode === 'my-events' ? 'You haven\'t RSVP\'d to any events yet.' : 'Check back later for new events!'}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
