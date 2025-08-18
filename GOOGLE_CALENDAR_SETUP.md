# Hướng dẫn Setup Google Calendar Integration

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Enable **Google Calendar API**:
   - Vào **APIs & Services** → **Library**
   - Tìm kiếm "Google Calendar API"
   - Nhấn **Enable**

## Bước 2: Tạo OAuth 2.0 Credentials

1. Vào **APIs & Services** → **Credentials**
2. Nhấn **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Chọn **Web application**
4. Cấu hình:
   - **Name**: Facility Hub Calendar
   - **Authorized JavaScript origins**: 
     - `http://localhost:3000` (development)
     - `https://yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

## Bước 3: Cấu hình Environment Variables

Thêm vào file `.env.local`:

```bash
# Google Calendar API credentials
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
NEXT_PUBLIC_GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

## Bước 4: OAuth Consent Screen

1. Vào **OAuth consent screen**
2. Chọn **External** (cho testing)
3. Điền thông tin:
   - **App name**: Facility Hub
   - **User support email**: your-email@gmail.com
   - **Developer contact information**: your-email@gmail.com
4. Thêm **Scopes**:
   - `https://www.googleapis.com/auth/calendar`
   - `https://www.googleapis.com/auth/calendar.events`
5. Thêm **Test users** (email của bạn để test)

## Bước 5: Test Integration

1. Restart development server: `npm run dev`
2. Truy cập `/calendar`
3. Nhấn "Đăng nhập với Google"
4. Cho phép quyền truy cập Calendar
5. Test các tính năng:
   - Xem events từ Google Calendar
   - Tạo event mới
   - Xóa event

## Tính năng đã hỗ trợ:

✅ **Xác thực Google OAuth 2.0**
✅ **Hiển thị events từ Google Calendar**
✅ **Tạo event mới**
✅ **Xóa event**
✅ **Nhiều calendars support**
✅ **Responsive calendar view**
✅ **Vietnamese localization**
✅ **Error handling**

## Troubleshooting:

### Lỗi "redirect_uri_mismatch"
- Kiểm tra lại redirect URI trong Google Cloud Console
- Đảm bảo URI khớp chính xác với config

### Lỗi "access_denied" 
- Kiểm tra OAuth consent screen đã setup đúng
- Thêm email test user vào allowed list

### Lỗi "invalid_client"
- Kiểm tra Client ID và Client Secret
- Đảm bảo credentials chưa bị expired

### Events không hiển thị
- Kiểm tra calendar permission
- Thử đổi calendar khác trong dropdown
- Check browser console cho error logs

## Demo Features:

- **Calendar View**: Hiển thị lịch theo tháng với events
- **Event Details**: Click vào event để xem chi tiết
- **Create Event**: Form tạo event mới với đầy đủ thông tin
- **Multiple Calendars**: Hỗ trợ nhiều calendar cùng lúc
- **Real-time Sync**: Đồng bộ với Google Calendar thời gian thực

## Security Notes:

- Access tokens được lưu trong localStorage
- Tokens tự động refresh khi hết hạn
- All API calls sử dụng HTTPS
- Follow Google OAuth 2.0 best practices
