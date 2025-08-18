// API route to check storage bucket status
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Check buckets
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      return NextResponse.json({ 
        error: 'Failed to list buckets', 
        details: bucketError.message 
      }, { status: 500 });
    }

    const documentsBucket = buckets?.find(b => b.id === 'documents');

    // Check policies  
    const { data: policies, error: policyError } = await supabase
      .from('storage.policies')
      .select('*')
      .eq('bucket_id', 'documents');

    return NextResponse.json({
      status: 'success',
      buckets: buckets?.map(b => ({ id: b.id, name: b.name, public: b.public })),
      documentsBucket,
      documentsBucketExists: !!documentsBucket,
      policies: policies || [],
      policyCount: policies?.length || 0
    });

  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
