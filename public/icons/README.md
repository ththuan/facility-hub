# PWA Icons - Facility Hub

## Hướng dẫn tạo icons

Để tạo đầy đủ bộ icons cho PWA, bạn cần tạo các file sau:

### Icons cần tạo:
- `icon-72x72.png` (72x72px)
- `icon-96x96.png` (96x96px) 
- `icon-128x128.png` (128x128px)
- `icon-144x144.png` (144x144px)
- `icon-152x152.png` (152x152px)
- `icon-192x192.png` (192x192px)
- `icon-384x384.png` (384x384px)
- `icon-512x512.png` (512x512px)

### Thiết kế gợi ý:
- **Màu nền**: #2563eb (Blue-600)
- **Icon**: 🏢 hoặc ⚙️ màu trắng
- **Font**: Sans-serif, bold
- **Text**: "FH" hoặc "Facility Hub"

### Cách tạo nhanh:
1. Sử dụng tool online như:
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/
   - https://favicon.io/

2. Hoặc sử dụng Photoshop/GIMP:
   - Tạo canvas vuông với kích thước tương ứng
   - Nền màu #2563eb
   - Thêm icon/text màu trắng ở giữa
   - Export thành PNG

### Temporary Placeholder
Hiện tại đang sử dụng placeholder icons. 
Thay thế bằng icons thực tế khi production.

## Auto-generated files:
- ✅ manifest.json đã được cấu hình
- ✅ Service Worker đã được tạo  
- ⏳ Icons cần được tạo thủ công

## Test PWA:
1. Deploy lên HTTPS server
2. Mở Chrome Dev Tools > Application > Manifest
3. Kiểm tra "Add to Home Screen" functionality
4. Test offline mode với Service Worker
