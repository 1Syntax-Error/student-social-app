// src/services/resourceService.js
import { supabase } from '../utils/supabaseClient';

export const resourceService = {
  // Get all resources with filters
  async getResources(filters = {}) {
    let query = supabase
      .from('resources')
      .select(`
        *,
        uploader:profiles!uploader_id(username, full_name)
      `);

    if (filters.course_code) {
      query = query.eq('course_code', filters.course_code);
    }
    if (filters.resource_type) {
      query = query.eq('resource_type', filters.resource_type);
    }
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get single resource by ID
  async getResource(resourceId) {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        uploader:profiles!uploader_id(*)
      `)
      .eq('id', resourceId)
      .single();

    if (error) throw error;
    return data;
  },

  // Create resource
  async createResource(resourceData) {
    const { data, error } = await supabase
      .from('resources')
      .insert(resourceData)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update resource
  async updateResource(resourceId, updates) {
    const { data, error } = await supabase
      .from('resources')
      .update(updates)
      .eq('id', resourceId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete resource
  async deleteResource(resourceId) {
    const { error } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);

    if (error) throw error;
  },

  // Increment download count
  async incrementDownloadCount(resourceId) {
    const { data, error } = await supabase.rpc('increment_downloads', {
      resource_id: resourceId
    });

    // If RPC doesn't exist, fallback to manual increment
    if (error && error.code === '42883') {
      const resource = await this.getResource(resourceId);
      return await this.updateResource(resourceId, {
        downloads_count: (resource.downloads_count || 0) + 1
      });
    }

    if (error) throw error;
    return data;
  },

  // Upload file to Supabase Storage (use fileUpload utility instead)
  async uploadFile(file, userId) {
    const { uploadResourceFile } = await import('../utils/fileUpload');
    return uploadResourceFile(file, userId);
  },

  // Delete file from Supabase Storage (use fileUpload utility instead)
  async deleteFile(fileUrl, bucket = 'resources') {
    const { deleteFile: removeFile } = await import('../utils/fileUpload');
    return removeFile(fileUrl, bucket);
  }
};
