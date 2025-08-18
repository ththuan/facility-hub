# Facility Hub - Cài đặt và Hướng dẫn

## 🚀 Bước 1: Cài đặt Node.js

Trước khi bắt đầu, bạn cần cài đặt Node.js phiên bản 18 trở lên:

### Windows
1. Tải Node.js từ [nodejs.org](https://nodejs.org/)
2. Chạy file installer và làm theo hướng dẫn
3. Mở Command Prompt hoặc PowerShell mới và kiểm tra:
   ```cmd
   node --version
   npm --version
   ```

### macOS
```bash
# Sử dụng Homebrew
brew install node

# Hoặc tải từ nodejs.org
```

### Linux
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

## 📦 Bước 2: Cài đặt Dependencies

Sau khi cài đặt Node.js, chạy lệnh sau trong thư mục dự án:

```bash
npm install
```

Lệnh này sẽ cài đặt tất cả các package cần thiết:
- Next.js 14 (React framework)
- TypeScript
- Tailwind CSS (styling)
- Supabase (backend services)
- React Hook Form & Zod (form handling)
- TanStack Table (data tables)
- date-fns (date utilities)

## ⚙️ Bước 3: Cấu hình Supabase

1. **Tạo project Supabase**:
   - Truy cập [app.supabase.com](https://app.supabase.com)
   - Đăng ký/đăng nhập và tạo project mới
   - Ghi nhớ Project URL và API Keys

2. **Thiết lập environment variables**:
   ```bash
   cp .env.example .env.local
   ```
   
   Chỉnh sửa `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Thiết lập database**:
   - Mở SQL Editor trong Supabase Dashboard
   - Chạy các file SQL theo thứ tự:
     1. `supabase/schema.sql` - Tạo tables và extensions
     2. `supabase/policies.sql` - Thiết lập Row Level Security
     3. `supabase/seed.sql` - Thêm dữ liệu mẫu (tùy chọn)

## 🏃‍♂️ Bước 4: Chạy ứng dụng

```bash
# Development mode
npm run dev

# Ứng dụng sẽ chạy tại http://localhost:3000
```

## 🏗️ Cấu trúc Project

```
facility-hub/
├── app/                    # Next.js App Router
│   ├── devices/           # Quản lý thiết bị
│   ├── rooms/             # Quản lý phòng ban
│   ├── work-orders/       # Work orders
│   ├── documents/         # Quản lý tài liệu
│   ├── dashboard/         # Dashboard chính
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── lib/                   # Utilities
│   ├── supabaseClient.ts  # Supabase client
│   └── utils.ts           # Helper functions
├── supabase/              # Database
│   ├── schema.sql         # Database schema
│   ├── policies.sql       # RLS policies
│   └── seed.sql           # Sample data
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── README.md
```

## 🎯 Tính năng hiện tại

- ✅ **Dashboard**: Tổng quan hệ thống
- ✅ **Quản lý thiết bị**: CRUD thiết bị, tìm kiếm, filter
- ✅ **Quản lý phòng ban**: CRUD phòng ban
- ✅ **Work Orders**: Quản lý công việc bảo trì
- ✅ **Tài liệu**: Upload và quản lý files
- ✅ **Responsive UI**: Giao diện responsive với Tailwind CSS
- ✅ **Database Schema**: PostgreSQL với full-text search
- ✅ **API Routes**: RESTful APIs cho frontend

## 🔄 Roadmap

### Phase 1: Core Features (Hoàn thành)
- [x] Basic CRUD operations
- [x] UI components
- [x] Database schema
- [x] Mock data

### Phase 2: Integration (Tiếp theo)
- [ ] Kết nối Supabase thực tế
- [ ] Authentication & authorization
- [ ] File upload to Supabase Storage
- [ ] Real-time updates

### Phase 3: Advanced Features
- [ ] Calendar view cho maintenance
- [ ] Advanced search & filters
- [ ] Export to Excel/PDF
- [ ] Email notifications
- [ ] Mobile app (React Native)

## 🚀 Deploy Production

### Vercel (Recommended)
1. Push code lên GitHub
2. Kết nối với Vercel
3. Add environment variables
4. Deploy

### Docker
```bash
docker build -t facility-hub .
docker run -p 3000:3000 facility-hub
```

## 🆘 Troubleshooting

### Node.js không được nhận diện
- Khởi động lại terminal/command prompt
- Kiểm tra PATH environment variable
- Cài đặt lại Node.js

### Dependencies install failed
```bash
# Xóa node_modules và package-lock.json
rm -rf node_modules package-lock.json
npm install
```

### Supabase connection issues
- Kiểm tra environment variables
- Verify API keys từ Supabase dashboard
- Check database policies

## 📞 Hỗ trợ

- **GitHub Issues**: [Create an issue](https://github.com/your-repo/issues)
- **Documentation**: Xem thêm trong thư mục `docs/`
- **Video Tutorial**: [YouTube playlist](https://youtube.com/playlist)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Chúc bạn success với Facility Hub! 🎉**
