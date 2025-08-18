// Temporary workaround - use any available bucket or create with different approach
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class WorkaroundFileStorageService {
  private static instance: WorkaroundFileStorageService;
  private supabase: SupabaseClient;
  private availableBucket: string | null = null;

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  public static getInstance(): WorkaroundFileStorageService {
    if (!WorkaroundFileStorageService.instance) {
      WorkaroundFileStorageService.instance = new WorkaroundFileStorageService();
    }
    return WorkaroundFileStorageService.instance;
  }

  private async findAvailableBucket(): Promise<string> {
    if (this.availableBucket) return this.availableBucket;

    try {
      console.log('🔍 Looking for available storage buckets...');
      
      const { data: buckets, error } = await this.supabase.storage.listBuckets();
      
      if (error) {
        console.error('❌ Cannot access storage:', error.message);
        throw new Error(`Storage not accessible: ${error.message}`);
      }

      console.log('📋 Available buckets:', buckets?.map(b => b.id) || []);

      if (!buckets || buckets.length === 0) {
        throw new Error('No storage buckets available. Please create a bucket in Supabase Dashboard first.');
      }

      // Prefer 'documents' bucket, fallback to first available
      const documentsBucket = buckets.find(b => b.id === 'documents');
      const firstBucket = buckets[0];
      
      this.availableBucket = documentsBucket ? 'documents' : firstBucket.id;
      
      console.log(`✅ Using bucket: '${this.availableBucket}'`);
      return this.availableBucket;

    } catch (error) {
      console.error('💥 Error finding bucket:', error);
      throw error;
    }
  }

  async uploadFile(file: File, folder: string = ''): Promise<{
    path: string;
    url: string;
    fullPath: string;
  }> {
    try {
      const bucket = await this.findAvailableBucket();

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log('📤 Uploading file to bucket:', bucket, 'path:', filePath);

      // Upload file
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload failed:', error);
        
        // If upload fails, try without folder
        if (folder && error.message.includes('not found')) {
          console.log('🔄 Retrying without folder...');
          const simpleFileName = `${Date.now()}_${file.name}`;
          
          const { data: retryData, error: retryError } = await this.supabase.storage
            .from(bucket)
            .upload(simpleFileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (retryError) {
            throw new Error(`Upload failed: ${retryError.message}`);
          }

          if (!retryData?.path) {
            throw new Error('Upload completed but no path returned');
          }

          const { data: urlData } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(retryData.path);

          return {
            path: retryData.path,
            url: urlData.publicUrl,
            fullPath: `${bucket}/${retryData.path}`
          };
        }
        
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data?.path) {
        throw new Error('Upload completed but no path returned');
      }

      console.log('✅ Upload successful:', data.path);

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: urlData.publicUrl,
        fullPath: `${bucket}/${data.path}`
      };

    } catch (error) {
      console.error('💥 Upload error:', error);
      throw error;
    }
  }

  async deleteFile(bucketName: string, filePath: string): Promise<void> {
    try {
      const { error } = await this.supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('🗑️ File deleted:', filePath);
    } catch (error) {
      console.error('💥 Delete error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const workaroundFileStorage = WorkaroundFileStorageService.getInstance();
