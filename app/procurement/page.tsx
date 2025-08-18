'use client';

import { useState, useEffect } from 'react';
import { supabaseService, ProcurementItem, Device } from '@/lib/supabaseService';

const getStatusColor = (status: ProcurementItem['status']) => {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-800';
    case 'requested': return 'bg-blue-100 text-blue-800';
    case 'approved': return 'bg-green-100 text-green-800';
    case 'rejected': return 'bg-red-100 text-red-800';
    case 'purchased': return 'bg-purple-100 text-purple-800';
    case 'completed': return 'bg-emerald-100 text-emerald-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: ProcurementItem['priority']) => {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: ProcurementItem['status']) => {
  switch (status) {
    case 'draft': return 'Nháp';
    case 'requested': return 'Đã yêu cầu';
    case 'approved': return 'Đã duyệt';
    case 'rejected': return 'Từ chối';
    case 'purchased': return 'Đã mua';
    case 'completed': return 'Hoàn thành';
    default: return status;
  }
};

const getPriorityText = (priority: ProcurementItem['priority']) => {
  switch (priority) {
    case 'urgent': return 'Khẩn cấp';
    case 'high': return 'Cao';
    case 'medium': return 'Trung bình';
    case 'low': return 'Thấp';
    default: return priority;
  }
};

