// src/services/studyGroupService.js
import { supabase } from '../utils/supabaseClient';

export const studyGroupService = {
  // Get all study groups with creator info
  async getStudyGroups(filters = {}) {
    let query = supabase
      .from('study_groups')
      .select(`
        *,
        creator:profiles!creator_id(username, full_name),
        members:study_group_members(count)
      `)
      .eq('is_active', true);

    if (filters.course_code) {
      query = query.eq('course_code', filters.course_code);
    }
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,course_name.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single study group by ID
  async getStudyGroup(groupId) {
    const { data, error } = await supabase
      .from('study_groups')
      .select(`
        *,
        creator:profiles!creator_id(*),
        members:study_group_members(
          *,
          user:profiles(*)
        )
      `)
      .eq('id', groupId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create study group
  async createStudyGroup(groupData) {
    const { data, error } = await supabase
      .from('study_groups')
      .insert(groupData)
      .select()
      .single();

    if (error) throw error;

    // Add creator as admin member
    await this.joinStudyGroup(data.id, groupData.creator_id, 'admin');

    return data;
  },

  // Update study group
  async updateStudyGroup(groupId, updates) {
    const { data, error } = await supabase
      .from('study_groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete study group
  async deleteStudyGroup(groupId) {
    const { error } = await supabase
      .from('study_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  },

  // Join study group
  async joinStudyGroup(groupId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('study_group_members')
      .insert({ group_id: groupId, user_id: userId, role })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Leave study group
  async leaveStudyGroup(groupId, userId) {
    const { error } = await supabase
      .from('study_group_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', userId);

    if (error) throw error;
  },

  // Get user's study groups
  async getUserStudyGroups(userId) {
    const { data, error } = await supabase
      .from('study_group_members')
      .select(`
        *,
        group:study_groups(
          *,
          creator:profiles!creator_id(username, full_name)
        )
      `)
      .eq('user_id', userId);

    if (error) throw error;
    return data.map(m => m.group);
  }
};
