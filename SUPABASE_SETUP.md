# Hướng dẫn Kết nối Supabase

## Bước 1: Tạo Project Supabase

1. Truy cập [https://supabase.com](https://supabase.com)
2. Đăng nhập hoặc tạo tài khoản mới
3. Tạo project mới với tên "facility-hub"
4. Chọn region gần nhất (Singapore cho Việt Nam)
5. Tạo password cho database

## Bước 2: Lấy thông tin kết nối

1. Vào **Settings** → **API**
2. Copy **Project URL** và **anon public** key
3. Lưu thông tin này để cấu hình

## Bước 3: Cấu hình Environment Variables

1. Tạo file `.env.local` từ `.env.local.example`:
```bash
cp .env.local.example .env.local
```

2. Cập nhật thông tin Supabase trong `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Bước 4: Thiết lập Database Schema

1. Vào **SQL Editor** trong Supabase Dashboard
2. Copy nội dung từ file `supabase/schema.sql`
3. Chạy script để tạo tables và functions
4. Kiểm tra tables đã được tạo trong **Table Editor**

## Bước 5: Thiết lập Row Level Security (RLS)

1. Vào **Authentication** → **Policies**  
2. Copy nội dung từ file `supabase/policies.sql`
3. Chạy script để tạo security policies

## Bước 6: Seed Data (Optional)

1. Copy nội dung từ file `supabase/seed.sql`
2. Chạy script để thêm dữ liệu mẫu

## Bước 7: Test Kết nối

1. Restart development server:
```bash
npm run dev
```

2. Truy cập `/procurement` để kiểm tra kết nối
3. Thử thêm/sửa/xóa dữ liệu procurement

## Troubleshooting

### Lỗi kết nối Database
- Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Đảm bảo project Supabase đang hoạt động
- Check browser console để xem error details

### Lỗi RLS (Row Level Security)
- Đảm bảo đã chạy `policies.sql`
- Kiểm tra user authentication
- Tắt RLS tạm thời để test (chỉ cho development)

### Lỗi Schema
- Kiểm tra tất cả tables đã được tạo
- Verify column names và types
- Check foreign key constraints

## Database Schema Overview

### Main Tables:
- `procurement_items` - Quản lý yêu cầu mua sắm
- `devices` - Thiết bị trong hệ thống
- `rooms` - Phòng/khu vực  
- `work_orders` - Đơn công việc
- `documents` - Tài liệu

### Key Features:
- Full-text search với pg_trgm
- Automatic timestamps với triggers
- Row level security policies
- Foreign key relationships
- JSON metadata fields

## Production Deployment

1. Tạo production project trên Supabase
2. Update environment variables trên hosting platform
3. Run migration scripts
4. Test functionality thoroughly
