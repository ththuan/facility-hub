'use client';

import { useState, useEffect } from "react";
import { supabaseService, WorkOrder, Room, Device } from "@/lib/supabaseService";
import { useAuth } from "@/contexts/AuthContext";

const getStatusColor = (status: WorkOrder['status']) => {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800';
    case 'in_progress': return 'bg-yellow-100 text-yellow-800';
    case 'done': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: WorkOrder['priority']) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800';
    case 'med': return 'bg-yellow-100 text-yellow-800';  
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: WorkOrder['status']) => {
  switch (status) {
    case 'open': return 'Mở';
    case 'in_progress': return 'Đang xử lý';
    case 'done': return 'Hoàn thành';
    default: return status;
  }
};

const getPriorityText = (priority: WorkOrder['priority']) => {
  switch (priority) {
    case 'high': return 'Cao';
    case 'med': return 'Trung bình';
    case 'low': return 'Thấp';
    default: return priority;
  }
};

export default function WorkOrdersPage() {
  const { isAdmin } = useAuth();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkOrder | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "open" as WorkOrder['status'],
    priority: "med" as WorkOrder['priority'],
    assignee: "",
    dueDate: "",
    roomId: "",
    deviceId: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [workOrdersData, roomsData, devicesData] = await Promise.all([
        supabaseService.getWorkOrders(),
        supabaseService.getRooms(),
        supabaseService.getDevices()
      ]);
      setWorkOrders(workOrdersData);
      setRooms(roomsData);
      setDevices(devicesData);
    } catch (error) {
      console.error('Error loading work orders data:', error);
    }
  };

  const filteredWorkOrders = workOrders.filter(wo => {
    const matchesSearch = wo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (wo.description && wo.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (wo.assignee && wo.assignee.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "" || wo.status === statusFilter;
    const matchesPriority = priorityFilter === "" || wo.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingWorkOrder) {
        await supabaseService.updateWorkOrder(editingWorkOrder.id, formData);
      } else {
        await supabaseService.createWorkOrder(formData);
      }
      
      await loadData();
      setShowAddForm(false);
      setEditingWorkOrder(null);
      resetForm();
    } catch (error) {
      console.error('Error saving work order:', error);
      alert('Có lỗi xảy ra khi lưu work order');
    }
  };

  const handleEdit = (workOrder: WorkOrder) => {
    setEditingWorkOrder(workOrder);
    setFormData({
      title: workOrder.title,
      description: workOrder.description || "",
      status: workOrder.status,
      priority: workOrder.priority,
      assignee: workOrder.assignee || "",
      dueDate: workOrder.dueDate || "",
      roomId: workOrder.roomId || "",
      deviceId: workOrder.deviceId || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa work order này?")) {
      try {
        await supabaseService.deleteWorkOrder(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting work order:', error);
        alert('Có lỗi xảy ra khi xóa work order');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      status: "open",
      priority: "med",
      assignee: "",
      dueDate: "",
      roomId: "",
      deviceId: "",
    });
    setEditingWorkOrder(null);
    setShowAddForm(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRoomName = (roomId?: string) => {
    if (!roomId) return '-';
    const room = rooms.find(r => r.id === roomId);
    return room ? room.name : '-';
  };

  const getDeviceName = (deviceId?: string) => {
    if (!deviceId) return '-';
    const device = devices.find(d => d.id === deviceId);
    return device ? device.name : '-';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Work Orders</h1>
          {isAdmin() && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Thêm Work Order
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Đang mở</h3>
            <p className="text-3xl font-bold text-blue-600">
              {workOrders.filter(w => w.status === 'open').length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Đang xử lý</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {workOrders.filter(w => w.status === 'in_progress').length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hoàn thành</h3>
            <p className="text-3xl font-bold text-green-600">
              {workOrders.filter(w => w.status === 'done').length}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Tìm kiếm work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="open">Đang mở</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="done">Hoàn thành</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tất cả độ ưu tiên</option>
              <option value="high">Cao</option>
              <option value="med">Trung bình</option>
              <option value="low">Thấp</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPriorityFilter("");
              }}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Work Orders List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Độ ưu tiên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phòng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Thiết bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Phụ trách
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hạn cuối
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredWorkOrders.map((workOrder) => (
                  <tr key={workOrder.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {workOrder.title}
                        </h3>
                        {workOrder.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {workOrder.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(workOrder.status)}`}>
                        {getStatusText(workOrder.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(workOrder.priority)}`}>
                        {getPriorityText(workOrder.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {getRoomName(workOrder.roomId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {getDeviceName(workOrder.deviceId)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {workOrder.assignee || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {workOrder.dueDate ? formatDate(workOrder.dueDate) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      {isAdmin() && (
                        <>
                          <button
                            onClick={() => handleEdit(workOrder)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(workOrder.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWorkOrders.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Không có work order nào</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingWorkOrder ? 'Sửa Work Order' : 'Thêm Work Order Mới'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tiêu đề *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as WorkOrder['status']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="open">Đang mở</option>
                      <option value="in_progress">Đang xử lý</option>
                      <option value="done">Hoàn thành</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ ưu tiên
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as WorkOrder['priority']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Thấp</option>
                      <option value="med">Trung bình</option>
                      <option value="high">Cao</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phòng
                    </label>
                    <select
                      value={formData.roomId}
                      onChange={(e) => setFormData({...formData, roomId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Chọn phòng</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Thiết bị
                    </label>
                    <select
                      value={formData.deviceId}
                      onChange={(e) => setFormData({...formData, deviceId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Chọn thiết bị</option>
                      {devices.map(device => (
                        <option key={device.id} value={device.id}>{device.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Người phụ trách
                  </label>
                  <input
                    type="text"
                    value={formData.assignee}
                    onChange={(e) => setFormData({...formData, assignee: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hạn cuối
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingWorkOrder ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
