# Hệ thống Quản lý Mua sắm Hàng năm

## Tổng quan

Hệ thống quản lý mua sắm hàng năm được thiết kế để theo dõi và quản lý toàn bộ quy trình mua sắm tài sản cố định và công cụ dụng cụ của tổ chức, đặc biệt phù hợp với quy trình mua sắm của các cơ quan, doanh nghiệp Việt Nam.

## Tính năng chính

### 1. Phân loại Tài sản
- **Tài sản cố định**: Máy móc, thiết bị có giá trị cao, thời gian sử dụng lâu dài
- **Công cụ dụng cụ**: Thiết bị nhỏ, vật dụng phục vụ công việc hàng ngày

### 2. Quy trình Mua sắm
- **Ngày đề nghị đơn vị**: Ngày bộ phận đề xuất nhu cầu mua sắm
- **Ngày đề nghị và dự toán của phòng**: Ngày phòng nghiệp vụ xác nhận và lập dự toán
- **Giá trị đề nghị**: Giá trị ước tính ban đầu
- **Hình thức lựa chọn**: 
  - Đấu thầu (cho giá trị lớn)
  - Chào hàng cạnh tranh (giá trị trung bình)
  - Chỉ định thầu (trường hợp đặc biệt)
  - Mua sắm khẩn cấp (cấp thiết)
- **Giá trị thanh toán nghiệm thu**: Giá trị thực tế sau khi mua xong

### 3. Theo dõi Trạng thái
- **Nháp**: Đang soạn thảo đề nghị
- **Đã đề nghị**: Đã gửi đề nghị chính thức
- **Đã phê duyệt**: Được phê duyệt mua sắm
- **Từ chối**: Đề nghị bị từ chối
- **Đã mua**: Đã thực hiện mua sắm
- **Hoàn thành**: Đã nghiệm thu và đưa vào sử dụng

### 4. Quản lý Ngân sách
- Theo dõi ngân sách phân bổ cho từng phòng ban
- Tách biệt ngân sách cho tài sản cố định và công cụ dụng cụ
- Báo cáo tình hình sử dụng ngân sách theo thời gian thực

### 5. Báo cáo Thống kê
- Thống kê theo loại tài sản
- Thống kê theo phòng ban
- Thống kê theo trạng thái thực hiện
- Báo cáo sử dụng ngân sách

## Hướng dẫn Sử dụng

### Thêm Đề nghị Mua sắm Mới

1. Click nút **"➕ Thêm đề nghị mua sắm"**
2. Điền đầy đủ thông tin:
   - **Tên hàng hóa** (bắt buộc)
   - **Loại tài sản**: Chọn "Tài sản cố định" hoặc "Công cụ dụng cụ"
   - **Ngày đề nghị đơn vị** (bắt buộc)
   - **Ngày đề nghị và dự toán của phòng** (bắt buộc)
   - **Giá trị đề nghị** (bắt buộc)
   - **Hình thức lựa chọn**: Chọn phương thức phù hợp
   - **Phòng ban** (bắt buộc)
   - **Người đề nghị** (bắt buộc)
   - Các thông tin khác (tùy chọn): Thông số kỹ thuật, ghi chú, độ ưu tiên...

3. Click **"Thêm mới"** để lưu

### Quản lý Đề nghị

- **Sửa**: Click nút "✏️ Sửa" để chỉnh sửa thông tin
- **Xóa**: Click nút "🗑️ Xóa" để xóa đề nghị (cần xác nhận)
- **Lọc**: Sử dụng các bộ lọc để tìm kiếm nhanh theo trạng thái, phòng ban

### Xem Báo cáo

1. **Tab Tổng quan**: Xem tất cả đề nghị mua sắm
2. **Tab Tài sản cố định**: Chỉ hiển thị tài sản cố định
3. **Tab Công cụ dụng cụ**: Chỉ hiển thị công cụ dụng cụ
4. **Tab Ngân sách**: Xem tình hình sử dụng ngân sách theo phòng ban

### Thống kê Nhanh

Dashboard hiển thị 4 số liệu chính:
- **Tài sản cố định**: Số lượng và tổng giá trị
- **Công cụ dụng cụ**: Số lượng và tổng giá trị  
- **Tổng ngân sách**: Ngân sách đã phân bổ
- **Đã sử dụng**: Số tiền đã chi và số còn lại

## Lưu ý Quan trọng

### Quy trình Phê duyệt
1. Bộ phận đề nghị tạo đề nghị với trạng thái "Nháp"
2. Khi hoàn tất, chuyển trạng thái thành "Đã đề nghị"
3. Phòng quản lý xem xét và chuyển thành "Đã phê duyệt" hoặc "Từ chối"
4. Sau khi mua sắm, cập nhật "Giá trị thanh toán nghiệm thu" và chuyển thành "Đã mua"
5. Khi nghiệm thu xong, chuyển thành "Hoàn thành"

### Quản lý Ngân sách
- Ngân sách được phân bổ theo năm và theo phòng ban
- Hệ thống tự động tính toán số dư ngân sách còn lại
- Cảnh báo khi vượt ngân sách phân bổ

### Bảo mật Dữ liệu
- Dữ liệu được lưu trữ local trên trình duyệt
- Khuyến khích thực hiện backup định kỳ
- Có thể tích hợp với hệ thống quản lý tập trung nếu cần

## Hỗ trợ Kỹ thuật

Nếu gặp vấn đề khi sử dụng, vui lòng kiểm tra:
1. Trình duyệt có hỗ trợ JavaScript và LocalStorage
2. Đã điền đầy đủ các trường bắt buộc (có dấu *)
3. Định dạng ngày tháng đúng (DD/MM/YYYY)
4. Giá trị số phải là số nguyên dương

---

*Hệ thống được phát triển để tối ưu hóa quy trình mua sắm và đảm bảo tuân thủ các quy định về mua sắm công.*
