# Hướng dẫn Setup Google Calendar API

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Click "Create Project" hoặc "Tạo dự án mới"
4. Đặt tên project: "Facility Hub Calendar" 
5. Click "Create"

## Bước 2: Enable Google Calendar API

1. Trong Google Cloud Console, vào menu bên trái
2. Chọn "APIs & Services" > "Library"
3. Tìm kiếm "Google Calendar API"
4. Click vào "Google Calendar API"
5. Click "Enable" để kích hoạt

## Bước 3: Tạo OAuth 2.0 Credentials

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth client ID"
3. Nếu chưa có OAuth consent screen, sẽ được yêu cầu tạo:
   - Chọn "External"
   - App name: "Facility Hub"
   - User support email: email của bạn
   - Developer contact: email của bạn
   - Click "Save and Continue" qua các bước
4. Chọn Application type: "Web application"
5. Name: "Facility Hub Web Client"
6. Authorized redirect URIs: thêm
   - `http://localhost:3000/api/auth/google/callback`
   - `http://localhost:3000/calendar`
7. Click "Create"

## Bước 4: Copy credentials vào .env.local

Sau khi tạo xong, bạn sẽ thấy popup với:
- **Client ID**: copy vào `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- **Client Secret**: copy vào `GOOGLE_CLIENT_SECRET`

## Bước 5: Test Scopes

Đảm bảo OAuth consent screen có các scopes:
- `https://www.googleapis.com/auth/calendar`
- `https://www.googleapis.com/auth/calendar.events`

## Lưu ý quan trọng:

- Nếu app đang ở chế độ "Testing", chỉ có thể thêm tối đa 100 test users
- Để công khai app, cần verify qua Google (phức tạp hơn)
- Với mục đích development, chế độ Testing là đủ

## Troubleshooting thường gặp:

1. **Error 403: access_denied**
   - Kiểm tra redirect URI có đúng không
   - Kiểm tra OAuth consent screen đã setup chưa

2. **Error 400: invalid_client**
   - Kiểm tra Client ID và Client Secret
   - Kiểm tra domain có được authorize chưa

3. **Không thể thêm API**
   - Đảm bảo đã enable Google Calendar API
   - Kiểm tra billing account (có thể cần enable)
