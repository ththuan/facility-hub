// Enhanced File Storage Service with better bucket management
import { createClient, SupabaseClient } from '@supabase/supabase-js';

export class EnhancedFileStorageService {
  private static instance: EnhancedFileStorageService;
  private supabase: SupabaseClient;
  private readonly BUCKET_NAME = 'documents';
  private bucketInitialized = false;

  private constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  public static getInstance(): EnhancedFileStorageService {
    if (!EnhancedFileStorageService.instance) {
      EnhancedFileStorageService.instance = new EnhancedFileStorageService();
    }
    return EnhancedFileStorageService.instance;
  }

  private async ensureBucketExists(): Promise<void> {
    if (this.bucketInitialized) return;

    try {
      console.log('🔍 Checking storage bucket availability...');
      
      // Check existing buckets
      const { data: buckets, error: listError } = await this.supabase.storage.listBuckets();
      
      if (listError) {
        console.error('❌ Failed to list buckets:', listError.message);
        throw new Error(`Storage access denied: ${listError.message}`);
      }

      console.log('📋 Available buckets:', buckets?.map(b => b.id) || []);

      const bucketExists = buckets?.some(bucket => bucket.id === this.BUCKET_NAME);

      if (!bucketExists) {
        console.error(`❌ Bucket '${this.BUCKET_NAME}' not found!`);
        console.log('📝 Please create the bucket manually in Supabase Dashboard or run the SQL setup script.');
        throw new Error(`Storage bucket '${this.BUCKET_NAME}' does not exist. Please create it in Supabase Dashboard first.`);
      } else {
        console.log(`✅ Bucket '${this.BUCKET_NAME}' is available`);
      }

      this.bucketInitialized = true;

    } catch (error) {
      console.error('❌ Bucket check failed:', error);
      throw error;
    }
  }

  async uploadFile(file: File, folder: string = ''): Promise<{
    path: string;
    url: string;
    fullPath: string;
  }> {
    try {
      // Ensure bucket exists first
      await this.ensureBucketExists();

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = folder ? `${folder}/${fileName}` : fileName;

      console.log('📤 Uploading file:', { fileName, size: file.size, type: file.type });

      // Upload file
      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('❌ Upload failed:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }

      if (!data?.path) {
        throw new Error('Upload completed but no path returned');
      }

      console.log('✅ Upload successful:', data.path);

      // Get public URL
      const { data: urlData } = this.supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(data.path);

      return {
        path: data.path,
        url: urlData.publicUrl,
        fullPath: `${this.BUCKET_NAME}/${data.path}`
      };

    } catch (error) {
      console.error('💥 Upload error:', error);
      throw error;
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      await this.ensureBucketExists();

      const { error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('❌ Delete failed:', error);
        throw new Error(`Delete failed: ${error.message}`);
      }

      console.log('🗑️ File deleted:', filePath);
    } catch (error) {
      console.error('💥 Delete error:', error);
      throw error;
    }
  }

  async listFiles(folder: string = ''): Promise<any[]> {
    try {
      await this.ensureBucketExists();

      const { data, error } = await this.supabase.storage
        .from(this.BUCKET_NAME)
        .list(folder);

      if (error) {
        console.error('❌ List failed:', error);
        throw new Error(`List failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('💥 List error:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const enhancedFileStorage = EnhancedFileStorageService.getInstance();
