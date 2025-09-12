// File Storage Service - Supabase Storage Integration
// Handles file uploads and management with Supabase Storage

import { supabase } from '@/lib/supabase';

export interface FileUpload {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  public_url?: string;
  bucket_name: string;
  is_public: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface FileUploadRequest {
  file: File;
  bucket_name: string;
  is_public?: boolean;
  metadata?: Record<string, any>;
  folder?: string;
}

export interface FileUploadResponse {
  success: boolean;
  file?: FileUpload;
  error?: string;
}

export interface FileListResponse {
  success: boolean;
  files?: FileUpload[];
  error?: string;
  total?: number;
}

class FileStorageService {
  // Upload a file to Supabase Storage
  async uploadFile(request: FileUploadRequest, userId: string): Promise<FileUploadResponse> {
    try {
      const { file, bucket_name, is_public = false, metadata = {}, folder = '' } = request;
      
      // Generate unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucket_name)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL if file is public
      let publicUrl = '';
      if (is_public) {
        const { data: urlData } = supabase.storage
          .from(bucket_name)
          .getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
      }

      // Store file metadata in database
      const fileData = {
        user_id: userId,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: filePath,
        public_url: publicUrl || null,
        bucket_name,
        is_public,
        metadata
      };

      const { data: dbData, error: dbError } = await supabase
        .from('file_storage')
        .insert(fileData)
        .select()
        .single();

      if (dbError) throw dbError;

      return {
        success: true,
        file: dbData
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload file'
      };
    }
  }

  // Get files for a user
  async getUserFiles(
    userId: string, 
    bucketName?: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<FileListResponse> {
    try {
      let query = supabase
        .from('file_storage')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (bucketName) {
        query = query.eq('bucket_name', bucketName);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        files: data,
        total: data.length
      };
    } catch (error) {
      console.error('Error fetching user files:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch files'
      };
    }
  }

  // Get public files
  async getPublicFiles(
    bucketName?: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<FileListResponse> {
    try {
      let query = supabase
        .from('file_storage')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (bucketName) {
        query = query.eq('bucket_name', bucketName);
      }

      const { data, error } = await query;

      if (error) throw error;

      return {
        success: true,
        files: data,
        total: data.length
      };
    } catch (error) {
      console.error('Error fetching public files:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch public files'
      };
    }
  }

  // Get a specific file by ID
  async getFile(fileId: string, userId: string): Promise<FileUploadResponse> {
    try {
      const { data, error } = await supabase
        .from('file_storage')
        .select('*')
        .eq('id', fileId)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      return {
        success: true,
        file: data
      };
    } catch (error) {
      console.error('Error fetching file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch file'
      };
    }
  }

  // Delete a file
  async deleteFile(fileId: string, userId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // First get file info
      const { data: fileData, error: fetchError } = await supabase
        .from('file_storage')
        .select('storage_path, bucket_name, user_id')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      if (fileData.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      // Delete from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from(fileData.bucket_name)
        .remove([fileData.storage_path]);

      if (storageError) {
        console.warn('Failed to delete file from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }

      // Delete from database
      const { error: dbError } = await supabase
        .from('file_storage')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      return {
        success: true
      };
    } catch (error) {
      console.error('Error deleting file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete file'
      };
    }
  }

  // Update file metadata
  async updateFileMetadata(
    fileId: string, 
    userId: string, 
    updates: {
      is_public?: boolean;
      metadata?: Record<string, any>;
    }
  ): Promise<FileUploadResponse> {
    try {
      // First check if user owns this file
      const { data: existingFile, error: fetchError } = await supabase
        .from('file_storage')
        .select('user_id')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      if (existingFile.user_id !== userId) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      const updateData: any = {};

      if (updates.is_public !== undefined) {
        updateData.is_public = updates.is_public;
      }

      if (updates.metadata !== undefined) {
        updateData.metadata = updates.metadata;
      }

      const { data, error } = await supabase
        .from('file_storage')
        .update(updateData)
        .eq('id', fileId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        file: data
      };
    } catch (error) {
      console.error('Error updating file metadata:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update file metadata'
      };
    }
  }

  // Get file download URL
  async getDownloadUrl(fileId: string, userId: string, expiresIn: number = 3600): Promise<{
    success: boolean;
    url?: string;
    error?: string;
  }> {
    try {
      const { data: fileData, error: fetchError } = await supabase
        .from('file_storage')
        .select('storage_path, bucket_name, user_id, is_public')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Check access permissions
      if (fileData.user_id !== userId && !fileData.is_public) {
        return {
          success: false,
          error: 'Access denied'
        };
      }

      // Get signed URL for download
      const { data: urlData, error: urlError } = await supabase.storage
        .from(fileData.bucket_name)
        .createSignedUrl(fileData.storage_path, expiresIn);

      if (urlError) throw urlError;

      return {
        success: true,
        url: urlData.signedUrl
      };
    } catch (error) {
      console.error('Error getting download URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get download URL'
      };
    }
  }

  // Get storage usage statistics for a user
  async getUserStorageStats(userId: string): Promise<{
    success: boolean;
    stats?: {
      total_files: number;
      total_size: number;
      files_by_bucket: Record<string, { count: number; size: number }>;
      files_by_type: Record<string, { count: number; size: number }>;
    };
    error?: string;
  }> {
    try {
      const { data, error } = await supabase
        .from('file_storage')
        .select('file_size, bucket_name, file_type')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total_files: data.length,
        total_size: 0,
        files_by_bucket: {} as Record<string, { count: number; size: number }>,
        files_by_type: {} as Record<string, { count: number; size: number }>
      };

      data.forEach(file => {
        stats.total_size += file.file_size;

        // Count by bucket
        if (!stats.files_by_bucket[file.bucket_name]) {
          stats.files_by_bucket[file.bucket_name] = { count: 0, size: 0 };
        }
        stats.files_by_bucket[file.bucket_name].count++;
        stats.files_by_bucket[file.bucket_name].size += file.file_size;

        // Count by type
        const fileType = file.file_type.split('/')[0]; // Get main type (image, video, etc.)
        if (!stats.files_by_type[fileType]) {
          stats.files_by_type[fileType] = { count: 0, size: 0 };
        }
        stats.files_by_type[fileType].count++;
        stats.files_by_type[fileType].size += file.file_size;
      });

      return {
        success: true,
        stats
      };
    } catch (error) {
      console.error('Error fetching storage stats:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch storage statistics'
      };
    }
  }
}

export default new FileStorageService();
