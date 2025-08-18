'use client';

import { useState } from 'react';
import { deviceManager, roomManager } from '@/lib/localStorage';

export default function ImportPage() {
  const [activeTab, setActiveTab] = useState<'devices' | 'rooms'>('devices');
  const [csvData, setCsvData] = useState('');
  const [importResult, setImportResult] = useState<{
    success: number;
    errors: string[];
  } | null>(null);

  // Thống kê hiện tại
  const currentStats = {
    devices: deviceManager.getAll().length,
    rooms: roomManager.getAll().length
  };

  // Template dữ liệu mẫu cho thiết bị (mở rộng)
  const deviceTemplate = `code,name,category,unit,purchaseYear,warrantyUntil,roomCode,status,quantity
TB001,Máy tính Dell Optiplex 3080,Máy tính,Chiếc,2023,2026-12-31,P001,Tốt,1
TB002,Máy in HP LaserJet Pro M404n,Máy in,Chiếc,2022,2025-12-31,P001,Tốt,1
TB003,Máy chiếu Epson EB-X06,Thiết bị AV,Chiếc,2021,2024-12-31,P002,Đang bảo trì,1
TB004,Bàn học gỗ sồi,Nội thất,Chiếc,2020,,P003,Tốt,30
TB005,Ghế xoay văn phòng,Nội thất,Chiếc,2020,,P001,Tốt,5
TB006,Máy lạnh Daikin 2HP,Điều hòa,Chiếc,2022,2027-06-30,P002,Tốt,1
TB007,Tủ sắt 2 cánh,Nội thất,Chiếc,2019,,P004,Tốt,2
TB008,Máy photocopy Canon iR2006N,Máy in,Chiếc,2021,2024-08-15,P005,Tốt,1
TB009,Laptop Dell Inspiron 15,Máy tính,Chiếc,2023,2026-03-20,P006,Tốt,10
TB010,Màn hình LG 24 inch,Thiết bị IT,Chiếc,2022,2025-12-31,P003,Tốt,15
TB011,Bảng trắng 1.2x2.4m,Thiết bị giảng dạy,Chiếc,2020,,P003,Tốt,1
TB012,Micro không dây Shure,Thiết bị AV,Chiếc,2021,2024-10-30,P002,Tốt,2
TB013,Máy scan Epson V600,Thiết bị IT,Chiếc,2020,2023-12-31,P005,Hư,1
TB014,Router Cisco 2900,Thiết bị mạng,Chiếc,2019,2024-05-15,P007,Tốt,1
TB015,Switch 24 port TP-Link,Thiết bị mạng,Chiếc,2021,2026-01-20,P007,Tốt,3
TB016,UPS APC 1500VA,Thiết bị điện,Chiếc,2022,2027-11-10,P007,Tốt,5
TB017,Máy pha cà phê Delonghi,Thiết bị phục vụ,Chiếc,2021,,P008,Tốt,1
TB018,Tủ lạnh Samsung 300L,Thiết bị phục vụ,Chiếc,2020,2025-04-25,P008,Tốt,1
TB019,Máy hút bụi Electrolux,Thiết bị dọn dẹp,Chiếc,2019,,P009,Đang bảo trì,1
TB020,Xe đẩy hàng 2 tầng,Thiết bị vận chuyển,Chiếc,2018,,P009,Tốt,3`;

  // Template dữ liệu mẫu cho phòng (mở rộng)
  const roomTemplate = `code,name,area,capacity,type,floor,building,status,description
P001,Phòng Giám đốc,25,5,Văn phòng,Tầng 1,Tòa A,Hoạt động,Phòng làm việc của giám đốc
P002,Phòng họp lớn,50,20,Phòng họp,Tầng 2,Tòa A,Hoạt động,Phòng họp chính có máy chiếu
P003,Lớp học 101,80,40,Lớp học,Tầng 1,Tòa B,Hoạt động,Lớp học chính có bảng trắng
P004,Phòng thí nghiệm Hóa,60,30,Phòng lab,Tầng 2,Tòa B,Hoạt động,Phòng thí nghiệm khoa học
P005,Kho thiết bị,100,0,Kho,Tầng trệt,Tòa C,Hoạt động,Kho lưu trữ thiết bị IT
P006,Lớp máy tính,70,35,Lớp học,Tầng 1,Tòa B,Hoạt động,Phòng học có máy tính
P007,Phòng máy chủ,20,5,Phòng kỹ thuật,Tầng trệt,Tòa A,Hoạt động,Phòng chứa server và thiết bị mạng
P008,Phòng nghỉ nhân viên,30,15,Phòng phục vụ,Tầng 1,Tòa A,Hoạt động,Khu vực nghỉ ngơi có bếp nhỏ
P009,Phòng vệ sinh công nghiệp,15,0,Phòng phục vụ,Tầng trệt,Tòa C,Hoạt động,Phòng chứa thiết bị vệ sinh
P010,Lớp học 102,80,40,Lớp học,Tầng 1,Tòa B,Hoạt động,Lớp học phụ
P011,Lớp học 201,80,40,Lớp học,Tầng 2,Tòa B,Hoạt động,Lớp học tầng 2
P012,Lớp học 202,80,40,Lớp học,Tầng 2,Tòa B,Bảo trì,Đang sửa chữa hệ thống điện
P013,Phòng họp nhỏ,25,8,Phòng họp,Tầng 1,Tòa A,Hoạt động,Phòng họp nhóm nhỏ
P014,Phòng thí nghiệm Vật lý,65,32,Phòng lab,Tầng 3,Tòa B,Hoạt động,Lab vật lý có thiết bị đo lường
P015,Thư viện,150,80,Thư viện,Tầng 2,Tòa A,Hoạt động,Khu vực đọc sách và nghiên cứu
P016,Phòng y tế,20,3,Phòng y tế,Tầng 1,Tòa A,Hoạt động,Phòng chăm sóc sức khỏe ban đầu
P017,Phòng bảo vệ,15,4,Phòng bảo vệ,Tầng trệt,Tòa A,Hoạt động,Phòng trực bảo vệ 24/7
P018,Kho tài liệu,80,0,Kho,Tầng 3,Tòa C,Hoạt động,Lưu trữ hồ sơ và tài liệu
P019,Phòng đào tạo,90,50,Phòng đào tạo,Tầng 3,Tòa A,Hoạt động,Phòng tổ chức các khóa đào tạo
P020,Garage,200,0,Nhà để xe,Tầng trệt,Tòa C,Hoạt động,Chỗ đậu xe ô tô và xe máy`;

  const handleImportDevices = () => {
    if (!csvData.trim()) {
      alert('Vui lòng nhập dữ liệu CSV');
      return;
    }

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const errors: string[] = [];
    let success = 0;

    // Lấy danh sách phòng để map roomCode
    const rooms = roomManager.getAll();
    const roomCodeMap = new Map(rooms.map(room => [room.code, room.id]));

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // Tìm roomId từ roomCode
        let roomId: string | undefined;
        if (rowData.roomCode) {
          roomId = roomCodeMap.get(rowData.roomCode);
          if (!roomId) {
            errors.push(`Dòng ${i + 1}: Không tìm thấy phòng với mã "${rowData.roomCode}"`);
            continue;
          }
        }

        const device = {
          code: rowData.code || `TB${Date.now()}_${i}`,
          name: rowData.name || 'Thiết bị không tên',
          category: rowData.category || 'Khác',
          unit: rowData.unit,
          purchaseYear: rowData.purchaseYear ? parseInt(rowData.purchaseYear) : undefined,
          warrantyUntil: rowData.warrantyUntil,
          roomId,
          status: (rowData.status as 'Tốt' | 'Đang bảo trì' | 'Hư') || 'Tốt',
          quantity: rowData.quantity ? parseInt(rowData.quantity) : 1,
        };

        deviceManager.create(device);
        success++;
      } catch (error) {
        errors.push(`Dòng ${i + 1}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      }
    }

    setImportResult({ success, errors });
  };

  const handleImportRooms = () => {
    if (!csvData.trim()) {
      alert('Vui lòng nhập dữ liệu CSV');
      return;
    }

    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const errors: string[] = [];
    let success = 0;

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const rowData: any = {};
        
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        const room = {
          code: rowData.code || `P${Date.now()}_${i}`,
          name: rowData.name || 'Phòng không tên',
          area: rowData.area ? parseFloat(rowData.area) : undefined,
          capacity: rowData.capacity ? parseInt(rowData.capacity) : undefined,
          type: rowData.type,
          floor: rowData.floor,
          building: rowData.building,
          description: rowData.description,
          status: (rowData.status as 'Hoạt động' | 'Bảo trì' | 'Ngưng sử dụng') || 'Hoạt động',
        };

        roomManager.create(room);
        success++;
      } catch (error) {
        errors.push(`Dòng ${i + 1}: ${error instanceof Error ? error.message : 'Lỗi không xác định'}`);
      }
    }

    setImportResult({ success, errors });
  };

  const handleDownloadTemplate = () => {
    const template = activeTab === 'devices' ? deviceTemplate : roomTemplate;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${activeTab}.csv`;
    link.click();
  };

  const handleExportData = () => {
    let csvContent = '';
    let filename = '';

    if (activeTab === 'devices') {
      const devices = deviceManager.getAll();
      const rooms = roomManager.getAll();
      const roomIdToCode = new Map(rooms.map(room => [room.id, room.code]));

      csvContent = 'code,name,category,unit,purchaseYear,warrantyUntil,roomCode,status,quantity\n';
      devices.forEach(device => {
        const roomCode = device.roomId ? roomIdToCode.get(device.roomId) || '' : '';
        csvContent += `${device.code},${device.name},${device.category},${device.unit || ''},${device.purchaseYear || ''},${device.warrantyUntil || ''},${roomCode},${device.status},${device.quantity}\n`;
      });
      filename = 'devices_export.csv';
    } else {
      const rooms = roomManager.getAll();
      csvContent = 'code,name,area,capacity,type,floor,building,status,description\n';
      rooms.forEach(room => {
        csvContent += `${room.code},${room.name},${room.area || ''},${room.capacity || ''},${room.type || ''},${room.floor || ''},${room.building || ''},${room.status},${room.description || ''}\n`;
      });
      filename = 'rooms_export.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const handleClearData = () => {
    const type = activeTab === 'devices' ? 'thiết bị' : 'phòng ban';
    if (confirm(`⚠️ Bạn có chắc muốn xóa TẤT CẢ dữ liệu ${type}?\n\nHành động này không thể hoàn tác!`)) {
      if (activeTab === 'devices') {
        const devices = deviceManager.getAll();
        devices.forEach(device => deviceManager.delete(device.id));
        alert(`✅ Đã xóa ${devices.length} thiết bị`);
      } else {
        const rooms = roomManager.getAll();
        rooms.forEach(room => roomManager.delete(room.id));
        alert(`✅ Đã xóa ${rooms.length} phòng ban`);
      }
      setImportResult(null);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setCsvData(content);
      };
      reader.readAsText(file, 'UTF-8');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Import Dữ liệu</h1>
        <p className="mt-2 text-gray-600">
          Nhập dữ liệu hàng loạt cho thiết bị và phòng ban
        </p>
        <div className="mt-4 flex space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              📱 {currentStats.devices} Thiết bị
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              🏢 {currentStats.rooms} Phòng ban
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('devices')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'devices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Import Thiết bị
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rooms'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Import Phòng ban
          </button>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {/* Hướng dẫn */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">
            📋 Hướng dẫn Import hàng loạt cho trường học
          </h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p><strong>Bước 1:</strong> Tải template CSV bằng cách nhấn nút "Tải Template"</p>
            <p><strong>Bước 2:</strong> Mở file CSV trong Excel hoặc Google Sheets</p>
            <p><strong>Bước 3:</strong> {activeTab === 'devices' 
              ? 'Điền thông tin thiết bị: máy tính, máy chiếu, bàn ghế, thiết bị thí nghiệm...' 
              : 'Điền thông tin phòng học: lớp học, phòng thí nghiệm, phòng họp, văn phòng...'}</p>
            <p><strong>Bước 4:</strong> Lưu file và upload hoặc copy-paste nội dung</p>
            <p><strong>Bước 5:</strong> Nhấn "Import" để thêm vào hệ thống</p>
            <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-200">
              <p className="font-medium text-yellow-800">💡 Mẹo:</p>
              <ul className="list-disc list-inside text-yellow-700 text-xs mt-1 space-y-1">
                <li>Import phòng trước, sau đó import thiết bị (để gán thiết bị vào phòng)</li>
                <li>Template có 20 mẫu dữ liệu cho mỗi loại - bạn có thể sửa đổi hoặc thêm</li>
                <li>Sử dụng "Export dữ liệu hiện tại" để backup dữ liệu</li>
                <li>Mã phòng và mã thiết bị phải duy nhất trong hệ thống</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Template download & Export */}
        <div className="mb-6 flex flex-wrap gap-4">
          <button
            onClick={handleDownloadTemplate}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            📥 Tải Template {activeTab === 'devices' ? 'Thiết bị' : 'Phòng ban'}
          </button>
          <button
            onClick={handleExportData}
            className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100"
          >
            📤 Export dữ liệu hiện tại
          </button>
          <button
            onClick={handleClearData}
            className="inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100"
          >
            🗑️ Xóa tất cả {activeTab === 'devices' ? 'thiết bị' : 'phòng ban'}
          </button>
        </div>

        {/* File upload */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload file CSV
          </label>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {/* CSV input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hoặc paste dữ liệu CSV trực tiếp
          </label>
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={12}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
            placeholder={`Paste dữ liệu CSV ở đây...\n\nVí dụ:\n${activeTab === 'devices' ? deviceTemplate.split('\n').slice(0, 3).join('\n') : roomTemplate.split('\n').slice(0, 3).join('\n')}`}
          />
        </div>

        {/* Import button */}
        <div className="mb-6">
          <button
            onClick={activeTab === 'devices' ? handleImportDevices : handleImportRooms}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            🚀 Import {activeTab === 'devices' ? 'Thiết bị' : 'Phòng ban'}
          </button>
        </div>

        {/* Import result */}
        {importResult && (
          <div className={`p-4 rounded-lg ${importResult.errors.length === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <h3 className="font-semibold mb-2">
              ✅ Kết quả import: {importResult.success} bản ghi thành công
            </h3>
            {importResult.errors.length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-2">❌ Các lỗi:</h4>
                <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Format giải thích */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-3">
            📝 Format dữ liệu {activeTab === 'devices' ? 'thiết bị' : 'phòng ban'}
          </h3>
          
          {activeTab === 'devices' ? (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>code</strong>: Mã thiết bị (bắt buộc, duy nhất)</p>
              <p><strong>name</strong>: Tên thiết bị (bắt buộc)</p>
              <p><strong>category</strong>: Danh mục (Máy tính, Máy in, Nội thất, v.v.)</p>
              <p><strong>unit</strong>: Đơn vị (Chiếc, Bộ, v.v.)</p>
              <p><strong>purchaseYear</strong>: Năm mua (số)</p>
              <p><strong>warrantyUntil</strong>: Hạn bảo hành (YYYY-MM-DD)</p>
              <p><strong>roomCode</strong>: Mã phòng (phải tồn tại trong hệ thống)</p>
              <p><strong>status</strong>: Trạng thái (Tốt, Đang bảo trì, Hư)</p>
              <p><strong>quantity</strong>: Số lượng (số)</p>
            </div>
          ) : (
            <div className="text-sm text-gray-700 space-y-2">
              <p><strong>code</strong>: Mã phòng (bắt buộc, duy nhất)</p>
              <p><strong>name</strong>: Tên phòng (bắt buộc)</p>
              <p><strong>area</strong>: Diện tích m² (số)</p>
              <p><strong>capacity</strong>: Sức chứa (số người)</p>
              <p><strong>type</strong>: Loại phòng (Văn phòng, Lớp học, v.v.)</p>
              <p><strong>floor</strong>: Tầng</p>
              <p><strong>building</strong>: Tòa nhà</p>
              <p><strong>status</strong>: Trạng thái (Hoạt động, Bảo trì, Ngưng sử dụng)</p>
              <p><strong>description</strong>: Mô tả</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
