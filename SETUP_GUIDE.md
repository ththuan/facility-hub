# 🚀 Hướng Dẫn Chạy Website Facility Hub

## 📋 Những gì cần làm mỗi lần muốn chạy website

### 🔧 **Bước 1: Thiết lập môi trường (chỉ cần làm 1 lần)**

#### 1.1 Cài đặt Node.js (nếu chưa có)
- Tải Node.js từ: https://nodejs.org/ (phiên bản LTS khuyến khích)
- Chạy file cài đặt và làm theo hướng dẫn
- Khởi động lại máy tính sau khi cài đặt

#### 1.2 Khởi động PowerShell với quyền Administrator
1. Click chuột phải vào nút Start của Windows
2. Chọn **"Windows PowerShell (Admin)"** hoặc **"Terminal (Admin)"**
3. Chọn **"Yes"** khi hệ thống hỏi quyền

#### 1.3 Thiết lập ExecutionPolicy (chỉ cần làm 1 lần)
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
- Nhập **Y** và nhấn Enter khi được hỏi

### 🏃‍♂️ **Bước 2: Các bước chạy website (làm mỗi lần)**

#### 2.1 Mở Terminal/PowerShell
- Nhấn **Windows + R**, gõ `powershell`, nhấn Enter
- Hoặc mở VS Code và sử dụng Terminal tích hợp

#### 2.2 Chuyển đến thư mục dự án
```powershell
cd E:\Website
```

#### 2.3 Cài đặt dependencies (chỉ cần làm lần đầu hoặc khi có thay đổi)
```powershell
npm install
```

#### 2.4 Chạy website
```powershell
npm run dev
```

#### 2.5 Truy cập website
- Mở trình duyệt web
- Truy cập: **http://localhost:3000**

### ✅ **Các lệnh nhanh (sau khi đã thiết lập xong)**

```powershell
# Chuyển đến thư mục
cd E:\Website

# Chạy website
npm run dev
```

---

## 🔍 **Xử lý Sự cố Thường Gặp**

### ❌ Lỗi: "cannot be loaded because running scripts is disabled"
**Nguyên nhân**: Windows chặn chạy scripts của PowerShell

**Giải pháp**:
1. Mở PowerShell với quyền Administrator
2. Chạy lệnh: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
3. Nhập `Y` để xác nhận

### ❌ Lỗi: "npm: command not found"
**Nguyên nhân**: Node.js chưa được cài đặt hoặc chưa có trong PATH

**Giải pháp**:
1. Tải và cài đặt Node.js từ https://nodejs.org/
2. Khởi động lại máy tính
3. Mở PowerShell mới và thử lại

### ❌ Lỗi: "Port 3000 is already in use"
**Nguyên nhân**: Cổng 3000 đã được sử dụng bởi ứng dụng khác

**Giải pháp**:
```powershell
# Tìm tiến trình đang dùng cổng 3000
netstat -ano | findstr :3000

# Kết thúc tiến trình (thay PID bằng số thực tế)
taskkill /PID [PID_NUMBER] /F
```

### ❌ Lỗi: "Module not found"
**Nguyên nhân**: Thiếu dependencies

**Giải pháp**:
```powershell
# Xóa node_modules và package-lock.json
rm -r node_modules
rm package-lock.json

# Cài đặt lại
npm install
```

---

## 📱 **Truy cập Website**

Sau khi chạy thành công `npm run dev`, bạn sẽ thấy thông báo:

```
✓ Ready in [time]
○ Local:        http://localhost:3000
○ Network:      http://[IP]:3000
```

**Các cách truy cập**:
- **Máy tính hiện tại**: http://localhost:3000
- **Điện thoại/máy khác trong mạng**: http://[IP_address]:3000
- **PWA**: Có thể cài đặt như ứng dụng trên điện thoại

---

## 🎯 **Tóm tắt Quy trình Nhanh**

### Lần đầu tiên:
1. ✅ Cài Node.js
2. ✅ Thiết lập ExecutionPolicy
3. ✅ `cd E:\Website`
4. ✅ `npm install`
5. ✅ `npm run dev`

### Những lần sau:
1. ✅ Mở PowerShell
2. ✅ `cd E:\Website`
3. ✅ `npm run dev`
4. ✅ Truy cập http://localhost:3000

---

## 💡 **Mẹo Hữu ích**

- **Dừng server**: Nhấn `Ctrl + C` trong terminal
- **Chạy trong background**: Sử dụng VS Code terminal để có thể làm việc khác
- **Auto-reload**: Website tự động refresh khi bạn sửa code
- **Dark mode**: Website hỗ trợ chế độ tối/sáng tự động

---

*🚀 Chúc bạn sử dụng website thành công!*
