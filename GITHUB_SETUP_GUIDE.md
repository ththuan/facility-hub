# 📚 Hướng dẫn đưa Facility Hub lên GitHub

## 🔧 **Bước 1: Cài đặt Git (đã hoàn thành)**
✅ Git đã được cài đặt qua winget

**Restart PowerShell hoặc CMD để Git có hiệu lực**

## 🚀 **Bước 2: Setup Git Repository**

### **1. Mở terminal mới (restart PowerShell)**
```bash
# Chuyển đến thư mục project
cd /d "e:\Website\Website"

# Khởi tạo Git repository
git init
```

### **2. Cấu hình Git (lần đầu sử dụng)**
```bash
# Cấu hình thông tin cá nhân
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### **3. Add và commit files**
```bash
# Kiểm tra files sẽ được commit
git status

# Add tất cả files (trừ những files trong .gitignore)
git add .

# Commit đầu tiên
git commit -m "🎉 Initial commit: Facility Hub v1.0 with Supabase integration"
```

## 🌐 **Bước 3: Tạo GitHub Repository**

### **1. Đăng nhập GitHub**
- Truy cập: https://github.com
- Đăng nhập vào account của bạn

### **2. Tạo repository mới**
- Click nút **"New"** (màu xanh)
- Repository name: `facility-hub`
- Description: `🏢 Modern Facility Management System with Next.js & Supabase`
- Chọn **Public** hoặc **Private**
- **KHÔNG** check "Add a README file" (vì ta đã có)
- **KHÔNG** check "Add .gitignore" (vì ta đã có)
- Click **"Create repository"**

### **3. Connect local repository với GitHub**
```bash
# Add remote origin (thay YOUR_USERNAME bằng username GitHub của bạn)
git remote add origin https://github.com/YOUR_USERNAME/facility-hub.git

# Push code lên GitHub
git branch -M main
git push -u origin main
```

## 📁 **Bước 4: Cấu trúc files trên GitHub**

Sau khi push, GitHub repository sẽ có:

```
facility-hub/
├── 📋 README_GITHUB.md        # README cho GitHub
├── ⚙️ .env.example            # Environment template
├── 🚫 .gitignore              # Files được ignore
├── 📦 package.json            # Dependencies
├── 🏗️ next.config.js          # Next.js config
├── 🎨 tailwind.config.ts      # Tailwind config
├── 📱 app/                    # Next.js pages
├── 🧩 components/             # React components  
├── 🔧 lib/                    # Services & utilities
├── 🗄️ supabase/               # Database schema
└── 📚 *.md                    # Documentation
```

## 🔐 **Bước 5: Bảo mật - QUAN TRỌNG**

### **✅ Files ĐÃ được bảo vệ (trong .gitignore):**
- `.env.local` - Environment variables với Supabase keys
- `node_modules/` - Dependencies
- `.next/` - Build files

### **⚠️ Kiểm tra trước khi push:**
```bash
# Đảm bảo .env.local KHÔNG xuất hiện
git status

# Nếu .env.local xuất hiện, add vào .gitignore ngay
echo ".env.local" >> .gitignore
git add .gitignore
git commit -m "🔒 Ensure environment files are ignored"
```

## 🚀 **Bước 6: Vercel Deployment (Optional)**

### **1. Connect với Vercel**
- Truy cập: https://vercel.com
- Login bằng GitHub account
- Click **"New Project"**
- Import `facility-hub` repository

### **2. Configure Environment Variables**
Trong Vercel dashboard, thêm:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- `SUPABASE_SERVICE_ROLE_KEY`
- `USE_MOCK_DATA=false`

### **3. Deploy**
- Click **"Deploy"**
- Đợi deployment hoàn tất
- Nhận được URL production: `https://facility-hub.vercel.app`

## 📚 **Bước 7: Documentation**

### **Files documentation có sẵn:**
- `README_GITHUB.md` - Main README cho GitHub
- `SETUP.md` - Chi tiết setup
- `supabase/schema.sql` - Database schema
- `PROJECT_SUMMARY.md` - Tổng quan project

### **Update README cho GitHub:**
```bash
# Đổi tên README chính
mv README_GITHUB.md README.md
git add README.md
git commit -m "📚 Update main README for GitHub"
git push
```

## 🎉 **Kết quả**

Sau khi hoàn thành:

✅ **Code được backup an toàn trên GitHub**
✅ **Environment variables được bảo vệ** 
✅ **Documentation đầy đủ**
✅ **Sẵn sàng cho collaboration**
✅ **Auto deployment với Vercel** (optional)

## 🔄 **Workflow tiếp theo**

### **Develop features:**
```bash
# Tạo branch mới cho feature
git checkout -b feature/new-feature

# Develop & commit
git add .
git commit -m "✨ Add new feature"

# Push branch
git push origin feature/new-feature

# Tạo Pull Request trên GitHub
```

### **Update production:**
```bash
# Merge vào main branch
git checkout main
git merge feature/new-feature
git push origin main

# Vercel sẽ tự động deploy
```

---

## 🆘 **Troubleshooting**

### **Nếu Git command không hoạt động:**
1. Restart PowerShell/CMD
2. Hoặc add Git vào PATH manually:
   - Windows Search → "Environment Variables"
   - Add: `C:\Program Files\Git\bin` to PATH
   - Restart terminal

### **Nếu push bị từ chối:**
```bash
# Kiểm tra remote URL
git remote -v

# Fix remote URL nếu cần
git remote set-url origin https://github.com/YOUR_USERNAME/facility-hub.git
```

### **Nếu có conflict:**
```bash
# Pull latest changes
git pull origin main

# Resolve conflicts manually
# Then commit & push
```

**🎯 Repository URL sau khi tạo: `https://github.com/YOUR_USERNAME/facility-hub`**
