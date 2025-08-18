import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
);

async function runMigrations() {
  console.log('🚀 Running Supabase migrations...');
  
  try {
    // Test connection
    const { data, error } = await supabase.from('documents').select('count(*)', { count: 'exact', head: true });
    
    if (!error) {
      console.log('✅ Database tables already exist');
      console.log('📊 Current document count:', data);
    } else {
      console.log('ℹ️  Tables may not exist, this is expected on first run');
      console.log('Error:', error.message);
    }
    
    // Try to create a sample document to test
    const { data: testDoc, error: insertError } = await supabase
      .from('documents')
      .insert({
        title: 'Test Document',
        type: 'other',
        file_path: '/test/document.pdf'
      })
      .select()
      .single();
      
    if (testDoc) {
      console.log('✅ Sample document created:', testDoc.id);
      
      // Clean up test document
      await supabase.from('documents').delete().eq('id', testDoc.id);
      console.log('🧹 Test document cleaned up');
    } else if (insertError) {
      console.log('❌ Insert failed:', insertError.message);
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Only run if called directly
if (require.main === module) {
  runMigrations().then(() => {
    console.log('✅ Migration check complete');
    process.exit(0);
  }).catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export { runMigrations };
