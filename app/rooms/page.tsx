'use client';

import { useState, useEffect } from "react";
import { getRoomService } from '../../lib/serviceFactory';
import type { Room } from '../../lib/serviceFactory';
import { useAuth } from "@/contexts/AuthContext";

const RoomService = getRoomService();

export default function RoomsPage() {
  const { isAdmin } = useAuth();
  
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    type: '',
    building: '',
    search: ''
  });
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    area: 0,
    capacity: 0,
    type: 'Phòng học',
    floor: '',
    building: '',
    description: '',
    status: 'Hoạt động' as 'Hoạt động' | 'Bảo trì' | 'Tạm dừng',
    department: '',
    equipment: '',
    note: ''
  });

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RoomService.getRooms();
      setRooms(data);
      console.log('🏢 Loaded rooms:', data.length, data);
      
      // If no rooms, create sample data
      if (data.length === 0) {
        console.log('📝 No rooms found, creating sample data...');
        await createSampleRooms();
      }
      
    } catch (err) {
      console.error('Error loading rooms:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Create sample rooms for testing
  const createSampleRooms = async () => {
    const sampleRooms = [
      { code: 'P101', name: 'Phòng học 101', type: 'Phòng học', building: 'Nhà A', floor: 'Tầng 1', capacity: 40, area: 60, status: 'Hoạt động' as const },
      { code: 'P102', name: 'Phòng học 102', type: 'Phòng học', building: 'Nhà A', floor: 'Tầng 1', capacity: 45, area: 65, status: 'Hoạt động' as const },
      { code: 'P201', name: 'Phòng học 201', type: 'Phòng học', building: 'Nhà A', floor: 'Tầng 2', capacity: 50, area: 70, status: 'Hoạt động' as const },
      { code: 'LAB01', name: 'Phòng thí nghiệm 1', type: 'Phòng thí nghiệm', building: 'Nhà B', floor: 'Tầng 1', capacity: 30, area: 80, status: 'Hoạt động' as const },
      { code: 'HT01', name: 'Hội trường lớn', type: 'Hội trường', building: 'Nhà C', floor: 'Tầng 1', capacity: 200, area: 300, status: 'Hoạt động' as const },
    ];

    try {
      for (const room of sampleRooms) {
        await RoomService.createRoom(room);
      }
      console.log('✅ Sample rooms created');
      // Reload rooms after creating samples
      const data = await RoomService.getRooms();
      setRooms(data);
    } catch (error) {
      console.error('❌ Error creating sample rooms:', error);
    }
  };

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = filter.search === '' || 
      room.name.toLowerCase().includes(filter.search.toLowerCase()) ||
      room.code.toLowerCase().includes(filter.search.toLowerCase()) ||
      (room.building && room.building.toLowerCase().includes(filter.search.toLowerCase()));
    
    const matchesStatus = filter.status === '' || room.status === filter.status;
    const matchesType = filter.type === '' || room.type === filter.type;
    const matchesBuilding = filter.building === '' || 
      (room.building && room.building.toLowerCase().includes(filter.building.toLowerCase()));

    return matchesSearch && matchesStatus && matchesType && matchesBuilding;
  });

  // Calculate statistics
  const stats = {
    total: rooms.length,
    active: rooms.filter(r => r.status === 'Hoạt động').length,
    maintenance: rooms.filter(r => r.status === 'Bảo trì').length,
    inactive: rooms.filter(r => r.status === 'Tạm dừng').length,
    totalCapacity: rooms.reduce((sum, r) => sum + (r.capacity || 0), 0),
    totalArea: rooms.reduce((sum, r) => sum + (r.area || 0), 0),
    byType: rooms.reduce((acc, room) => {
      if (room.type) {
        acc[room.type] = (acc[room.type] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      area: 0,
      capacity: 0,
      type: 'Phòng học',
      floor: '',
      building: '',
      description: '',
      status: 'Hoạt động',
      department: '',
      equipment: '',
      note: ''
    });
    setEditingRoom(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRoom) {
        await RoomService.updateRoom(editingRoom.id!, formData);
      } else {
        await RoomService.createRoom(formData);
      }
      await loadRooms();
      resetForm();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu');
    }
  };

  const handleEdit = (room: Room) => {
    setFormData({
      code: room.code,
      name: room.name,
      area: room.area || 0,
      capacity: room.capacity || 0,
      type: room.type || 'Phòng học',
      floor: room.floor || '',
      building: room.building || '',
      description: room.description || '',
      status: room.status,
      department: room.department || '',
      equipment: room.equipment || '',
      note: room.note || ''
    });
    setEditingRoom(room);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      try {
        await RoomService.deleteRoom(id);
        await loadRooms();
      } catch (error) {
        console.error('Error deleting room:', error);
        alert('Có lỗi xảy ra khi xóa dữ liệu');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải dữ liệu phòng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Quản lý Phòng, Khoa, Lớp học</h1>
        {isAdmin() && (
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            + Thêm Phòng mới
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-200 px-4 py-3 rounded">
          <strong className="font-bold">Lỗi: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Tổng phòng</h3>
          <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">Toàn bộ cơ sở</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Đang hoạt động</h3>
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-400 mt-1">Sẵn sàng sử dụng</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Bảo trì</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
          <p className="text-xs text-gray-400 mt-1">Cần sửa chữa</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sức chứa</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.totalCapacity.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Tổng số người</p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Diện tích</h3>
          <p className="text-2xl font-bold text-orange-600">{stats.totalArea.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">m² tổng cộng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, mã, tòa nhà..."
            value={filter.search}
            onChange={(e) => setFilter({...filter, search: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
          
          <select
            value={filter.status}
            onChange={(e) => setFilter({...filter, status: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Hoạt động">Hoạt động</option>
            <option value="Bảo trì">Bảo trì</option>
            <option value="Tạm dừng">Tạm dừng</option>
          </select>

          <select
            value={filter.type}
            onChange={(e) => setFilter({...filter, type: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tất cả loại</option>
            <option value="Phòng học">Phòng học</option>
            <option value="Phòng thực hành công nghệ thông tin">Phòng thực hành công nghệ thông tin</option>
            <option value="Phòng thí nghiệm">Phòng thí nghiệm</option>
            <option value="Hội trường">Hội trường</option>
            <option value="Văn phòng">Văn phòng</option>
          </select>

          <input
            type="text"
            placeholder="Tòa nhà"
            value={filter.building}
            onChange={(e) => setFilter({...filter, building: e.target.value})}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />

          <button
            onClick={() => setFilter({status: '', type: '', building: '', search: ''})}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Xóa bộ lọc
          </button>
        </div>
      </div>

      {/* Rooms List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
            Danh sách Phòng ({filteredRooms.length})
          </h2>
          
          {filteredRooms.length === 0 && !error ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không tìm thấy phòng nào</p>
              <p className="text-gray-400 text-sm mt-2">Thử thay đổi bộ lọc hoặc thêm phòng mới</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRooms.map(room => (
                <div key={room.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{room.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Mã: {room.code}</p>
                      {room.department && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">{room.department}</p>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      room.status === 'Hoạt động' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                      room.status === 'Bảo trì' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
                      'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {room.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex justify-between">
                      <span>Loại:</span>
                      <span className="font-medium">{room.type || 'Chưa xác định'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Diện tích:</span>
                      <span className="font-medium">{room.area ? `${room.area} m²` : 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sức chứa:</span>
                      <span className="font-medium">{room.capacity ? `${room.capacity} người` : 'N/A'}</span>
                    </div>
                    {room.building && (
                      <div className="flex justify-between">
                        <span>Tòa nhà:</span>
                        <span className="font-medium">{room.building}</span>
                      </div>
                    )}
                    {room.floor && (
                      <div className="flex justify-between">
                        <span>Tầng:</span>
                        <span className="font-medium">Tầng {room.floor}</span>
                      </div>
                    )}
                  </div>

                  {room.equipment && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Thiết bị:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{room.equipment}</p>
                    </div>
                  )}

                  {room.note && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Ghi chú:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{room.note}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100 dark:border-gray-600">
                    {isAdmin() && (
                      <>
                        <button
                          onClick={() => handleEdit(room)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(room.id!)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 text-sm font-medium"
                        >
                          Xóa
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {editingRoom ? 'Chỉnh sửa' : 'Thêm mới'} Phòng
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mã phòng *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="A101, LAB201..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tên phòng *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tên đầy đủ của phòng"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Loại phòng *
                  </label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Phòng học">Phòng học</option>
                    <option value="Phòng thực hành công nghệ thông tin">Phòng thực hành công nghệ thông tin</option>
                    <option value="Phòng thí nghiệm">Phòng thí nghiệm</option>
                    <option value="Hội trường">Hội trường</option>
                    <option value="Văn phòng">Văn phòng</option>
                    <option value="Thư viện">Thư viện</option>
                    <option value="Phòng họp">Phòng họp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Hoạt động">Hoạt động</option>
                    <option value="Bảo trì">Bảo trì</option>
                    <option value="Tạm dừng">Tạm dừng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Diện tích (m²)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.area || ''}
                    onChange={(e) => setFormData({...formData, area: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sức chứa (người)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.capacity || ''}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tòa nhà
                  </label>
                  <input
                    type="text"
                    value={formData.building}
                    onChange={(e) => setFormData({...formData, building: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Tòa A, Tòa B..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tầng
                  </label>
                  <input
                    type="text"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="1, 2, 3..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Khoa/Bộ phận
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Khoa Công nghệ Thông tin..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Thiết bị
                  </label>
                  <input
                    type="text"
                    value={formData.equipment}
                    onChange={(e) => setFormData({...formData, equipment: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Máy chiếu, bảng thông minh, điều hòa..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Mô tả chi tiết về phòng..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Ghi chú
                </label>
                <textarea
                  rows={2}
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Ghi chú bổ sung..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingRoom ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
