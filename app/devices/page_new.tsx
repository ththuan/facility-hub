'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { deviceService, roomService, Device, Room } from "@/lib/deviceService";

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [viewingDevice, setViewingDevice] = useState<Device | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state - Updated for Supabase schema
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    image: "",
    purchase_year: new Date().getFullYear(),
    warranty_until: "",
    room_id: "",
    status: "Tốt" as Device['status'],
    quantity: 1,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [devicesData, roomsData] = await Promise.all([
        deviceService.getAllDevices(),
        roomService.getAllRooms()
      ]);
      setDevices(devicesData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "" || device.status === statusFilter;
    const matchesCategory = categoryFilter === "" || device.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(devices.map(d => d.category)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      if (editingDevice) {
        const updatedDevice = await deviceService.updateDevice(editingDevice.id, formData);
        if (updatedDevice) {
          await loadData();
          resetForm();
        }
      } else {
        const newDevice = await deviceService.createDevice(formData);
        if (newDevice) {
          await loadData();
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error saving device:', error);
      alert('Có lỗi xảy ra khi lưu thiết bị');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (device: Device) => {
    setEditingDevice(device);
    setFormData({
      name: device.name,
      category: device.category,
      unit: device.unit,
      image: device.image || "",
      purchase_year: device.purchase_year || new Date().getFullYear(),
      warranty_until: device.warranty_until || "",
      room_id: device.room_id || "",
      status: device.status,
      quantity: device.quantity,
    });
    setImagePreview(device.image || "");
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thiết bị này?")) {
      const success = await deviceService.deleteDevice(id);
      if (success) {
        await loadData();
      } else {
        alert('Có lỗi xảy ra khi xóa thiết bị');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      unit: "",
      image: "",
      purchase_year: new Date().getFullYear(),
      warranty_until: "",
      room_id: "",
      status: "Tốt",
      quantity: 1,
    });
    setEditingDevice(null);
    setImagePreview("");
    setShowAddForm(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For preview, convert to base64
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleView = (device: Device) => {
    setViewingDevice(device);
  };

  const getRoomName = (roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    return room ? `${room.name} (${room.code})` : "Chưa gán phòng";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quản lý Thiết bị</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Thêm thiết bị
        </button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm thiết bị..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Tốt">Tốt</option>
          <option value="Đang bảo trì">Đang bảo trì</option>
          <option value="Hư">Hư</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Device List */}
      <div className="grid gap-4">
        {filteredDevices.map((device) => (
          <div key={device.id} className="p-6 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-all">
            <div className="flex justify-between items-start">
              <div className="flex space-x-4 flex-1">
                {/* Hình ảnh thiết bị */}
                <div className="w-24 h-24 flex-shrink-0">
                  {device.image ? (
                    <img 
                      src={device.image} 
                      alt={device.name}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-400 text-xs text-center">Không có<br/>hình ảnh</span>
                    </div>
                  )}
                </div>
                
                {/* Thông tin thiết bị */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{device.name}</h3>
                  <p className="text-gray-600 mt-1">Mã: {device.code}</p>
                  <p className="text-gray-600">Danh mục: {device.category}</p>
                  <p className="text-gray-600">Phòng: {getRoomName(device.room_id || "")}</p>
                  {device.warranty_until && (
                    <p className="text-gray-600">Bảo hành đến: {device.warranty_until}</p>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-2">
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  device.status === 'Tốt' ? 'bg-green-100 text-green-800' :
                  device.status === 'Đang bảo trì' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {device.status}
                </span>
                <p className="text-gray-600">SL: {device.quantity}</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleView(device)}
                    className="px-3 py-1 bg-green-100 text-green-600 rounded-md hover:bg-green-200 text-sm"
                  >
                    Xem
                  </button>
                  <button
                    onClick={() => handleEdit(device)}
                    className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 text-sm"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(device.id)}
                    className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200 text-sm"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDevices.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter || categoryFilter ? 'Không tìm thấy thiết bị phù hợp' : 'Chưa có thiết bị nào'}
          </p>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">
              {editingDevice ? 'Sửa thiết bị' : 'Thêm thiết bị mới'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mã thiết bị sẽ được tạo tự động từ tên"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hình ảnh</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {imagePreview && (
                  <div className="mt-2">
                    <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({...formData, unit: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm mua</label>
                  <input
                    type="number"
                    value={formData.purchase_year}
                    onChange={(e) => setFormData({...formData, purchase_year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành đến</label>
                  <input
                    type="date"
                    value={formData.warranty_until}
                    onChange={(e) => setFormData({...formData, warranty_until: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
                  <select
                    value={formData.room_id}
                    onChange={(e) => setFormData({...formData, room_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Chọn phòng</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>
                        {room.name} ({room.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as Device['status']})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Tốt">Tốt</option>
                    <option value="Đang bảo trì">Đang bảo trì</option>
                    <option value="Hư">Hư</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
                  disabled={uploading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                  disabled={uploading}
                >
                  {uploading ? 'Đang lưu...' : (editingDevice ? 'Cập nhật' : 'Thêm mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal xem chi tiết thiết bị */}
      {viewingDevice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl max-w-2xl w-full mx-4 max-h-90vh overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Chi tiết thiết bị
              </h2>
              <button
                onClick={() => setViewingDevice(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Hình ảnh */}
              {viewingDevice.image && (
                <div className="text-center">
                  <img 
                    src={viewingDevice.image} 
                    alt={viewingDevice.name}
                    className="w-64 h-64 object-cover rounded-lg mx-auto"
                  />
                </div>
              )}
              
              {/* Thông tin chi tiết */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã thiết bị</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{viewingDevice.code}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên thiết bị</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{viewingDevice.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Danh mục</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{viewingDevice.category}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{viewingDevice.unit}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{viewingDevice.quantity}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                  <span className={`inline-block px-3 py-2 rounded-full text-sm font-medium ${
                    viewingDevice.status === 'Tốt' ? 'bg-green-100 text-green-800' :
                    viewingDevice.status === 'Đang bảo trì' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {viewingDevice.status}
                  </span>
                </div>
                
                {viewingDevice.purchase_year && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Năm mua</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{viewingDevice.purchase_year}</p>
                  </div>
                )}
                
                {viewingDevice.warranty_until && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bảo hành đến</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{viewingDevice.warranty_until}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phòng</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{getRoomName(viewingDevice.room_id || "")}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                    {new Date(viewingDevice.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setViewingDevice(null);
                    handleEdit(viewingDevice);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setViewingDevice(null)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
