'use client';

import { useState, useEffect } from "react";
import { supabaseService, Device, Room } from "@/lib/supabaseService";

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
    case 'good': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'maintenance': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'broken': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    case 'repairing': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('vi-VN');
};

const generateQRCodeUrl = (deviceCode: string) => {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const deviceUrl = `${baseUrl}/devices/${deviceCode}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(deviceUrl)}`;
};

export default function DevicesPage() {
  // State
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [unitFilter, setUnitFilter] = useState<string>("");
  const [roomFilter, setRoomFilter] = useState<string>("");
  const [yearFilter, setYearFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);
  const [showQRModal, setShowQRModal] = useState<Device | null>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form data
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    unit: "",
    image: "",
    purchaseYear: new Date().getFullYear(),
    warrantyUntil: "",
    roomId: "",
    status: "good" as Device['status'],
    quantity: 1,
  });
  
  // File upload
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Load data
  const loadData = async () => {
    try {
      const [devicesData, roomsData] = await Promise.all([
        supabaseService.getDevices(),
        supabaseService.getRooms(),
      ]);
      
      setDevices(devicesData);
      setRooms(roomsData);
      console.log('✅ Loaded devices:', devicesData.length);
      console.log('✅ Loaded rooms:', roomsData.length);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Lỗi khi tải dữ liệu. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        alert('Hình ảnh quá lớn! Vui lòng chọn file nhỏ hơn 5MB.');
        return;
      }
      
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let imageUrl = formData.image;
      
      // If there's a selected image, simulate upload
      if (selectedImage) {
        // In a real app, you'd upload to cloud storage
        imageUrl = imagePreview; // Use preview as URL for demo
      }
      
      const deviceData: Omit<Device, 'id' | 'createdAt' | 'updatedAt'> = {
        code: formData.code,
        name: formData.name,
        category: formData.category,
        unit: formData.unit,
        image: imageUrl,
        purchaseYear: formData.purchaseYear,
        warrantyUntil: formData.warrantyUntil || undefined,
        roomId: formData.roomId || undefined,
        status: formData.status,
        quantity: formData.quantity,
        meta: {},
      };
      
      if (editingDevice) {
        await supabaseService.updateDevice(editingDevice.id, deviceData);
        console.log('✅ Device updated successfully');
      } else {
        const newDevice = await supabaseService.createDevice(deviceData);
        console.log('✅ Device created:', newDevice);
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('❌ Error saving device:', error);
      alert('Lỗi khi lưu thiết bị: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      code: device.code,
      name: device.name,
      category: device.category,
      unit: device.unit,
      image: device.image || '',
      purchaseYear: device.purchaseYear || new Date().getFullYear(),
      warrantyUntil: device.warrantyUntil || '',
      roomId: device.roomId || '',
      status: device.status,
      quantity: device.quantity,
    });
    
    if (device.image) {
      setImagePreview(device.image);
    }
    
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      try {
        const result = await supabaseService.deleteDevice(id);
        if (result) {
          console.log('✅ Device deleted successfully');
          await loadData();
        } else {
          alert('Không thể xóa thiết bị này. Vui lòng thử lại!');
        }
      } catch (error) {
        console.error('❌ Error deleting device:', error);
        alert('Lỗi khi xóa thiết bị. Vui lòng thử lại!');
      }
    }
  };

  // Import functions
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'text/csv',
        'application/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
        alert('Vui lòng chọn file CSV hoặc Excel (.csv, .xls, .xlsx)');
        return;
      }
      
      setImportFile(file);
      setImportProgress(null);
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return data;
  };

  const processImport = async () => {
    if (!importFile) return;

    try {
      setImportProgress({ status: 'reading', message: 'Đang đọc file...' });

      let data: any[] = [];

      if (importFile.type === 'text/csv' || importFile.name.endsWith('.csv')) {
        const text = await importFile.text();
        data = parseCSV(text);
      } else {
        // For Excel files, we would need a library like xlsx
        alert('Excel files cần thêm thư viện xlsx. Hiện tại chỉ hỗ trợ CSV.');
        return;
      }

      if (data.length === 0) {
        alert('File không có dữ liệu hợp lệ');
        return;
      }

      setImportProgress({ status: 'processing', message: `Đang xử lý ${data.length} thiết bị...` });

      // Map CSV columns to device fields
      const devices = data.map(row => ({
        code: row.code || row['Mã thiết bị'] || row['Device Code'] || '',
        name: row.name || row['Tên thiết bị'] || row['Device Name'] || '',
        category: row.category || row['Danh mục'] || row['Category'] || '',
        unit: row.unit || row['Đơn vị'] || row['Unit'] || '',
        purchaseYear: row.purchaseYear || row['Năm mua'] || row['Purchase Year'] || undefined,
        warrantyUntil: row.warrantyUntil || row['Bảo hành đến'] || row['Warranty Until'] || undefined,
        roomCode: row.roomCode || row['Mã phòng'] || row['Room Code'] || undefined,
        status: row.status || row['Trạng thái'] || row['Status'] || 'good',
        quantity: row.quantity || row['Số lượng'] || row['Quantity'] || 1,
        image: row.image || row['Hình ảnh'] || row['Image'] || undefined,
      }));

      console.log('📤 Sending import request:', devices);

      const response = await fetch('/api/devices/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ devices }),
      });

      const result = await response.json();

      if (result.success) {
        setImportProgress({
          status: 'completed',
          message: `Hoàn thành! ${result.results.success} thành công, ${result.results.failed} thất bại`,
          results: result.results,
        });

        // Reload devices
        await loadData();
      } else {
        setImportProgress({
          status: 'error',
          message: `Import thất bại: ${result.error}`,
          error: result.error,
        });
      }

    } catch (error) {
      console.error('Import error:', error);
      setImportProgress({
        status: 'error',
        message: 'Lỗi khi import: ' + (error instanceof Error ? error.message : 'Unknown error'),
        error,
      });
    }
  };

  const downloadSampleCSV = () => {
    const csvContent = `code,name,category,unit,purchaseYear,warrantyUntil,roomCode,status,quantity,image
TB001,Máy tính bàn,Máy tính,Phòng IT,2023,2025-12-31,IT01,good,1,
TB002,Máy chiếu,Thiết bị AV,Phòng họp,2022,2024-12-31,MT01,maintenance,1,
TB003,Máy in laser,Máy in,Văn phòng,2021,,VP01,broken,2,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sample_devices.csv';
    link.click();
  };

  const resetImport = () => {
    setImportFile(null);
    setImportProgress(null);
    setShowImportModal(false);
  };

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      category: "",
      unit: "",
      image: "",
      purchaseYear: new Date().getFullYear(),
      warrantyUntil: "",
      roomId: "",
      status: "good" as Device['status'],
      quantity: 1,
    });
    setEditingDevice(null);
    setShowAddForm(false);
    setSelectedImage(null);
    setImagePreview("");
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? `${room.name} (${room.code})` : 'Chưa phân phòng';
  };

  const getDeviceImage = (device: Device) => {
    return device.image || 'https://via.placeholder.com/300x200?text=Chưa+có+hình';
  };

  const getWarrantyStatus = (warrantyUntil?: string) => {
    if (!warrantyUntil) return { text: 'Không có BH', color: 'text-gray-500' };
    
    const warrantyDate = new Date(warrantyUntil);
    const now = new Date();
    const diffTime = warrantyDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Hết BH', color: 'text-red-500' };
    } else if (diffDays <= 30) {
      return { text: `Còn ${diffDays} ngày`, color: 'text-yellow-500' };
    } else {
      return { text: `Còn BH`, color: 'text-green-500' };
    }
  };

  // Effects
  useEffect(() => {
    loadData();
  }, []);

  // Get unique values for filters
  const uniqueCategories = Array.from(new Set(devices.map(d => d.category)));
  const uniqueUnits = Array.from(new Set(devices.map(d => d.unit)));
  const uniqueYears = Array.from(new Set(devices.map(d => d.purchaseYear).filter(Boolean))).sort((a, b) => b! - a!);

  // Filter devices
  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "" || device.category === categoryFilter;
    const matchesStatus = statusFilter === "" || device.status === statusFilter;
    const matchesUnit = unitFilter === "" || device.unit === unitFilter;
    const matchesRoom = roomFilter === "" || device.roomId === roomFilter;
    const matchesYear = yearFilter === "" || device.purchaseYear?.toString() === yearFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesUnit && matchesRoom && matchesYear;
  });

  // QR Code Modal
  const QRCodeModal = () => {
    if (!showQRModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6 text-center">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              📱 Mã QR - {showQRModal.name}
            </h3>
            <div className="bg-white p-4 rounded-lg mb-4 inline-block">
              <img 
                src={generateQRCodeUrl(showQRModal.code)}
                alt={`QR Code for ${showQRModal.code}`}
                className="w-48 h-48 mx-auto"
              />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Mã thiết bị: <span className="font-mono font-bold">{showQRModal.code}</span>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              Quét mã QR để xem thông tin chi tiết thiết bị
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = generateQRCodeUrl(showQRModal.code);
                  link.download = `QR_${showQRModal.code}.png`;
                  link.click();
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                💾 Tải về
              </button>
              <button
                onClick={() => setShowQRModal(null)}
                className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                ✕ Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Device Detail Modal
  const DeviceDetailModal = () => {
    if (!viewingDevice) return null;

    const warranty = getWarrantyStatus(viewingDevice.warrantyUntil);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              🔧 Chi tiết thiết bị
            </h3>
            <button 
              onClick={() => setViewingDevice(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  📸 Hình ảnh thiết bị
                </label>
                <img 
                  src={getDeviceImage(viewingDevice)}
                  alt={viewingDevice.name}
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
              
              {/* Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📋 Thông tin cơ bản
                  </label>
                  <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">Mã thiết bị:</span>
                      <span className="font-mono">{viewingDevice.code}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tên thiết bị:</span>
                      <span>{viewingDevice.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Danh mục:</span>
                      <span>{viewingDevice.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Đơn vị:</span>
                      <span>{viewingDevice.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Số lượng:</span>
                      <span>{viewingDevice.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Trạng thái:</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(viewingDevice.status)}`}>
                        {getStatusText(viewingDevice.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    📍 Vị trí & Thời gian
                  </label>
                  <div className="space-y-2 text-sm bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">Phòng:</span>
                      <span>{getRoomName(viewingDevice.roomId || '')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Năm mua:</span>
                      <span>{viewingDevice.purchaseYear || 'Chưa có'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Bảo hành:</span>
                      <span className={warranty.color}>{warranty.text}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Ngày tạo:</span>
                      <span>{formatDate(viewingDevice.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    🛠️ Hành động
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={() => setShowQRModal(viewingDevice)}
                      className="bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                    >
                      📱 QR Code
                    </button>
                    <button 
                      onClick={() => {
                        setViewingDevice(null);
                        handleEdit(viewingDevice);
                      }}
                      className="bg-yellow-600 text-white px-3 py-2 rounded text-sm hover:bg-yellow-700"
                    >
                      ✏️ Chỉnh sửa
                    </button>
                    <button 
                      onClick={() => {
                        setViewingDevice(null);
                        handleDelete(viewingDevice.id);
                      }}
                      className="bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                    >
                      🗑️ Xóa
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add/Edit Form Modal
  const DeviceFormModal = () => {
    if (!showAddForm) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {editingDevice ? '✏️ Sửa thiết bị' : '➕ Thêm thiết bị mới'}
            </h2>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔢 Mã thiết bị *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: PROJ001"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📝 Tên thiết bị *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Máy chiếu Epson"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📂 Danh mục *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Thiết bị giảng dạy"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🏢 Đơn vị/Khoa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.unit}
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="VD: Khoa Công nghệ thông tin"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📅 Năm mua
                </label>
                <input
                  type="number"
                  min="2000"
                  max="2030"
                  value={formData.purchaseYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, purchaseYear: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📊 Số lượng
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🔧 Trạng thái
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Device['status'] }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="good">✅ Tốt</option>
                  <option value="maintenance">⚠️ Cần bảo trì</option>
                  <option value="broken">❌ Hỏng</option>
                  <option value="repairing">🔧 Đang sửa chữa</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  🛡️ Bảo hành đến
                </label>
                <input
                  type="date"
                  value={formData.warrantyUntil}
                  onChange={(e) => setFormData(prev => ({ ...prev, warrantyUntil: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📍 Phòng/Vị trí
                </label>
                <select
                  value={formData.roomId}
                  onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn phòng --</option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.name} ({room.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📸 Hình ảnh thiết bị
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {imagePreview && (
                <div className="mt-3">
                  <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border" />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
              >
                {editingDevice ? '✅ Cập nhật' : '➕ Thêm mới'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                ❌ Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">🔧 Quản lý Thiết bị</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Quản lý toàn bộ thiết bị theo đơn vị, phòng và danh mục
            </p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {viewMode === 'grid' ? '📋 Danh sách' : '🎯 Lưới'}
            </button>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ Thêm thiết bị
            </button>
            <button 
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              📤 Import
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">📂 Tất cả danh mục</option>
            {uniqueCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <select 
            value={unitFilter}
            onChange={(e) => setUnitFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">🏢 Tất cả đơn vị</option>
            {uniqueUnits.map((unit) => (
              <option key={unit} value={unit}>{unit}</option>
            ))}
          </select>
          
          <select 
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">📍 Tất cả phòng</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>{room.name} ({room.code})</option>
            ))}
          </select>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">🔧 Tất cả trạng thái</option>
            <option value="good">✅ Tốt</option>
            <option value="maintenance">⚠️ Cần bảo trì</option>
            <option value="broken">❌ Hỏng</option>
            <option value="repairing">🔧 Đang sửa chữa</option>
          </select>
          
          <select 
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">📅 Tất cả năm</option>
            {uniqueYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{devices.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Tổng thiết bị</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{filteredDevices.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Hiển thị</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'good').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Thiết bị tốt</div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">
              {devices.filter(d => d.status === 'broken').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Cần sửa chữa</div>
          </div>
        </div>

        {/* Devices Display */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {filteredDevices.map((device) => (
              <div key={device.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img 
                    src={getDeviceImage(device)}
                    alt={device.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(device.status)}`}>
                      {getStatusText(device.status)}
                    </span>
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <button 
                      onClick={() => setShowQRModal(device)}
                      className="bg-black bg-opacity-50 text-white p-1 rounded text-xs hover:bg-opacity-70"
                    >
                      📱 QR
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {device.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                      {device.code}
                    </p>
                  </div>
                  
                  <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400 mb-3">
                    <div>📂 {device.category}</div>
                    <div>🏢 {device.unit}</div>
                    <div>📍 {getRoomName(device.roomId || '')}</div>
                    <div>📅 {device.purchaseYear || 'N/A'}</div>
                    <div>📊 SL: {device.quantity}</div>
                  </div>
                  
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setViewingDevice(device)}
                      className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                    >
                      👁️ Xem
                    </button>
                    <button 
                      onClick={() => handleEdit(device)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(device.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thiết bị
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Danh mục/Đơn vị
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Năm/SL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredDevices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img 
                            src={getDeviceImage(device)}
                            alt={device.name}
                            className="h-10 w-10 rounded object-cover"
                          />
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {device.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {device.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>{device.category}</div>
                        <div className="text-gray-500 dark:text-gray-400">{device.unit}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getRoomName(device.roomId || '')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(device.status)}`}>
                          {getStatusText(device.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <div>{device.purchaseYear || 'N/A'}</div>
                        <div className="text-gray-500 dark:text-gray-400">SL: {device.quantity}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-1">
                          <button 
                            onClick={() => setShowQRModal(device)}
                            className="bg-purple-600 text-white px-2 py-1 rounded text-xs hover:bg-purple-700"
                          >
                            📱
                          </button>
                          <button 
                            onClick={() => setViewingDevice(device)}
                            className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700"
                          >
                            👁️
                          </button>
                          <button 
                            onClick={() => handleEdit(device)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                          >
                            ✏️
                          </button>
                          <button 
                            onClick={() => handleDelete(device.id)}
                            className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredDevices.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔧</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {devices.length === 0 ? 'Chưa có thiết bị nào' : 'Không tìm thấy thiết bị phù hợp'}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {devices.length === 0 
                ? 'Thêm thiết bị đầu tiên của bạn' 
                : 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
              }
            </p>
            <button 
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              ➕ Thêm thiết bị
            </button>
          </div>
        )}

        {/* Modals */}
        <DeviceFormModal />
        <DeviceDetailModal />
        <QRCodeModal />
        <ImportModal />
      </div>
    </div>
  );

  // Modal Components
  function ImportModal() {
    if (!showImportModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            📤 Import thiết bị hàng loạt
          </h2>
          
          {!importProgress && !importFile && (
            <div>
              <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <h3 className="font-medium mb-2">📋 Hướng dẫn:</h3>
                <ul className="text-sm space-y-1 text-gray-700 dark:text-gray-300">
                  <li>• Chỉ hỗ trợ file CSV (.csv)</li>
                  <li>• Cột bắt buộc: code, name, category, unit</li>
                  <li>• Cột tùy chọn: purchaseYear, warrantyUntil, roomCode, status, quantity, image</li>
                  <li>• Trạng thái: good, maintenance, broken, repairing (hoặc tiếng Việt)</li>
                  <li>• Định dạng ngày: YYYY-MM-DD</li>
                </ul>
              </div>
              
              <div className="mb-4">
                <button
                  onClick={downloadSampleCSV}
                  className="mb-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  📥 Tải file mẫu CSV
                </button>
                
                <input
                  type="file"
                  accept=".csv,.xls,.xlsx"
                  onChange={handleImportFile}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                />
              </div>
            </div>
          )}
          
          {importFile && !importProgress && (
            <div className="mb-4">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg mb-4">
                <p className="font-medium">✅ File đã chọn:</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{importFile.name}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={processImport}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  🚀 Bắt đầu import
                </button>
                <button
                  onClick={() => setImportFile(null)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  🔄 Chọn lại file
                </button>
              </div>
            </div>
          )}
          
          {importProgress && (
            <div className="mb-4">
              <div className={`p-4 rounded-lg mb-4 ${
                importProgress.status === 'completed' ? 'bg-green-50 dark:bg-green-900' :
                importProgress.status === 'error' ? 'bg-red-50 dark:bg-red-900' :
                'bg-blue-50 dark:bg-blue-900'
              }`}>
                <p className="font-medium">
                  {importProgress.status === 'reading' && '📖 Đang đọc file...'}
                  {importProgress.status === 'processing' && '⚙️ Đang xử lý...'}
                  {importProgress.status === 'completed' && '✅ Hoàn thành!'}
                  {importProgress.status === 'error' && '❌ Lỗi!'}
                </p>
                <p className="text-sm mt-1">{importProgress.message}</p>
              </div>
              
              {importProgress.results && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-100 dark:bg-green-800 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-200">
                        {importProgress.results.success}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-200">Thành công</div>
                    </div>
                    <div className="p-3 bg-red-100 dark:bg-red-800 rounded-lg">
                      <div className="text-2xl font-bold text-red-600 dark:text-red-200">
                        {importProgress.results.failed}
                      </div>
                      <div className="text-sm text-red-600 dark:text-red-200">Thất bại</div>
                    </div>
                  </div>
                  
                  {importProgress.results.errors && importProgress.results.errors.length > 0 && (
                    <div className="max-h-40 overflow-y-auto">
                      <h4 className="font-medium mb-2 text-red-600 dark:text-red-400">🚫 Lỗi:</h4>
                      <ul className="text-sm space-y-1">
                        {importProgress.results.errors.map((error: string, i: number) => (
                          <li key={i} className="text-red-600 dark:text-red-400 text-xs font-mono">
                            {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {importProgress.status === 'completed' && (
                <button
                  onClick={resetImport}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  🔄 Import thêm
                </button>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-3">
            <button
              onClick={resetImport}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              {importProgress?.status === 'completed' ? 'Đóng' : 'Hủy'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
