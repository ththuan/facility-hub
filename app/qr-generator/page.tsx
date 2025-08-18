'use client';

import { useState, useEffect } from 'react';
import { supabaseService, Device, Room } from '@/lib/supabaseService';

const getStatusText = (status: string) => {
  switch (status) {
    case 'good': return 'Tốt';
    case 'maintenance': return 'Cần bảo trì';
    case 'broken': return 'Hỏng';
    case 'repairing': return 'Đang sửa chữa';
    default: return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'good': return 'text-green-600';
    case 'maintenance': return 'text-yellow-600';
    case 'broken': return 'text-red-600';
    case 'repairing': return 'text-purple-600';
    default: return 'text-gray-600';
  }
};

export default function QRCodePage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [qrSize, setQrSize] = useState<number>(256);
  const [includeInfo, setIncludeInfo] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Load data from Supabase
  const loadData = async () => {
    try {
      const [devicesData, roomsData] = await Promise.all([
        supabaseService.getDevices(),
        supabaseService.getRooms(),
      ]);
      
      setDevices(devicesData);
      setRooms(roomsData);
      console.log('✅ QR Generator - Loaded devices:', devicesData.length);
      console.log('✅ QR Generator - Loaded rooms:', roomsData.length);
    } catch (error) {
      console.error('Error loading data for QR Generator:', error);
      alert('Lỗi khi tải dữ liệu thiết bị. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateQRCode = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const room = rooms.find(r => r.id === device.roomId);
    
    // Dữ liệu QR Code - sử dụng device code thay vì ID để đồng bộ với devices page
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const deviceUrl = `${baseUrl}/devices/${device.code}`;
    
    const qrData = {
      type: 'device',
      id: device.id,
      code: device.code,
      name: device.name,
      category: device.category,
      room: room?.name || 'Chưa phân bổ',
      roomCode: room?.code || '',
      status: getStatusText(device.status),
      purchaseYear: device.purchaseYear,
      warrantyUntil: device.warrantyUntil,
      url: deviceUrl
    };

    // Sử dụng QR Code API miễn phí - đồng bộ với devices page
    const qrText = includeInfo ? JSON.stringify(qrData) : deviceUrl;
    const encodedData = encodeURIComponent(qrText);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedData}&format=png&bgcolor=FFFFFF&color=000000&margin=10`;
    
    setQrCodeUrl(qrUrl);
  };

  const downloadQRCode = async () => {
    if (!qrCodeUrl) return;
    
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const device = devices.find(d => d.id === selectedDevice);
      a.download = `QR_${device?.code || 'device'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Lỗi tải xuống:', error);
      alert('Có lỗi khi tải xuống QR code');
    }
  };

  const generateBulkQR = () => {
    const devicesToGenerate = filteredDevices.length > 0 ? filteredDevices : devices;
    
    devicesToGenerate.forEach((device, index) => {
      setTimeout(() => {
        const room = rooms.find(r => r.id === device.roomId);
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const deviceUrl = `${baseUrl}/devices/${device.code}`;
        
        const qrData = {
          type: 'device',
          id: device.id,
          code: device.code,
          name: device.name,
          category: device.category,
          room: room?.name || 'Chưa phân bổ',
          roomCode: room?.code || '',
          status: getStatusText(device.status),
          purchaseYear: device.purchaseYear,
          warrantyUntil: device.warrantyUntil,
          url: deviceUrl
        };
        
        const qrText = includeInfo ? JSON.stringify(qrData) : deviceUrl;
        const encodedData = encodeURIComponent(qrText);
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodedData}&format=png&bgcolor=FFFFFF&color=000000&margin=10`;
        
        // Tạo link download cho từng QR - đồng bộ với devices page
        const a = document.createElement('a');
        a.href = qrUrl;
        a.download = `QR_${device.code}.png`;
        a.click();
      }, index * 500); // Delay để tránh spam requests
    });
  };

  const selectedDeviceInfo = devices.find(d => d.id === selectedDevice);
  const selectedRoom = selectedDeviceInfo?.roomId ? rooms.find(r => r.id === selectedDeviceInfo.roomId) : null;

  // Filter devices for display
  const filteredDevices = devices.filter(device => {
    const matchesSearch = searchTerm === '' || 
      device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      device.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === '' || device.category === categoryFilter;
    const matchesStatus = statusFilter === '' || device.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(devices.map(d => d.category)));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu thiết bị...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">📱 QR Code Generator</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Tạo mã QR cho thiết bị để quản lý và theo dõi dễ dàng - Đồng bộ với database thiết bị
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">🔍 Lọc thiết bị</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm thiết bị..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả danh mục</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="good">✅ Tốt</option>
            <option value="maintenance">⚠️ Cần bảo trì</option>
            <option value="broken">❌ Hỏng</option>
            <option value="repairing">🔧 Đang sửa chữa</option>
          </select>
        </div>
        <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Hiển thị {filteredDevices.length} / {devices.length} thiết bị
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">⚙️ Cài đặt QR Code</h3>
          
          {/* Device Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn thiết bị ({filteredDevices.length} thiết bị)
            </label>
            <select
              value={selectedDevice}
              onChange={(e) => {
                setSelectedDevice(e.target.value);
                if (e.target.value) {
                  generateQRCode(e.target.value);
                } else {
                  setQrCodeUrl('');
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Chọn thiết bị --</option>
              {filteredDevices.map(device => (
                <option key={device.id} value={device.id}>
                  {device.code} - {device.name} ({getStatusText(device.status)})
                </option>
              ))}
            </select>
          </div>

          {/* QR Size */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kích thước QR Code: {qrSize}px
            </label>
            <input
              type="range"
              min="128"
              max="512"
              step="32"
              value={qrSize}
              onChange={(e) => {
                setQrSize(parseInt(e.target.value));
                if (selectedDevice) {
                  generateQRCode(selectedDevice);
                }
              }}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>128px</span>
              <span>320px</span>
              <span>512px</span>
            </div>
          </div>

          {/* Include Info */}
          <div className="mb-6">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={includeInfo}
                onChange={(e) => {
                  setIncludeInfo(e.target.checked);
                  if (selectedDevice) {
                    generateQRCode(selectedDevice);
                  }
                }}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 dark:bg-gray-700"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Bao gồm thông tin chi tiết trong QR Code
              </span>
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {includeInfo 
                ? 'QR sẽ chứa tất cả thông tin thiết bị (JSON)' 
                : 'QR chỉ chứa link đến trang thiết bị'}
            </p>
          </div>

          {/* Device Info Preview */}
          {selectedDeviceInfo && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">📋 Thông tin thiết bị</h4>
              <div className="space-y-1 text-sm">
                <div className="text-gray-700 dark:text-gray-300"><strong>Mã:</strong> {selectedDeviceInfo.code}</div>
                <div className="text-gray-700 dark:text-gray-300"><strong>Tên:</strong> {selectedDeviceInfo.name}</div>
                <div className="text-gray-700 dark:text-gray-300"><strong>Danh mục:</strong> {selectedDeviceInfo.category}</div>
                <div className="text-gray-700 dark:text-gray-300"><strong>Phòng:</strong> {selectedRoom?.name || 'Chưa phân bổ'}</div>
                {selectedDeviceInfo.purchaseYear && (
                  <div className="text-gray-700 dark:text-gray-300"><strong>Năm mua:</strong> {selectedDeviceInfo.purchaseYear}</div>
                )}
                {selectedDeviceInfo.warrantyUntil && (
                  <div className="text-gray-700 dark:text-gray-300"><strong>Bảo hành:</strong> {new Date(selectedDeviceInfo.warrantyUntil).toLocaleDateString('vi-VN')}</div>
                )}
                <div className="text-gray-700 dark:text-gray-300"><strong>Trạng thái:</strong> 
                  <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                    selectedDeviceInfo.status === 'good' ? 'bg-green-100 text-green-800' :
                    selectedDeviceInfo.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                    selectedDeviceInfo.status === 'broken' ? 'bg-red-100 text-red-800' :
                    selectedDeviceInfo.status === 'repairing' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusText(selectedDeviceInfo.status)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">📦 Hành động hàng loạt</h4>
            <button
              onClick={generateBulkQR}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={filteredDevices.length === 0}
            >
              Tải xuống QR cho thiết bị đã lọc ({filteredDevices.length})
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Sẽ tự động tải xuống {devices.length} file QR Code
            </p>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">📱 QR Code Preview</h3>
          
          {qrCodeUrl ? (
            <div className="text-center">
              <div className="inline-block p-4 bg-white dark:bg-gray-100 border-2 border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code" 
                  className="mx-auto"
                  style={{ width: qrSize, height: qrSize }}
                />
              </div>
              
              <div className="mt-4 space-y-3">
                <button
                  onClick={downloadQRCode}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  📥 Tải xuống QR Code
                </button>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      if (navigator.share && qrCodeUrl) {
                        navigator.share({
                          title: `QR Code - ${selectedDeviceInfo?.code}`,
                          text: `QR Code cho thiết bị ${selectedDeviceInfo?.name}`,
                          url: qrCodeUrl
                        });
                      } else {
                        navigator.clipboard.writeText(qrCodeUrl);
                        alert('Đã copy link QR Code');
                      }
                    }}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    📤 Chia sẻ
                  </button>
                  
                  <button
                    onClick={() => window.print()}
                    className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                  >
                    🖨️ In
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chọn thiết bị để tạo QR Code
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                QR Code sẽ hiển thị tại đây sau khi bạn chọn thiết bị
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-3">💡 Hướng dẫn sử dụng QR Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <h4 className="font-medium mb-2">📱 Quét QR Code:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Sử dụng camera điện thoại hoặc app quét QR</li>
              <li>QR sẽ mở link đến trang thông tin thiết bị</li>
              <li>Hoặc hiển thị thông tin JSON chi tiết</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">🔧 Ứng dụng thực tế:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Dán QR lên thiết bị để quản lý</li>
              <li>Kiểm tra nhanh thông tin thiết bị</li>
              <li>Báo cáo sự cố qua QR Code</li>
              <li>Theo dõi lịch sử bảo trì</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">📊 Thống kê thiết bị (Đã đồng bộ)</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{devices.length}</div>
            <div className="text-sm text-blue-600 dark:text-blue-300">Tổng thiết bị</div>
          </div>
          <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-300">
              {devices.filter(d => d.status === 'good').length}
            </div>
            <div className="text-sm text-green-600 dark:text-green-300">Thiết bị tốt</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-300">
              {devices.filter(d => d.status === 'maintenance').length}
            </div>
            <div className="text-sm text-yellow-600 dark:text-yellow-300">Đang bảo trì</div>
          </div>
          <div className="text-center p-4 bg-red-50 dark:bg-red-900 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-300">
              {devices.filter(d => d.status === 'broken' || d.status === 'repairing').length}
            </div>
            <div className="text-sm text-red-600 dark:text-red-300">Thiết bị lỗi</div>
          </div>
        </div>
      </div>
    </div>
  );
}
