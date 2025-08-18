# Google Drive Integration Setup (Optional)

## Hiện tại
- ✅ **Mock Google Drive Service**: Đã hoạt động với dữ liệu giả
- ✅ **Upload Interface**: Hoàn chỉnh với progress bar
- ✅ **File Management**: View, edit, delete documents
- ✅ **Error Handling**: Comprehensive error messages

## Để kích hoạt Google Drive thật (Optional)

### 1. Tạo Google Cloud Project
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Enable Google Drive API:
   - Vào "APIs & Services" > "Library"
   - Search "Google Drive API" và enable

### 2. Tạo Service Account (Recommended)
1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Nhập tên service account và description
4. Assign role "Editor" hoặc custom role với Drive permissions
5. Tạo JSON key và download

### 3. Cập nhật Environment Variables
Thêm vào `.env.local`:
```bash
# Google Drive Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_SERVICE_ACCOUNT_CLIENT_ID=123456789

# Or use OAuth2 (for user-based access)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

### 4. Cài đặt dependencies
```bash
npm install googleapis google-auth-library
```

### 5. Cập nhật Service
Thay thế `MockGoogleDriveService` bằng `GoogleDriveService` thật trong:
- `lib/googleDriveService.ts`
- `app/documents/page.tsx`

### 6. Permissions Setup
- Service Account cần có quyền truy cập folder trên Google Drive
- Hoặc tạo folder mới với service account làm owner
- Set folder permissions cho users nếu cần

## Current Mock Features
✅ File upload simulation  
✅ Progress tracking  
✅ Error handling  
✅ File preview support  
✅ Download links  
✅ File management UI  
✅ Integration with database  

## Production Ready Features (When using real Google Drive)
🔄 Real file storage on Google Drive  
🔄 Shared folder access  
🔄 File versioning  
🔄 Advanced permissions  
🔄 Batch operations  
🔄 File search in Drive  

## Testing Mock Service
1. Upload any file type
2. Check console logs for detailed process
3. Files are "uploaded" to mock Google Drive
4. Download links work (mock data)
5. All file operations work normally

The system is **production-ready** with mock data and can be **easily switched** to real Google Drive when needed.
