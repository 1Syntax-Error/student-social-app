import { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiUsers, FiFilter, FiPlus, FiLoader, FiSearch, FiImage, FiX, FiTrash2 } from 'react-icons/fi';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabaseClient';

const categories = ['All', 'Academic', 'Career', 'Social', 'Club', 'Competition', 'Sports', 'Other'];

export default function Events() {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState([]);
  const [myRSVPs, setMyRSVPs] = useState([]);
  const [viewMode, setViewMode] = useState('upcoming');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'Academic',
    startTime: '',
    endTime: '',
    location: '',
    maxAttendees: ''
  });

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch all active events with attendee count
      // TEMPORARILY REMOVED THE FUTURE DATE FILTER TO DEBUG
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select(`
          *,
          creator:profiles!events_creator_id_fkey(username),
          rsvps:event_rsvps(count)
        `)
        .eq('is_active', true)
        // .gte('start_time', new Date().toISOString()) // COMMENTED OUT FOR DEBUGGING
        .order('start_time', { ascending: false }); // Show newest first for debugging

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
        throw eventsError;
      }

      console.log('Fetched events:', eventsData);
      console.log('Current time:', new Date().toISOString());

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

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      setSelectedImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!user) return;

    setCreating(true);
    try {
      let imageUrl = null;

      // Upload image if selected
      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('resources')
          .upload(fileName, selectedImage, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('resources')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { data: newEvent, error } = await supabase
        .from('events')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            event_type: formData.eventType,
            start_time: formData.startTime,
            end_time: formData.endTime,
            location: formData.location || null,
            max_attendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : null,
            creator_id: user.id,
            image_url: imageUrl,
            is_active: true
          }
        ])
        .select()
        .single();

      if (error) throw error;

      // Auto-RSVP the creator
      await supabase
        .from('event_rsvps')
        .insert([
          { event_id: newEvent.id, user_id: user.id, status: 'going' }
        ]);

      // Reset form and close modal
      setFormData({
        title: '',
        description: '',
        eventType: 'Academic',
        startTime: '',
        endTime: '',
        location: '',
        maxAttendees: ''
      });
      setSelectedImage(null);
      setImagePreview(null);
      setShowCreateModal(false);

      // Refresh events list
      fetchEvents();
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!user) return;

    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      // First, get the event details to check for image
      const { data: event, error: fetchError } = await supabase
        .from('events')
        .select('image_url, creator_id')
        .eq('id', eventId)
        .single();

      if (fetchError) throw fetchError;

      // Check if user is the creator
      if (event.creator_id !== user.id) {
        alert('You can only delete events you created.');
        return;
      }

      // If event has an image, delete it from storage
      if (event.image_url) {
        try {
          // Extract file path from the URL
          // URL format: https://{project}.supabase.co/storage/v1/object/public/resources/{user_id}/{filename}
          const urlParts = event.image_url.split('/storage/v1/object/public/resources/');
          if (urlParts.length > 1) {
            const filePath = urlParts[1];

            const { error: storageError } = await supabase.storage
              .from('resources')
              .remove([filePath]);

            if (storageError) {
              console.error('Error deleting image from storage:', storageError);
              // Continue with event deletion even if image deletion fails
            }
          }
        } catch (storageError) {
          console.error('Error parsing image URL:', storageError);
          // Continue with event deletion even if image deletion fails
        }
      }

      // Delete the event record from the database
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)
        .eq('creator_id', user.id);

      if (deleteError) throw deleteError;

      // Refresh the events list
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || event.event_type === selectedCategory;
    const matchesView = viewMode === 'upcoming' || myRSVPs.includes(event.id);
    return matchesSearch && matchesCategory && matchesView;
  });

  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

  return (
    <div className="min-h-screen flex flex-col bg-background dark:bg-dark-bg">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-dark-text-primary mb-2">
                Campus Events
              </h1>
              <p className="text-gray-600 dark:text-dark-text-secondary">
                Discover and attend events happening on campus
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary whitespace-nowrap"
            >
              <FiPlus className="mr-2" />
              Create Event
            </button>
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

          {/* Search Bar */}
          <div className="card p-4 sm:p-6 mb-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 input w-full"
              />
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
                const isCreator = user && event.creator_id === user.id;

                return (
                  <div key={event.id} className="card p-0 flex flex-col overflow-hidden">
                    {/* Event Image */}
                    {event.image_url && (
                      <div className="w-full h-48 overflow-hidden relative">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                        {isCreator && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                            title="Delete event"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    )}

                    <div className="p-4 sm:p-6 flex flex-col flex-1">
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
                          <div className="flex items-center gap-2">
                            {myRSVPs.includes(event.id) && (
                              <span className="text-xs font-semibold text-accent-teal">✓ RSVP'd</span>
                            )}
                            {isCreator && !event.image_url && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteEvent(event.id);
                                }}
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Delete event"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            )}
                          </div>
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
          {/* Create Event Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowCreateModal(false)}>
              <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 dark:text-dark-text-primary">Create Campus Event</h2>

                <form onSubmit={handleCreateEvent} className="space-y-4">
                  {/* Event Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Event Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., Career Fair 2024"
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Event Type *
                    </label>
                    <select
                      required
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="input w-full"
                    >
                      {categories.filter(c => c !== 'All').map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Description *
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="input w-full"
                      rows="3"
                      placeholder="Describe your event..."
                    />
                  </div>

                  {/* Date and Time Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        Start Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                        End Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="input w-full"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="input w-full"
                      placeholder="e.g., Student Center Auditorium"
                    />
                  </div>

                  {/* Max Attendees */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Maximum Attendees (Optional)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                      className="input w-full"
                      placeholder="Leave empty for unlimited"
                    />
                  </div>

                  {/* Event Flyer/Image */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-primary mb-2">
                      Event Flyer (Optional)
                    </label>
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Event preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-dark-border"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                        >
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-dark-border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiImage className="w-8 h-8 mb-2 text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-dark-text-secondary">
                            Click to upload event flyer
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            PNG, JPG up to 5MB
                          </p>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                    )}
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
                      {creating ? 'Creating...' : 'Create Event'}
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
