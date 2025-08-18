# 🔄 Tính năng Tích hợp: Mua sắm → Quản lý Thiết bị

## 📋 Tổng quan

Hệ thống **Facility Hub** đã được tích hợp tính năng **Tự động tạo thiết bị** khi quá trình mua sắm hoàn thành. Điều này đảm bảo tính liên tục và tự động trong quy trình quản lý tài sản từ lúc mua sắm đến lúc đưa vào sử dụng.

## 🚀 Cách hoạt động

### Khi nào thiết bị được tự động tạo?
Thiết bị sẽ được **tự động tạo** khi:
- Trạng thái đề nghị mua sắm chuyển từ bất kỳ trạng thái nào sang **"Hoàn thành"** (`completed`)
- Hệ thống sẽ tự động:
  1. Tạo mã thiết bị duy nhất
  2. Tìm phòng ban phù hợp (nếu có)
  3. Chuyển đổi thông tin từ đề nghị mua sắm thành thông tin thiết bị
  4. Lưu thiết bị vào hệ thống quản lý

### Quy tắc tạo mã thiết bị
```
Format: [CategoryPrefix][Year][Timestamp]
```

**Ví dụ:**
- Tài sản cố định năm 2025: `FA25XXXX`
- Công cụ dụng cụ năm 2025: `TE25XXXX`

**Chi tiết:**
- `FA` = Fixed Assets (Tài sản cố định)
- `TE` = Tools & Equipment (Công cụ dụng cụ)
- `25` = 2 số cuối của năm (2025)
- `XXXX` = 4 số cuối của timestamp

## 📊 Thông tin được chuyển đổi

| **Từ Mua sắm** | **→** | **Đến Thiết bị** |
|---|---|---|
| `itemName` | → | `name` (Tên thiết bị) |
| `category` | → | `category` (Loại: "Tài sản cố định" hoặc "Công cụ dụng cụ") |
| `quantity` | → | `quantity` (Số lượng) |
| `unit` | → | `unit` (Đơn vị) |
| `budgetYear` | → | `purchaseYear` (Năm mua) |
| `purchaseDate` + `warrantyPeriod` | → | `warrantyUntil` (Hết hạn bảo hành) |
| `department` | → | `roomId` (Tự động tìm phòng phù hợp) |
| Tự động | → | `status` = "Tốt" |
| Tự động | → | `code` (Mã thiết bị) |

## 🏢 Tự động gán phòng ban

Hệ thống sẽ **tự động tìm phòng phù hợp** bằng cách:

1. **Tìm theo tên phòng**: So khớp tên phòng với tên phòng ban trong đề nghị mua sắm
2. **Tìm theo mô tả**: So khớp mô tả phòng với tên phòng ban

**Ví dụ:**
- Đề nghị mua sắm từ "Phòng IT" → Tự động gán vào phòng "IT Office" (nếu có)
- Đề nghị từ "Phòng Kế toán" → Gán vào phòng có mô tả chứa "kế toán"

## 💾 Metadata được lưu trữ

Thiết bị được tạo tự động sẽ có thông tin **metadata** chi tiết:

```json
{
  "procurementId": "ID của đề nghị mua sắm gốc",
  "supplier": "Nhà cung cấp",
  "selectionMethod": "Hình thức lựa chọn (đấu thầu, chào hàng...)",
  "actualPaymentValue": "Giá trị thanh toán thực tế",
  "specifications": "Thông số kỹ thuật",
  "autoCreated": true,
  "createdFromProcurement": "Thời gian tạo tự động"
}
```

## 🔧 Hướng dẫn sử dụng

### Bước 1: Tạo đề nghị mua sắm
1. Vào **Quản lý → 🛒 Mua sắm hàng năm**
2. Click **"➕ Thêm đề nghị mua sắm"**
3. Điền đầy đủ thông tin (đặc biệt chú ý các trường có dấu `*`)

### Bước 2: Theo dõi quy trình phê duyệt
- **Nháp** → **Đã đề nghị** → **Đã phê duyệt** → **Đã mua**

### Bước 3: Hoàn thành mua sắm
1. Khi hàng về và nghiệm thu xong
2. Cập nhật trạng thái thành **"Hoàn thành"**
3. Nhập **"Giá trị thanh toán nghiệm thu"** (nếu chưa có)

### Bước 4: Kiểm tra thiết bị đã được tạo
1. Vào **🖥️ Thiết bị**
2. Tìm thiết bị vừa được tạo (có mã bắt đầu bằng `FA` hoặc `TE`)
3. Xem chi tiết để thấy thông tin liên kết với đề nghị mua sắm gốc

## 📈 Lợi ích

### ✅ Tự động hóa quy trình
- Không cần nhập lại thông tin thiết bị
- Giảm thiểu sai sót do nhập liệu thủ công
- Tiết kiệm thời gian xử lý

### ✅ Truy xuất nguồn gốc
- Biết được thiết bị mua từ đề nghị nào
- Theo dõi được lịch sử mua sắm
- Dễ dàng tra cứu thông tin nhà cung cấp

### ✅ Đồng bộ dữ liệu
- Thông tin thiết bị luôn nhất quán với hồ sơ mua sắm
- Tự động cập nhật phòng ban sử dụng
- Đảm bảo tính chính xác của dữ liệu

## 🔍 Theo dõi và Debug

### Console Logs
Khi thiết bị được tạo tự động, hệ thống sẽ ghi log:
```
✅ Đã tự động tạo thiết bị từ mua sắm: [Tên thiết bị] ([Mã thiết bị])
```

### Trường hợp có lỗi:
```
❌ Lỗi khi tự động tạo thiết bị từ mua sắm: [Chi tiết lỗi]
```

## 🚨 Lưu ý quan trọng

1. **Chỉ tạo 1 lần**: Thiết bị chỉ được tạo tự động khi **lần đầu** chuyển sang trạng thái "Hoàn thành"

2. **Không ghi đè**: Nếu đã có thiết bị được tạo, việc cập nhật lại trạng thái sẽ không tạo thiết bị mới

3. **Phòng ban**: Nếu không tìm thấy phòng phù hợp, thiết bị sẽ được tạo nhưng không gán vào phòng nào

4. **Bảo hành**: Nếu không có ngày mua hoặc thời gian bảo hành, hệ thống sẽ mặc định bảo hành 1 năm từ hôm nay

## 🛠️ Tùy chỉnh

Nếu cần tùy chỉnh quy trình tạo thiết bị, có thể chỉnh sửa trong file:
```
/lib/procurementManager.ts
```

**Các method có thể tùy chỉnh:**
- `createDeviceFromProcurement()`: Logic tạo thiết bị
- `mapProcurementCategoryToDeviceCategory()`: Mapping loại thiết bị
- `calculateWarrantyDate()`: Tính toán ngày hết hạn bảo hành

---

**Với tính năng tích hợp này, quy trình từ mua sắm đến quản lý tài sản trở nên liền mạch và tự động! 🎉**
