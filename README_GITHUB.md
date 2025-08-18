# 🏢 Facility Hub - Hệ thống Quản lý Cơ sở Vật chất

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat&logo=supabase)](https://supabase.com/)

Facility Hub là một hệ thống quản lý cơ sở vật chất hiện đại được xây dựng bằng **Next.js 14**, **TypeScript**, **Tailwind CSS** và **Supabase**. Hệ thống cung cấp giải pháp toàn diện để quản lý thiết bị, phòng ban, lệnh công việc, tài liệu và quy trình mua sắm.

## ✨ **Tính năng chính**

### 🔧 **Quản lý Thiết bị**
- ✅ CRUD operations với Supabase database
- ✅ QR code tự động sync với thiết bị
- ✅ Theo dõi warranty và trạng thái
- ✅ Phân loại theo phòng ban
- ✅ Advanced filtering và search

### 🛠️ **Quản lý Công việc**
- ✅ **Tasks** với priority và due dates
- ✅ **Work Orders** liên kết với thiết bị/phòng
- ✅ Assignment system
- ✅ Real-time dashboard statistics

### 💰 **Quản lý Mua sắm (Unique Feature)**
- ✅ Lập kế hoạch mua sắm hàng năm
- ✅ Workflow: Draft → Requested → Approved → Purchased → Completed
- ✅ **Auto-conversion**: Purchased items → Devices
- ✅ Budget tracking và supplier management

### 📄 **Quản lý Tài liệu**
- ✅ Document management với device linking
- ✅ Multi-category support
- ✅ Tag system
- ✅ Search functionality

### 🏠 **Dashboard Analytics**
- ✅ Real-time statistics
- ✅ Work management overview
- ✅ Device status monitoring
- ✅ Task và work order tracking

## 🚀 **Quick Start**

### **Yêu cầu hệ thống**
- Node.js 18+ 
- npm hoặc yarn
- Supabase account (miễn phí)

### **1. Clone Repository**
```bash
git clone https://github.com/your-username/facility-hub.git
cd facility-hub
```

### **2. Cài đặt Dependencies**
```bash
npm install
```

### **3. Cấu hình Environment**
Tạo file `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
USE_MOCK_DATA=false
```

### **4. Setup Database**
```bash
# Import database schema vào Supabase
# Copy nội dung từ supabase/schema.sql và chạy trong Supabase SQL Editor
```

### **5. Chạy Development Server**
```bash
npm run dev
```

Truy cập: `http://localhost:3000`

## 📁 **Cấu trúc Project**

```
facility-hub/
├── 📱 app/                    # Next.js App Router
│   ├── dashboard/             # Main dashboard
│   ├── devices/               # Device management
│   ├── tasks/                 # Task management  
│   ├── work-orders/           # Work order system
│   ├── procurement/           # Procurement planning
│   ├── documents/             # Document management
│   ├── qr-generator/          # QR code generator
│   └── test-connection/       # System health check
├── 🧩 components/             # Reusable components
├── 🔧 lib/                    # Utilities & services
│   ├── supabaseService.ts     # Database operations
│   ├── supabaseClient.ts      # Supabase config
│   └── authManager.ts         # Authentication
├── 🗄️ supabase/              # Database schema & policies
│   ├── schema.sql             # Complete database schema
│   ├── policies.sql           # RLS policies
│   └── seed.sql               # Sample data
└── 📚 docs/                   # Documentation
```

## 💾 **Database Schema**

### **Core Tables**
- `rooms` - Quản lý phòng ban
- `devices` - Thiết bị và tài sản  
- `tasks` - Nhiệm vụ cá nhân
- `work_orders` - Lệnh công việc
- `documents` - Tài liệu hệ thống
- `procurement_items` - Mua sắm và kế hoạch ngân sách

### **Key Features**
- ✅ UUID primary keys
- ✅ Row Level Security (RLS)
- ✅ Full-text search với pg_trgm
- ✅ JSON metadata support
- ✅ Automatic timestamps

## 🔐 **Bảo mật**

- ✅ **Environment variables**: Supabase keys được bảo vệ
- ✅ **RLS Policies**: Row-level security cho tất cả tables
- ✅ **Input validation**: Frontend và backend validation
- ✅ **Authentication**: Supabase Auth integration

## 📈 **Performance**

- ✅ **Next.js 14**: App Router với server components
- ✅ **Database**: PostgreSQL với indexing
- ✅ **Caching**: Built-in Next.js caching
- ✅ **Code splitting**: Automatic optimization
- ✅ **Image optimization**: Next.js Image component

## 🎨 **UI/UX**

- ✅ **Responsive Design**: Mobile-first approach
- ✅ **Dark Mode**: System preference detection
- ✅ **Accessibility**: ARIA compliance
- ✅ **Modern UI**: Tailwind CSS với shadcn/ui components

## 🧪 **Testing & Monitoring**

- ✅ **Health Check**: `/test-connection` endpoint
- ✅ **Error Handling**: Comprehensive error boundaries
- ✅ **Logging**: Console logging với structured data
- ✅ **Performance**: Real-time monitoring

## 📦 **Deployment**

### **Vercel (Recommended)**
```bash
npm run build
vercel --prod
```

### **Manual Deployment**
```bash
npm run build
npm start
```

### **Auto Deploy với GitHub**
1. Push code lên GitHub
2. Connect repository với Vercel
3. Set environment variables
4. Deploy automatically

## 🤝 **Contributing**

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📋 **Roadmap**

### **V1.1 (Q4 2025)**
- [ ] Mobile app React Native
- [ ] Advanced analytics dashboard
- [ ] Email notifications
- [ ] Bulk operations

### **V1.2 (Q1 2026)**  
- [ ] Multi-tenant support
- [ ] Advanced reporting
- [ ] API documentation
- [ ] Third-party integrations

## 📄 **License**

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🙋‍♂️ **Support**

- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/facility-hub/issues)
- 📖 **Documentation**: Xem các file .md trong project
- 🔍 **System Health**: `/test-connection` endpoint

## 🌟 **Acknowledgments**

- [Next.js](https://nextjs.org/) - React framework
- [Supabase](https://supabase.com/) - Database và backend services  
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components

---

<p align="center">
  Made with ❤️ for Facility Management
</p>
