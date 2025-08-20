// File Storage Service using Supabase Storage
import { supabaseBrowser } from './supabaseClient';

export class FileStorageService {
  private supabase = supabaseBrowser();
  
  // Upload file to Supabase Storage with better error handling
  async uploadFile(file: File, bucket: string = 'documents', folder: string = ''): Promise<{
    path: string;
    url: string;
    fullPath: string;
  }> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log('🚀 Starting upload:', { fileName, filePath, size: file.size, type: file.type });

      // Get a fresh client instance to avoid JWT expiry issues
      const freshSupabase = supabaseBrowser();

      // First, check if bucket exists
      console.log('📁 Checking bucket availability...');
      const { data: buckets, error: bucketError } = await freshSupabase.storage.listBuckets();
      
      if (bucketError) {
        console.error('❌ Bucket check error:', bucketError);
        throw new Error(`Cannot access storage: ${bucketError.message}`);
      }

      const bucketExists = buckets?.some((b: any) => b.id === bucket);
      if (!bucketExists) {
        console.error('❌ Bucket not found:', bucket);
        console.log('Available buckets:', buckets?.map((b: any) => b.id));
        throw new Error(`Storage bucket '${bucket}' does not exist. Please run the setup script first.`);
      }

      console.log('✅ Bucket confirmed:', bucket);

      // Upload file
      console.log('📤 Uploading file...');
      const { data, error } = await freshSupabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload failed:', error);
        
        // Handle specific errors
        if (error.message.includes('JWT expired') || error.message.includes('jwt expired')) {
          throw new Error('Authentication expired. Please refresh the page and try again.');
        }
        
        if (error.message.includes('row-level security policy')) {
          throw new Error('Storage permission denied. Please ensure the storage bucket policies are set up correctly.');
        }
        
        if (error.message.includes('not found')) {
          throw new Error(`Storage bucket '${bucket}' not found. Please create it first.`);
        }
        
        if (error.message.includes('already exists')) {
          // Try with upsert if file exists
          const { data: retryData, error: retryError } = await freshSupabase.storage
            .from(bucket)
            .upload(filePath, file, {
              cacheControl: '3600',
              upsert: true
            });
          
          if (retryError) {
            throw new Error(`Upload failed: ${retryError.message}`);
          }
          
          console.log('✅ Upload successful (retry):', retryData);
          
          // Get public URL for retry case
          const { data: retryUrlData } = freshSupabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

          if (!retryUrlData?.publicUrl) {
            throw new Error('Failed to generate public URL');
          }

          return {
            path: filePath,
            url: retryUrlData.publicUrl,
            fullPath: retryData?.path || filePath
          };
        } else {
          throw new Error(`Upload failed: ${error.message}`);
        }
      }

      console.log('✅ Upload successful:', data);

      // Get public URL for normal case
      console.log('🔗 Generating public URL...');
      const { data: urlData } = freshSupabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to generate public URL');
      }

      console.log('✅ Public URL generated:', urlData.publicUrl);

      return {
        path: filePath,
        url: urlData.publicUrl,
        fullPath: data?.path || filePath
      };

    } catch (error) {
      console.error('❌ File upload error:', error);
      
      // Re-throw with user-friendly message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown upload error occurred');
      }
    }
  }

  // Delete file from Supabase Storage
  async deleteFile(filePath: string, bucket: string = 'documents'): Promise<boolean> {
    try {
      const { error } = await this.supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) {
        console.error('Delete error:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('File deleted successfully:', filePath);
      return true;

    } catch (error) {
      console.error('File delete error:', error);
      return false;
    }
  }

  // Get file public URL
  getPublicUrl(filePath: string, bucket: string = 'documents'): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  // Download file as blob
  async downloadFile(filePath: string, bucket: string = 'documents'): Promise<Blob> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .download(filePath);

      if (error) {
        throw new Error(`Download failed: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('File download error:', error);
      throw error;
    }
  }

  // List files in folder
  async listFiles(folder: string = '', bucket: string = 'documents') {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0
        });

      if (error) {
        throw new Error(`List files failed: ${error.message}`);
      }

      return data;

    } catch (error) {
      console.error('List files error:', error);
      throw error;
    }
  }

  // Check if file exists
  async fileExists(filePath: string, bucket: string = 'documents'): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .list('', {
          search: filePath
        });

      return !error && data && data.length > 0;

    } catch (error) {
      console.error('File exists check error:', error);
      return false;
    }
  }
}

export const fileStorageService = new FileStorageService();
