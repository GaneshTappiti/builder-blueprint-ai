// BMC Service - Supabase Integration
// Handles Business Model Canvas data with proper database storage

import { supabase } from '@/lib/supabase';

export interface BMCData {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  canvas_data: Record<string, any>;
  wiki_sections: Record<string, any>;
  metadata: Record<string, any>;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface BMCCreateRequest {
  title: string;
  description?: string;
  canvas_data?: Record<string, any>;
  wiki_sections?: Record<string, any>;
  is_public?: boolean;
}

export interface BMCUpdateRequest {
  id: string;
  title?: string;
  description?: string;
  canvas_data?: Record<string, any>;
  wiki_sections?: Record<string, any>;
  is_public?: boolean;
  metadata?: Record<string, any>;
}

export interface BMCResponse {
  success: boolean;
  bmc?: BMCData;
  error?: string;
}

export interface BMCListResponse {
  success: boolean;
  bmcs?: BMCData[];
  error?: string;
  total?: number;
}

class BMCService {
  // Get all BMC data for a user
  async getUserBMCs(userId: string): Promise<BMCListResponse> {
    try {
      const { data, error } = await supabase
        .from('bmc_data')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        bmcs: data,
        total: data.length
      };
    } catch (error) {
      console.error('Error fetching user BMCs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch BMC data'
      };
    }
  }

  // Get public BMC data
  async getPublicBMCs(limit: number = 50, offset: number = 0): Promise<BMCListResponse> {
    try {
      const { data, error } = await supabase
        .from('bmc_data')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        bmcs: data,
        total: data.length
      };
    } catch (error) {
      console.error('Error fetching public BMCs:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch public BMC data'
      };
    }
  }

  // Get a specific BMC by ID
  async getBMC(bmcId: string, userId?: string): Promise<BMCResponse> {
    try {
      const { data, error } = await supabase
        .from('bmc_data')
        .select('*')
        .eq('id', bmcId)
        .single();

      if (error) throw error;

      // Check if user has access to this BMC
      if (data.user_id !== userId && !data.is_public) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      return {
        success: true,
        bmc: data
      };
    } catch (error) {
      console.error('Error fetching BMC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch BMC data'
      };
    }
  }

  // Create a new BMC
  async createBMC(request: BMCCreateRequest, userId: string): Promise<BMCResponse> {
    try {
      const bmcData = {
        user_id: userId,
        title: request.title,
        description: request.description || '',
        canvas_data: request.canvas_data || {},
        wiki_sections: request.wiki_sections || {},
        is_public: request.is_public || false,
        metadata: {}
      };

      const { data, error } = await supabase
        .from('bmc_data')
        .insert(bmcData)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        bmc: data
      };
    } catch (error) {
      console.error('Error creating BMC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create BMC data'
      };
    }
  }

  // Update an existing BMC
  async updateBMC(request: BMCUpdateRequest, userId: string): Promise<BMCResponse> {
    try {
      // First check if user owns this BMC
      const { data: existingBMC, error: fetchError } = await supabase
        .from('bmc_data')
        .select('user_id')
        .eq('id', request.id)
        .single();

      if (fetchError) throw fetchError;

      if (existingBMC.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      if (request.title !== undefined) updateData.title = request.title;
      if (request.description !== undefined) updateData.description = request.description;
      if (request.canvas_data !== undefined) updateData.canvas_data = request.canvas_data;
      if (request.wiki_sections !== undefined) updateData.wiki_sections = request.wiki_sections;
      if (request.is_public !== undefined) updateData.is_public = request.is_public;
      if (request.metadata !== undefined) updateData.metadata = request.metadata;

      const { data, error } = await supabase
        .from('bmc_data')
        .update(updateData)
        .eq('id', request.id)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        bmc: data
      };
    } catch (error) {
      console.error('Error updating BMC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update BMC data'
      };
    }
  }

  // Delete a BMC
  async deleteBMC(bmcId: string, userId: string): Promise<BMCResponse> {
    try {
      // First check if user owns this BMC
      const { data: existingBMC, error: fetchError } = await supabase
        .from('bmc_data')
        .select('user_id')
        .eq('id', bmcId)
        .single();

      if (fetchError) throw fetchError;

      if (existingBMC.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const { error } = await supabase
        .from('bmc_data')
        .delete()
        .eq('id', bmcId);

      if (error) throw error;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting BMC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete BMC data'
      };
    }
  }

  // Toggle BMC privacy
  async toggleBMCPrivacy(bmcId: string, userId: string): Promise<BMCResponse> {
    try {
      // Check if user owns this BMC
      const { data: existingBMC, error: fetchError } = await supabase
        .from('bmc_data')
        .select('user_id, is_public')
        .eq('id', bmcId)
        .single();

      if (fetchError) throw fetchError;

      if (existingBMC.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const { data, error } = await supabase
        .from('bmc_data')
        .update({
          is_public: !existingBMC.is_public,
          updated_at: new Date().toISOString()
        })
        .eq('id', bmcId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        bmc: data
      };
    } catch (error) {
      console.error('Error toggling BMC privacy:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to toggle privacy'
      };
    }
  }
}

export default new BMCService();
