# 🚀 Setup Google Calendar API - Hướng dẫn chi tiết

## ⚠️ LƯU Ý QUAN TRỌNG
Bạn đang có `.env.local` với thông tin:
- ✅ Supabase đã setup
- ❌ **Google API chưa setup** (cần làm bước dưới)

## 🔧 Các bước setup Google Calendar API

### Bước 1: Tạo Google Cloud Project
1. 🌐 Mở [Google Cloud Console](https://console.cloud.google.com/)
2. 🔑 Đăng nhập tài khoản Google
3. ➕ Click **"Create Project"** hoặc **"New Project"**
4. 📝 Tên project: `Facility-Hub-Calendar`
5. ✅ Click **"Create"**

### Bước 2: Enable APIs
1. 📋 Trong menu trái, chọn **"APIs & Services"** → **"Library"**
2. 🔍 Tìm **"Google Calendar API"**
3. 🎯 Click vào **"Google Calendar API"**
4. ✅ Click **"Enable"**

### Bước 3: Setup OAuth Consent Screen
1. 🔐 Vào **"APIs & Services"** → **"OAuth consent screen"**
2. 🌍 Chọn **"External"** → **"Create"**
3. 📝 Điền thông tin:
   - **App name**: `Facility Hub`
   - **User support email**: `your-email@gmail.com`
   - **Developer email**: `your-email@gmail.com`
4. ⏭️ Click **"Save and Continue"** qua tất cả steps
5. ✅ Click **"Back to Dashboard"**

### Bước 4: Tạo OAuth Credentials
1. 🔑 Vào **"APIs & Services"** → **"Credentials"**
2. ➕ Click **"Create Credentials"** → **"OAuth client ID"**
3. 🌐 Application type: **"Web application"**
4. 📝 Name: `Facility Hub Web Client`
5. 🔗 **Authorized redirect URIs** - Click **"Add URI"**:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
6. ✅ Click **"Create"**

### Bước 5: Copy Credentials
📋 Copy thông tin từ popup:
- **Client ID**: Copy toàn bộ chuỗi
- **Client Secret**: Copy toàn bộ chuỗi

### Bước 6: Cập nhật .env.local
📝 Thay thế trong file `.env.local`:

```bash
# Thay thế dòng này:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# Thành:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=paste_your_actual_client_id_here

# Thay thế dòng này:
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Thành:
GOOGLE_CLIENT_SECRET=paste_your_actual_client_secret_here
```

### Bước 7: Test OAuth Scopes
🔧 Trong **OAuth consent screen**, đảm bảo có scopes:
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

## 🎯 Kiểm tra setup

1. ✅ **Build project**:
   ```bash
   npm run build
   ```

2. ✅ **Chạy development server**:
   ```bash
   npm run dev
   ```

3. 🌐 Mở http://localhost:3000/calendar

4. 🔑 Click **"Đăng nhập với Google"**

5. ✅ Nếu thành công → Trang calendar sẽ hiện

## ❌ Troubleshooting

### Lỗi "Invalid Client"
❌ **Nguyên nhân**: Client ID/Secret sai
✅ **Giải pháp**: Kiểm tra lại credentials trong Google Cloud Console

### Lỗi "Redirect URI mismatch"
❌ **Nguyên nhân**: Redirect URI không khớp
✅ **Giải pháp**: Đảm bảo redirect URI là chính xác:
```
http://localhost:3000/api/auth/google/callback
```

### Lỗi "Access denied"
❌ **Nguyên nhân**: OAuth consent screen chưa setup đúng
✅ **Giải pháp**: Kiểm tra lại OAuth consent screen và scopes

### Lỗi "API not enabled"
❌ **Nguyên nhân**: Chưa enable Google Calendar API
✅ **Giải pháp**: Enable Google Calendar API trong Library

## 🔒 Bảo mật

⚠️ **Quan trọng**:
- 🚫 **KHÔNG** commit file `.env.local` lên git
- 🔐 Client Secret phải giữ bí mật
- 🏠 Chỉ dùng cho development (localhost)
- 🌍 Để production, cần domain và SSL certificate

## 🆘 Cần hỗ trợ?

📧 Nếu gặp khó khăn, hãy:
1. ✅ Kiểm tra từng bước một cách cẩn thận
2. 🔍 Check console logs trong browser (F12)
3. 📋 Copy error message để debug
4. 🔄 Thử refresh và login lại

## 🎉 Hoàn thành!

Sau khi setup xong, bạn có thể:
- 📅 Xem lịch Google trong app
- ➕ Tạo sự kiện mới
- ✏️ Chỉnh sửa sự kiện
- 🗑️ Xóa sự kiện
- 🔄 Đồng bộ với Google Calendar
