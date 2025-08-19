// Simple script to guide database authentication setup
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function checkSupabaseConnection() {
  console.log('='.repeat(60));
  console.log('🔍 FACILITY HUB - TÌNH TRẠNG DATABASE AUTHENTICATION');
  console.log('='.repeat(60));
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase không được cấu hình trong .env.local');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  console.log('📋 Thông tin Supabase:');
  console.log('   URL:', supabaseUrl);
  console.log('   Dashboard:', supabaseUrl.replace('/rest/v1', '').replace('supabase.co', 'supabase.co'));
  console.log('');

  // Test basic connection with rooms table
  try {
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id')
      .limit(1);

    if (error) {
      console.log('❌ Lỗi kết nối database:', error.message);
      return;
    } else {
      console.log('✅ Kết nối database thành công');
    }
  } catch (err) {
    console.log('❌ Lỗi kết nối:', err.message);
    return;
  }

  console.log('');
  console.log('🏗️  TÌNH TRẠNG HỆ THỐNG AUTHENTICATION:');
  console.log('');
  
  // Check current authentication system
  console.log('📍 Hiện tại: Sử dụng localStorage (dữ liệu local)');
  console.log('   ✅ Hoạt động: Có thể tạo/sửa/xóa user');
  console.log('   ❌ Hạn chế: Dữ liệu chỉ lưu trên máy local');
  console.log('   ❌ Bảo mật: Mật khẩu không được mã hóa');
  console.log('');
  
  console.log('🎯 Mục tiêu: Chuyển sang database authentication');
  console.log('   ✅ Lưu trữ: Dữ liệu trên cloud database');
  console.log('   ✅ Bảo mật: Mật khẩu được mã hóa bcrypt');
  console.log('   ✅ Chia sẻ: Nhiều người dùng cùng hệ thống');
  console.log('   ✅ Phân quyền: Chi tiết theo module/action');
  console.log('');

  console.log('🔧 BƯỚC THỰC HIỆN:');
  console.log('');
  console.log('📋 BƯỚC 1: Tạo bảng trong Supabase Dashboard');
  console.log('   1. Truy cập:', supabaseUrl.replace('/rest/v1', ''));
  console.log('   2. Vào "SQL Editor"');
  console.log('   3. Chạy script: scripts/setup-auth-database.sql');
  console.log('   4. Hoặc copy-paste nội dung file SQL');
  console.log('');
  
  console.log('📋 BƯỚC 2: Cập nhật code ứng dụng');
  console.log('   1. File: contexts/AuthContext.tsx');
  console.log('      - Import SupabaseAuthService');
  console.log('      - Thay authManager bằng supabaseAuthService');
  console.log('');
  console.log('   2. File: app/admin/users/page.tsx');
  console.log('      - Cập nhật import service');
  console.log('      - Sử dụng async/await cho các API calls');
  console.log('');
  console.log('   3. File: lib/serviceFactory.ts');
  console.log('      - Thêm authentication service factory');
  console.log('');

  console.log('📋 BƯỚC 3: Test và verify');
  console.log('   1. Kiểm tra đăng nhập admin/admin123');
  console.log('   2. Test tạo user mới');
  console.log('   3. Kiểm tra phân quyền');
  console.log('');

  console.log('🚀 Tài khoản mặc định sau khi setup:');
  console.log('   Username: admin');
  console.log('   Password: admin123');
  console.log('   Email: admin@facility-hub.com');
  console.log('');

  console.log('⚡ KHUYẾN NGHỊ:');
  console.log('   - Backup localStorage data trước khi chuyển đổi');
  console.log('   - Test trên môi trường development trước');
  console.log('   - Đổi mật khẩu admin sau khi setup');
  console.log('   - Cấu hình RLS policies cho security');
  console.log('');

  console.log('📁 Các file quan trọng:');
  console.log('   📄 scripts/setup-auth-database.sql - SQL script tạo bảng');
  console.log('   📄 lib/supabaseAuthService.ts - Authentication service');
  console.log('   📄 contexts/AuthContext.tsx - Auth context (cần update)');
  console.log('   📄 app/admin/users/page.tsx - Admin page (cần update)');
  console.log('');

  console.log('='.repeat(60));
}

// Run the check
if (require.main === module) {
  checkSupabaseConnection();
}

module.exports = { checkSupabaseConnection };
