import { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiFilter, FiPlus, FiLoader } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

const categories = ['All', 'Academic', 'Career', 'Social', 'Club', 'Competition', 'Sports', 'Other'];

export default function Events() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [events, setEvents] = useState([]);
  const [myRSVPs, setMyRSVPs] = useState([]);
  const [viewMode, setViewMode] = useState('upcoming');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all active events with attendee count
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_creator_id_fkey(username),
          rsvps:event_rsvps(count)
        `)
        .eq('is_active', true)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (eventsError) throw eventsError;

      // Fetch user's RSVPs
      const { data: userRSVPs, error: rsvpsError } = await supabase
        .from('event_rsvps')
        .select('event_id')
        .eq('user_id', user.id)
        .eq('status', 'going');

      if (rsvpsError) throw rsvpsError;

      setMyRSVPs(userRSVPs ? userRSVPs.map(r => r.event_id) : []);
      setEvents(eventsData || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    if (!user) return;

    try {
      if (myRSVPs.includes(eventId)) {
        // Cancel RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .delete()
          .eq('event_id', eventId)
          .eq('user_id', user.id);

        if (error) throw error;
        setMyRSVPs(myRSVPs.filter(id => id !== eventId));
      } else {
        // RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .insert([
            { event_id: eventId, user_id: user.id, status: 'going' }
          ]);

        if (error) throw error;
        setMyRSVPs([...myRSVPs, eventId]);
      }

      // Refresh events to update attendee count
      fetchEvents();
    } catch (error) {
      console.error('Error handling RSVP:', error);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.event_type === selectedCategory;
    const matchesView = viewMode === 'upcoming' || myRSVPs.includes(event.id);
    return matchesCategory && matchesView;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

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
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader size={32} className="text-primary-500 dark:text-primary-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {sortedEvents.map(event => {
                const attendeeCount = event.rsvps?.[0]?.count || 0;
                const startDate = new Date(event.start_time);
                const endDate = event.end_time ? new Date(event.end_time) : null;
                const timeRange = `${startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}${endDate ? ` - ${endDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}` : ''}`;

                return (
                  <div key={event.id} className="card p-4 sm:p-6 flex flex-col">
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`badge ${
                          event.event_type === 'Academic' ? 'badge-primary' :
                          event.event_type === 'Career' ? 'badge-teal' :
                          event.event_type === 'Social' ? 'badge-peach' :
                          event.event_type === 'Club' ? 'badge-sage' :
                          'badge-primary'
                        }`}>
                          {event.event_type || 'Event'}
                        </span>
                        {myRSVPs.includes(event.id) && (
                          <span className="text-xs font-semibold text-accent-teal">✓ RSVP'd</span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-text-primary mb-2">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-gray-600 dark:text-dark-text-secondary text-sm mb-4">
                          {event.description}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-dark-text-secondary flex-1">
                      <div className="flex items-center">
                        <FiCalendar className="mr-2 flex-shrink-0" />
                        <span>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center">
                        <FiClock className="mr-2 flex-shrink-0" />
                        <span>{timeRange}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center">
                          <FiMapPin className="mr-2 flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <FiUsers className="mr-2 flex-shrink-0" />
                        <span>{attendeeCount} {attendeeCount === 1 ? 'person' : 'people'} attending</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleRSVP(event.id)}
                      className={`w-full ${
                        myRSVPs.includes(event.id)
                          ? 'btn btn-secondary'
                          : 'btn btn-primary'
                      }`}
                      disabled={event.max_attendees && !myRSVPs.includes(event.id) && attendeeCount >= event.max_attendees}
                    >
                      {myRSVPs.includes(event.id) ? 'Cancel RSVP' :
                       event.max_attendees && attendeeCount >= event.max_attendees ? 'Event Full' : 'RSVP'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

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
