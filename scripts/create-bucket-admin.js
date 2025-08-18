// Script để tạo storage bucket sử dụng service role key
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

async function createStorageBucket() {
  console.log('🚀 Creating storage bucket...');
  
  // Sử dụng service role key để có quyền admin
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables:');
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!serviceRoleKey);
    return;
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // Kiểm tra bucket hiện có
    console.log('📋 Checking existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Failed to list buckets:', listError);
      return;
    }

    console.log('Current buckets:', buckets?.map(b => b.id) || []);

    const documentsExists = buckets?.some(b => b.id === 'documents');
    
    if (documentsExists) {
      console.log('✅ Documents bucket already exists');
    } else {
      console.log('📁 Creating documents bucket...');
      
      const { data, error } = await supabase.storage.createBucket('documents', {
        public: true,
        fileSizeLimit: 52428800, // 50MB
        allowedMimeTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'text/csv',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
      });

      if (error) {
        console.error('❌ Failed to create bucket:', error);
      } else {
        console.log('✅ Documents bucket created successfully:', data);
      }
    }

    // Tạo policies
    console.log('🔐 Setting up storage policies...');
    
    // Note: RLS policies phải được tạo thông qua SQL, không qua JS API
    console.log('📝 You need to run this SQL in Supabase Dashboard:');
    console.log(`
-- Delete existing policies
DELETE FROM storage.policies WHERE bucket_id = 'documents';

-- Create new policies
INSERT INTO storage.policies (id, bucket_id, role, operation, definition, check_definition)
VALUES
  ('documents_public_read', 'documents', 'public', 'SELECT', 'true', 'true'),
  ('documents_public_insert', 'documents', 'public', 'INSERT', 'true', 'true'),
  ('documents_public_update', 'documents', 'public', 'UPDATE', 'true', 'true'),
  ('documents_public_delete', 'documents', 'public', 'DELETE', 'true', 'true');
    `);

    // Kiểm tra lại
    console.log('🔍 Final check...');
    const { data: finalBuckets } = await supabase.storage.listBuckets();
    console.log('Final buckets:', finalBuckets?.map(b => ({ id: b.id, public: b.public })));

  } catch (error) {
    console.error('💥 Script error:', error);
  }
}

createStorageBucket();