export default function ProcurementPage() {
  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConvertForm, setShowConvertForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcurementItem | null>(null);
  const [convertingItem, setConvertingItem] = useState<ProcurementItem | null>(null);
  const [rooms, setRooms] = useState<any[]>([]);
  
  // Filter states
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    department: '',
    budgetYear: new Date().getFullYear().toString()
  });

  // Form state
  const [formData, setFormData] = useState({
    itemName: '',
    category: 'tools-equipment' as ProcurementItem['category'],
    image: '',
    departmentRequestDate: '',
    departmentBudgetDate: '',
    requestedValue: 0,
    selectionMethod: 'quotation' as ProcurementItem['selectionMethod'],
    actualPaymentValue: 0,
    notes: '',
    status: 'draft' as ProcurementItem['status'],
    priority: 'medium' as ProcurementItem['priority'],
    department: '',
    requestedBy: '',
    approvedBy: '',
    purchaseDate: '',
    warrantyPeriod: 12,
    supplier: '',
    specifications: '',
    quantity: 1,
    unit: 'chiếc',
    budgetYear: new Date().getFullYear(),
  });

  // Convert form state
  const [convertData, setConvertData] = useState({
    roomId: '',
    deviceCode: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [itemsData, roomsData] = await Promise.all([
        supabaseService.getProcurementItems(),
        supabaseService.getRooms()
      ]);
      setItems(itemsData);
      setRooms(roomsData);
    } catch (error) {
      console.error('Error loading procurement data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesStatus = filter.status === '' || item.status === filter.status;
    const matchesCategory = filter.category === '' || item.category === filter.category;
    const matchesDepartment = filter.department === '' || item.department.includes(filter.department);
    const matchesBudgetYear = filter.budgetYear === '' || item.budgetYear.toString() === filter.budgetYear;
    return matchesStatus && matchesCategory && matchesDepartment && matchesBudgetYear;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingItem) {
        await supabaseService.updateProcurementItem(editingItem.id, formData);
      } else {
        await supabaseService.createProcurementItem(formData);
      }
      
      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error saving procurement item:', error);
      alert('Có lỗi xảy ra khi lưu yêu cầu mua sắm');
    }
  };

  const handleEdit = (item: ProcurementItem) => {
    setEditingItem(item);
    setFormData({
      itemName: item.itemName,
      category: item.category,
      image: item.image || '',
      departmentRequestDate: item.departmentRequestDate,
      departmentBudgetDate: item.departmentBudgetDate,
      requestedValue: item.requestedValue,
      selectionMethod: item.selectionMethod,
      actualPaymentValue: item.actualPaymentValue || 0,
      notes: item.notes || '',
      status: item.status,
      priority: item.priority,
      department: item.department,
      requestedBy: item.requestedBy,
      approvedBy: item.approvedBy || '',
      purchaseDate: item.purchaseDate || '',
      warrantyPeriod: item.warrantyPeriod || 12,
      supplier: item.supplier || '',
      specifications: item.specifications || '',
      quantity: item.quantity,
      unit: item.unit,
      budgetYear: item.budgetYear,
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa yêu cầu này?")) {
      try {
        await supabaseService.deleteProcurementItem(id);
        await loadData();
      } catch (error) {
        console.error('Error deleting procurement item:', error);
        alert('Có lỗi xảy ra khi xóa yêu cầu');
      }
    }
  };

  const handleConvertToDevice = (item: ProcurementItem) => {
    setConvertingItem(item);
    setConvertData({
      roomId: '',
      deviceCode: `DEV-${Date.now()}`
    });
    setShowConvertForm(true);
  };

  const handleConvertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!convertingItem) return;

    try {
      const device = await supabaseService.convertProcurementToDevice(
        convertingItem.id, 
        convertData
      );
      
      if (device) {
        alert(`Đã chuyển đổi thành thiết bị: ${device.name}`);
        await loadData();
        setShowConvertForm(false);
        setConvertingItem(null);
      } else {
        alert('Có lỗi xảy ra khi chuyển đổi');
      }
    } catch (error) {
      console.error('Error converting to device:', error);
      alert('Có lỗi xảy ra khi chuyển đổi');
    }
  };

  const resetForm = () => {
    setFormData({
      itemName: '',
      category: 'tools-equipment',
      image: '',
      departmentRequestDate: '',
      departmentBudgetDate: '',
      requestedValue: 0,
      selectionMethod: 'quotation',
      actualPaymentValue: 0,
      notes: '',
      status: 'draft',
      priority: 'medium',
      department: '',
      requestedBy: '',
      approvedBy: '',
      purchaseDate: '',
      warrantyPeriod: 12,
      supplier: '',
      specifications: '',
      quantity: 1,
      unit: 'chiếc',
      budgetYear: new Date().getFullYear(),
    });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Calculate statistics
  const stats = {
    total: items.length,
    draft: items.filter(i => i.status === 'draft').length,
    requested: items.filter(i => i.status === 'requested').length,
    approved: items.filter(i => i.status === 'approved').length,
    purchased: items.filter(i => i.status === 'purchased').length,
    completed: items.filter(i => i.status === 'completed').length,
    totalValue: items.reduce((sum, item) => sum + item.requestedValue, 0),
    purchasedValue: items.filter(i => i.actualPaymentValue).reduce((sum, item) => sum + (item.actualPaymentValue || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Quản lý Mua sắm Hàng năm</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Thêm Yêu cầu Mua sắm
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tổng yêu cầu</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Giá trị: {formatCurrency(stats.totalValue)}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Đã duyệt</h3>
            <p className="text-3xl font-bold text-green-600">{stats.approved}</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Đã mua</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.purchased}</p>
            <p className="text-sm text-gray-600">Giá trị: {formatCurrency(stats.purchasedValue)}</p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hoàn thành</h3>
            <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <select
              value={filter.status}
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Nháp</option>
              <option value="requested">Đã yêu cầu</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Từ chối</option>
              <option value="purchased">Đã mua</option>
              <option value="completed">Hoàn thành</option>
            </select>

            <select
              value={filter.category}
              onChange={(e) => setFilter({...filter, category: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tất cả loại</option>
              <option value="fixed-assets">Tài sản cố định</option>
              <option value="tools-equipment">Dụng cụ thiết bị</option>
            </select>

            <input
              type="text"
              placeholder="Bộ phận..."
              value={filter.department}
              onChange={(e) => setFilter({...filter, department: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />

            <select
              value={filter.budgetYear}
              onChange={(e) => setFilter({...filter, budgetYear: e.target.value})}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Tất cả năm</option>
              {Array.from({length: 5}, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>

            <button
              onClick={() => setFilter({ status: '', category: '', department: '', budgetYear: new Date().getFullYear().toString() })}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tên thiết bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Độ ưu tiên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Bộ phận
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Giá trị yêu cầu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Năm ngân sách
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.itemName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {item.category === 'fixed-assets' ? 'Tài sản cố định' : 'Dụng cụ thiết bị'} - {item.quantity} {item.unit}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(item.priority)}`}>
                        {getPriorityText(item.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div>
                        <p>{item.department}</p>
                        <p className="text-xs text-gray-600">Yêu cầu: {item.requestedBy}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <div>
                        <p className="font-medium">{formatCurrency(item.requestedValue)}</p>
                        {item.actualPaymentValue && (
                          <p className="text-xs text-green-600">Thực tế: {formatCurrency(item.actualPaymentValue)}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {item.budgetYear}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-900 block"
                      >
                        Sửa
                      </button>
                      {item.status === 'purchased' && (
                        <button
                          onClick={() => handleConvertToDevice(item)}
                          className="text-green-600 hover:text-green-900 block"
                        >
                          Chuyển thành thiết bị
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900 block"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">Không có yêu cầu mua sắm nào</p>
            </div>
          )}
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {editingItem ? 'Sửa Yêu cầu Mua sắm' : 'Thêm Yêu cầu Mua sắm Mới'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tên thiết bị *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.itemName}
                      onChange={(e) => setFormData({...formData, itemName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Loại *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value as ProcurementItem['category']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="tools-equipment">Dụng cụ thiết bị</option>
                      <option value="fixed-assets">Tài sản cố định</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bộ phận *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Người yêu cầu *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.requestedBy}
                      onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày yêu cầu *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.departmentRequestDate}
                      onChange={(e) => setFormData({...formData, departmentRequestDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ngày ngân sách *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.departmentBudgetDate}
                      onChange={(e) => setFormData({...formData, departmentBudgetDate: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Số lượng *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Đơn vị
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({...formData, unit: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Giá trị yêu cầu *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.requestedValue}
                      onChange={(e) => setFormData({...formData, requestedValue: parseFloat(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Năm ngân sách *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.budgetYear}
                      onChange={(e) => setFormData({...formData, budgetYear: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Độ ưu tiên
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value as ProcurementItem['priority']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="low">Thấp</option>
                      <option value="medium">Trung bình</option>
                      <option value="high">Cao</option>
                      <option value="urgent">Khẩn cấp</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trạng thái
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as ProcurementItem['status']})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="draft">Nháp</option>
                      <option value="requested">Đã yêu cầu</option>
                      <option value="approved">Đã duyệt</option>
                      <option value="rejected">Từ chối</option>
                      <option value="purchased">Đã mua</option>
                      <option value="completed">Hoàn thành</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Đặc tả kỹ thuật
                  </label>
                  <textarea
                    value={formData.specifications}
                    onChange={(e) => setFormData({...formData, specifications: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Ghi chú
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows={2}
                  />
                </div>

                {(formData.status === 'purchased' || formData.status === 'completed') && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Giá trị thực tế
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.actualPaymentValue}
                        onChange={(e) => setFormData({...formData, actualPaymentValue: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Ngày mua
                      </label>
                      <input
                        type="date"
                        value={formData.purchaseDate}
                        onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nhà cung cấp
                      </label>
                      <input
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                )}

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
                    {editingItem ? 'Cập nhật' : 'Thêm'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Convert to Device Modal */}
        {showConvertForm && convertingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                Chuyển đổi thành Thiết bị
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Chuyển đổi "{convertingItem.itemName}" thành thiết bị để quản lý
              </p>

              <form onSubmit={handleConvertSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mã thiết bị
                  </label>
                  <input
                    type="text"
                    value={convertData.deviceCode}
                    onChange={(e) => setConvertData({...convertData, deviceCode: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phòng đặt thiết bị
                  </label>
                  <select
                    value={convertData.roomId}
                    onChange={(e) => setConvertData({...convertData, roomId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Chọn phòng</option>
                    {rooms.map(room => (
                      <option key={room.id} value={room.id}>{room.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {setShowConvertForm(false); setConvertingItem(null);}}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Chuyển đổi
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
