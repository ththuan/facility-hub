// Test Supabase Storage setup
import { supabaseBrowser } from './lib/supabaseClient';

async function testStorageSetup() {
  const supabase = supabaseBrowser();
  
  console.log('🧪 Testing Supabase Storage setup...');
  
  try {
    // 1. List buckets
    console.log('📁 Checking buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError);
      return;
    }
    
    console.log('✅ Available buckets:', buckets?.map(b => b.id) || []);
    
    // 2. Check if documents bucket exists
    const documentsbucket = buckets?.find(b => b.id === 'documents');
    if (documentsBundle) {
      console.log('✅ Documents bucket exists:', documentsBundle);
    } else {
      console.log('❌ Documents bucket not found!');
      console.log('📋 Please run this SQL in Supabase Dashboard:');
      console.log(`
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;
      `);
      return;
    }
    
    // 3. Test file upload (create a dummy file)
    console.log('📤 Testing file upload...');
    const testFile = new File(['Hello World'], 'test.txt', { type: 'text/plain' });
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('documents')
      .upload('test-folder/test.txt', testFile, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error('❌ Upload test failed:', uploadError);
      if (uploadError.message.includes('row-level security policy')) {
        console.log('🔐 RLS Policy issue detected!');
        console.log('📋 Please run setup-storage-bucket.sql in Supabase Dashboard');
      }
      return;
    }
    
    console.log('✅ Upload test successful:', uploadData);
    
    // 4. Test public URL
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl('test-folder/test.txt');
    
    console.log('✅ Public URL:', urlData.publicUrl);
    
    // 5. Clean up test file
    await supabase.storage.from('documents').remove(['test-folder/test.txt']);
    console.log('🧹 Cleaned up test file');
    
    console.log('🎉 Storage setup test completed successfully!');
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
  }
}

// Run test if in browser
if (typeof window !== 'undefined') {
  console.log('🌐 Running in browser - Storage test available in console');
  (window as any).testStorageSetup = testStorageSetup;
} else {
  console.log('🖥️ Running in Node - Storage test skipped');
}

export { testStorageSetup };
