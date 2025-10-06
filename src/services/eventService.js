// src/services/eventService.js
import { supabase } from '../utils/supabaseClient';

export const eventService = {
  // Get all events
  async getEvents(filters = {}) {
    let query = supabase
      .from('events')
      .select(`
        *,
        creator:profiles!creator_id(username, full_name),
        rsvps:event_rsvps(count)
      `)
      .eq('is_active', true);

    if (filters.event_type) {
      query = query.eq('event_type', filters.event_type);
    }
    if (filters.upcoming) {
      query = query.gte('start_time', new Date().toISOString());
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('start_time', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get single event by ID
  async getEvent(eventId) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        creator:profiles!creator_id(*),
        rsvps:event_rsvps(
          *,
          user:profiles(*)
        )
      `)
      .eq('id', eventId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create event
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update event
  async updateEvent(eventId, updates) {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', eventId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete event
  async deleteEvent(eventId) {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) throw error;
  },

  // RSVP to event
  async rsvpToEvent(eventId, userId, status = 'going') {
    const { data, error } = await supabase
      .from('event_rsvps')
      .upsert(
        { event_id: eventId, user_id: userId, status },
        { onConflict: 'event_id,user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Cancel RSVP
  async cancelRsvp(eventId, userId) {
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get user's RSVPs
  async getUserRsvps(userId) {
    const { data, error } = await supabase
      .from('event_rsvps')
      .select(`
        *,
        event:events(
          *,
          creator:profiles!creator_id(username, full_name)
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'going');

    if (error) throw error;
    return data.map(r => r.event);
  }
};
