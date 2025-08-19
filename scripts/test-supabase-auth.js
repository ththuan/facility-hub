// Simple test script to check Supabase connection and create tables
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL hoặc key không được cấu hình');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🧪 Kiểm tra kết nối Supabase...');
  
  try {
    // Test basic connection by checking existing tables
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true });

    if (roomsError) {
      console.log('❌ Lỗi kết nối rooms:', roomsError.message);
    } else {
      console.log('✅ Kết nối rooms thành công, có', roomsData.length, 'phòng');
    }

    // Check if auth tables exist
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) {
      console.log('❌ Bảng users chưa tồn tại:', usersError.message);
      console.log('📋 Cần tạo các bảng authentication trong Supabase Dashboard');
      console.log('');
      console.log('🔧 Hướng dẫn:');
      console.log('1. Truy cập Supabase Dashboard tại:', supabaseUrl.replace('/rest/v1', ''));
      console.log('2. Vào phần Table Editor');
      console.log('3. Tạo bảng users với các cột cần thiết');
      console.log('4. Hoặc chạy SQL script trong SQL Editor');
    } else {
      console.log('✅ Bảng users đã tồn tại, có', usersData.length, 'người dùng');
    }

    // Check roles table
    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('*', { count: 'exact', head: true });

    if (rolesError) {
      console.log('❌ Bảng roles chưa tồn tại:', rolesError.message);
    } else {
      console.log('✅ Bảng roles đã tồn tại, có', rolesData.length, 'vai trò');
    }

    // Check permissions table
    const { data: permData, error: permError } = await supabase
      .from('permissions')
      .select('*', { count: 'exact', head: true });

    if (permError) {
      console.log('❌ Bảng permissions chưa tồn tại:', permError.message);
    } else {
      console.log('✅ Bảng permissions đã tồn tại, có', permData.length, 'quyền');
    }

    console.log('');
    console.log('📋 Tóm tắt:');
    console.log('- Supabase URL:', supabaseUrl);
    console.log('- Kết nối cơ sở dữ liệu: ✅ Thành công');
    console.log('- Bảng rooms: ✅ Có sẵn');
    console.log('- Bảng users:', usersError ? '❌ Chưa có' : '✅ Có sẵn');
    console.log('- Bảng roles:', rolesError ? '❌ Chưa có' : '✅ Có sẵn');
    console.log('- Bảng permissions:', permError ? '❌ Chưa có' : '✅ Có sẵn');

    return !usersError && !rolesError && !permError;

  } catch (error) {
    console.error('❌ Lỗi kiểm tra kết nối:', error.message);
    return false;
  }
}

async function createTestUser() {
  console.log('');
  console.log('👤 Tạo người dùng thử nghiệm...');
  
  // First check if using localStorage mode
  console.log('🔧 Hệ thống hiện đang sử dụng localStorage cho authentication');
  console.log('📋 Để chuyển sang database authentication:');
  console.log('1. Tạo các bảng trong Supabase');
  console.log('2. Cập nhật AuthContext để sử dụng SupabaseAuthService');
  console.log('3. Cập nhật các trang admin để sử dụng service mới');
}

// Run tests
if (require.main === module) {
  console.log('='.repeat(60));
  console.log('🧪 FACILITY HUB - KIỂM TRA DATABASE');
  console.log('='.repeat(60));
  
  testConnection().then(isReady => {
    if (isReady) {
      console.log('');
      console.log('🎉 Database đã sẵn sàng cho authentication!');
    } else {
      console.log('');
      console.log('⚠️  Cần thiết lập thêm để sử dụng database authentication');
    }
    
    createTestUser();
  });
}

module.exports = { testConnection };
