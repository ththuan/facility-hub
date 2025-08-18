# 🔥 FIX SQL Error - Hướng dẫn khắc phục

## ❌ Lỗi gặp phải:
```
ERROR: 42703: column "type" of relation "rooms" does not exist
```

## ✅ Đã khắc phục:
- Fixed schema definition trong `rooms` table
- Updated sample data INSERT statements
- Enhanced với more sample data

## 🚀 Cách thực hiện (2 options):

### Option 1: Clean & Fresh Setup
1. **Vào Supabase Dashboard → SQL Editor**
2. **Chạy script 1**: Copy nội dung từ `scripts/clean-database-quick.sql` → Run
3. **Chạy script 2**: Copy nội dung từ `scripts/setup-database.sql` → Run
4. **Verify**: Vào http://localhost:3000/debug để kiểm tra

### Option 2: Drop Tables & Recreate
1. **Vào Supabase Dashboard → SQL Editor**
2. **Chạy script cleanup**:
```sql
DROP TABLE IF EXISTS work_orders CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS devices CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;
DROP TYPE IF EXISTS device_status CASCADE;
DROP TYPE IF EXISTS priority_level CASCADE;
DROP TYPE IF EXISTS wo_status CASCADE;
DROP TYPE IF EXISTS doc_type CASCADE;
```
3. **Chạy setup-database.sql** (đã fix)

## 📊 Expected Results sau khi chạy thành công:
- ✅ **Rooms**: 4 phòng (Giám đốc, Kế toán, Họp lớn, IT)
- ✅ **Devices**: 6 thiết bị (máy tính, máy in, máy chiếu, switch, UPS, máy lạnh)
- ✅ **Documents**: 3 tài liệu (hợp đồng, manual, báo giá)
- ✅ **Work Orders**: 4 công việc (với các trạng thái khác nhau)

## 🎯 Test sau khi setup:
1. Vào http://localhost:3000/debug → Click "Test Connection"
2. Kiểm tra các số liệu:
   - Documents: 3 items ✅
   - Devices: 6 items ✅ 
   - Rooms: 4 items ✅
   - Work Orders: 4 items ✅

## 🔍 Nếu vẫn có lỗi:
- Check Supabase logs trong dashboard
- Verify connection string trong .env.local
- Test connection tại /debug page

**Script đã được fix và ready to run!** 🚀
