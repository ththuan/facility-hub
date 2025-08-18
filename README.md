# Facility Hub - Hệ thống Quản lý Cơ sở vật chất

Facility Hub là một hệ thống quản lý cơ sở vật chất hiện đại được xây dựng bằng Next.js 14, TypeScript và Tailwind CSS. Hệ thống sử dụng localStorage để lưu trữ dữ liệu, phù hợp cho việc sử dụng cá nhân hoặc demo.

## 🌟 Tính năng chính

### 📱 Quản lý Thiết bị
- **CRUD đầy đủ**: Thêm, sửa, xóa, xem danh sách thiết bị
- **Tìm kiếm & Lọc**: Theo tên, mã, danh mục, trạng thái
- **Thông tin chi tiết**: Mã thiết bị, tên, danh mục, năm mua, bảo hành, phòng
- **Trạng thái**: Tốt, Đang bảo trì, Hư

### 🏢 Quản lý Phòng
- **Thông tin phòng**: Mã, tên, loại, diện tích, sức chứa
- **Vị trí**: Tầng, tòa nhà
- **Trạng thái**: Hoạt động, Bảo trì, Ngưng sử dụng

### 🔧 Work Orders
- **Quản lý công việc**: Tiêu đề, mô tả, độ ưu tiên, trạng thái
- **Phân công**: Người phụ trách, hạn hoàn thành
- **Liên kết thiết bị**: Kết nối với thiết bị liên quan

### ✅ Quản lý Tasks
- **Chi tiết công việc**: Tiêu đề, mô tả, ghi chú
- **Theo dõi tiến độ**: Chưa bắt đầu, Đang thực hiện, Hoàn thành
- **Liên kết Work Orders**: Kết nối với work order gốc

### 📄 Quản lý Tài liệu
- **Loại tài liệu**: Hợp đồng, Báo giá, Bàn giao, Quy trình, Khác
- **Hệ thống Tags**: Phân loại và tìm kiếm
- **Liên kết thiết bị**: Kết nối với thiết bị liên quan

### 📊 Dashboard Tổng quan
- **Thống kê thiết bị**: Tổng số, trạng thái hoạt động
- **Thống kê phòng**: Số lượng, diện tích
- **Work Orders**: Số lượng đang mở/xử lý
- **Tasks**: Công việc đang thực hiện

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Data Storage**: localStorage (Client-side)

## Cài đặt

### Yêu cầu hệ thống

- Node.js 18+ 
- npm hoặc yarn
- Tài khoản Supabase

### Cài đặt dependencies

Trước tiên, cài đặt Node.js từ [nodejs.org](https://nodejs.org/) nếu chưa có.

```bash
# Cài đặt dependencies
npm install

# hoặc
yarn install
```

### Cấu hình môi trường

1. Tạo project Supabase tại [app.supabase.com](https://app.supabase.com)
2. Copy file `.env.example` thành `.env.local`:

```bash
cp .env.example .env.local
```

3. Điền thông tin Supabase vào `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Thiết lập Database

1. Mở SQL Editor trong Supabase Dashboard
2. Chạy script trong file `supabase/schema.sql` để tạo tables và extensions
3. Chạy script trong file `supabase/policies.sql` để thiết lập Row Level Security
4. (Tùy chọn) Chạy script trong file `supabase/seed.sql` để thêm dữ liệu mẫu

## Chạy ứng dụng

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start

# Linting
npm run lint
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## Cấu trúc thư mục

```
facility-hub/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard layout group
│   ├── devices/           # Device management pages
│   ├── rooms/             # Room management pages
│   ├── work-orders/       # Work order pages
│   ├── documents/         # Document management
│   ├── tasks/             # Task management
│   ├── notes/             # Notes pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── lib/                   # Utility libraries
│   ├── supabaseClient.ts # Supabase client
│   ├── auth.ts           # Auth utilities
│   └── utils.ts          # General utilities
├── supabase/             # Database schema and policies
│   ├── schema.sql        # Database schema
│   ├── policies.sql      # RLS policies
│   └── seed.sql          # Sample data
└── public/               # Static assets
```

## Triển khai

### Vercel (Recommended)

1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Thêm environment variables từ file `.env.local`
4. Deploy

### Docker

```bash
# Build image
docker build -t facility-hub .

# Run container
docker run -p 3000:3000 facility-hub
```

## Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## Hỗ trợ

- 📧 Email: support@facility-hub.com
- 📖 Documentation: [docs.facility-hub.com](https://docs.facility-hub.com)
- 🐛 Bug Reports: [GitHub Issues](https://github.com/your-username/facility-hub/issues)
