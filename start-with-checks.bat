@echo off
echo Starting Facility Hub with Storage Setup...

REM Kill any existing node processes
taskkill /F /IM node.exe 2>nul

echo.
echo Checking Supabase connection...
node -e "
const { createClient } = require('@supabase/supabase-js');
const client = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
client.storage.listBuckets().then(({data, error}) => {
  if (error) {
    console.log('❌ Supabase connection error:', error.message);
  } else {
    console.log('✅ Connected to Supabase');
    console.log('📁 Available buckets:', data?.map(b => b.id) || []);
  }
}).catch(console.error);
"

echo.
echo Starting development server...
npm run dev
pause
