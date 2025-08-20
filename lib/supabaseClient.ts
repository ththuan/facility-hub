import { createClient } from '@supabase/supabase-js'

export const supabaseBrowser = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://dummy-placeholder-url.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key_placeholder_for_build'
  
  // For build-time safety, skip client creation if using dummy values
  if (supabaseUrl.includes('dummy-placeholder') || supabaseKey.includes('dummy')) {
    console.log('Using mock Supabase client for build process')
    return null as any
  }
  
  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  )
}
