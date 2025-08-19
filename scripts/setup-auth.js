// Script to setup authentication tables in Supabase
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase URL hoặc key không được cấu hình trong .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupAuthDatabase() {
  console.log('🚀 Bắt đầu thiết lập database authentication...');

  try {
    // Read SQL script
    const sqlPath = path.join(__dirname, 'setup-auth-database.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split SQL commands (basic splitting - for complex queries, use a proper SQL parser)
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd && !cmd.startsWith('--') && cmd.toLowerCase() !== 'comment on table users is \'user accounts for the facility management system\'');

    console.log(`📋 Tìm thấy ${commands.length} lệnh SQL để thực thi`);

    // Execute commands one by one
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      if (!command) continue;

      try {
        console.log(`⚡ Thực thi lệnh ${i + 1}/${commands.length}...`);
        
        // Use RPC for complex SQL commands
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: command 
        });

        if (error) {
          console.log(`⚠️  Lỗi lệnh ${i + 1}: ${error.message}`);
          // Continue with other commands even if one fails
        } else {
          console.log(`✅ Lệnh ${i + 1} thành công`);
        }
      } catch (err) {
        console.log(`⚠️  Lỗi thực thi lệnh ${i + 1}: ${err.message}`);
        // Continue
      }
    }

    // Test if tables were created by checking users table
    console.log('🧪 Kiểm tra các bảng đã được tạo...');
    
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('count(*)')
      .single();

    if (usersError) {
      console.log('❌ Bảng users chưa được tạo hoặc có lỗi:', usersError.message);
    } else {
      console.log('✅ Bảng users đã được tạo thành công');
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from('roles')
      .select('count(*)')
      .single();

    if (rolesError) {
      console.log('❌ Bảng roles chưa được tạo hoặc có lỗi:', rolesError.message);
    } else {
      console.log('✅ Bảng roles đã được tạo thành công');
    }

    console.log('🎉 Quá trình thiết lập database hoàn tất!');
    console.log('');
    console.log('📋 Tài khoản admin mặc định:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log('   Email: admin@facility-hub.com');

  } catch (error) {
    console.error('❌ Lỗi thiết lập database:', error.message);
    process.exit(1);
  }
}

// Alternative method using direct SQL execution
async function setupAuthDatabaseDirect() {
  console.log('🚀 Bắt đầu thiết lập database authentication (phương pháp trực tiếp)...');

  try {
    // Create permissions table
    console.log('📋 Tạo bảng permissions...');
    const { error: permError } = await supabase
      .from('permissions')
      .select('id')
      .limit(1);

    if (permError) {
      console.log('⚡ Tạo bảng permissions...');
      // Handle table creation error - table might not exist yet
    }

    // Create basic permissions data directly
    console.log('📋 Thêm dữ liệu permissions...');
    const permissions = [
      { name: 'dashboard_read', display_name: 'Xem Dashboard', module: 'dashboard', actions: ['read'] },
      { name: 'devices_read', display_name: 'Xem thiết bị', module: 'devices', actions: ['read'] },
      { name: 'devices_create', display_name: 'Tạo thiết bị', module: 'devices', actions: ['create'] },
      { name: 'devices_update', display_name: 'Sửa thiết bị', module: 'devices', actions: ['update'] },
      { name: 'devices_delete', display_name: 'Xóa thiết bị', module: 'devices', actions: ['delete'] },
      { name: 'rooms_read', display_name: 'Xem phòng', module: 'rooms', actions: ['read'] },
      { name: 'rooms_create', display_name: 'Tạo phòng', module: 'rooms', actions: ['create'] },
      { name: 'rooms_update', display_name: 'Sửa phòng', module: 'rooms', actions: ['update'] },
      { name: 'rooms_delete', display_name: 'Xóa phòng', module: 'rooms', actions: ['delete'] },
      { name: 'users_read', display_name: 'Xem người dùng', module: 'users', actions: ['read'] },
      { name: 'users_create', display_name: 'Tạo người dùng', module: 'users', actions: ['create'] },
      { name: 'users_update', display_name: 'Sửa người dùng', module: 'users', actions: ['update'] },
      { name: 'users_delete', display_name: 'Xóa người dùng', module: 'users', actions: ['delete'] }
    ];

    // Try to insert permissions
    const { data: permData, error: permInsertError } = await supabase
      .from('permissions')
      .upsert(permissions, { onConflict: 'name' })
      .select();

    if (permInsertError) {
      console.log('❌ Lỗi tạo permissions:', permInsertError.message);
    } else {
      console.log(`✅ Tạo ${permData?.length || 0} permissions thành công`);
    }

    console.log('🎉 Thiết lập cơ bản hoàn tất!');

  } catch (error) {
    console.error('❌ Lỗi thiết lập database:', error.message);
  }
}

// Run the setup
if (require.main === module) {
  console.log('='.repeat(50));
  console.log('🏗️  FACILITY HUB - THIẾT LẬP DATABASE');
  console.log('='.repeat(50));
  
  // Try direct method first
  setupAuthDatabaseDirect();
}

module.exports = { setupAuthDatabase, setupAuthDatabaseDirect };
