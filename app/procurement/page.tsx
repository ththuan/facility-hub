'use client';

import { useState, useEffect } from 'react';
import { getProcurementService } from '../../lib/serviceFactory';
import type { ProcurementItem } from '../../lib/serviceFactory';

const ProcurementService = getProcurementService();

export default function ProcurementPage() {
  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcurementItem | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    category: '',
    department: '',
    budgetYear: new Date().getFullYear().toString()
  });
  const [statistics, setStatistics] = useState<any>(null);
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'tools-equipment' as 'fixed-assets' | 'tools-equipment',
    image: '',
    department_request_date: '',
    department_budget_date: '',
    requested_value: 0,
    selection_method: 'quotation' as 'tender' | 'quotation' | 'direct' | 'emergency',
    actual_payment_value: 0,
    notes: '',
    status: 'draft' as 'draft' | 'requested' | 'approved' | 'rejected' | 'purchased' | 'completed',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    department: '',
    requested_by: '',
    approved_by: '',
    purchase_date: '',
    warranty_period: 12,
    supplier: '',
    specifications: '',
    quantity: 1,
    unit: 'chiếc',
    budget_year: new Date().getFullYear(),
  });

  useEffect(() => {
    loadItems();
    loadStatistics();
  }, []);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await ProcurementService.getAllItems();
      setItems(data);
    } catch (error) {
      console.error('Error loading items:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await ProcurementService.getStatistics();
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu mua sắm...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Tính toán thống kê chi tiết
  const calculateDetailedStats = () => {
    const totalValue = items.reduce((sum, item) => sum + (item.requested_value || 0), 0);
    const purchasedValue = items
      .filter(item => item.status === 'purchased' || item.status === 'completed')
      .reduce((sum, item) => sum + (item.actual_payment_value || item.requested_value || 0), 0);
    
    const byCategory = items.reduce((acc, item) => {
      const category = item.category === 'fixed-assets' ? 'Tài sản cố định' : 'Công cụ & Thiết bị';
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0, purchased: 0 };
      }
      acc[category].count++;
      acc[category].value += item.requested_value || 0;
      if (item.status === 'purchased' || item.status === 'completed') {
        acc[category].purchased += item.actual_payment_value || item.requested_value || 0;
      }
      return acc;
    }, {} as Record<string, any>);

    const byStatus = items.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: items.length,
      totalValue,
      purchasedValue,
      savings: totalValue - purchasedValue,
      byCategory,
      byStatus,
      completionRate: items.length > 0 ? ((byStatus.completed || 0) / items.length * 100).toFixed(1) : '0'
    };
  };

  // Export functions
  const exportSummaryReport = () => {
    const stats = calculateDetailedStats();
    const data = [
      ['Báo cáo Tóm tắt Mua sắm', `Năm ${new Date().getFullYear()}`],
      [],
      ['Thống kê Tổng quan'],
      ['Tổng yêu cầu', items.length],
      ['Giá trị yêu cầu (VND)', stats.totalValue.toLocaleString()],
      ['Đã thanh toán (VND)', stats.purchasedValue.toLocaleString()],
      ['Tiết kiệm (VND)', stats.savings.toLocaleString()],
      ['Tỷ lệ hoàn thành (%)', stats.completionRate],
      [],
      ['Thống kê Theo danh mục'],
      ['Danh mục', 'Số lượng', 'Giá trị yêu cầu (VND)', 'Đã thanh toán (VND)'],
      ...Object.entries(stats.byCategory).map(([category, data]: [string, any]) => [
        category, data.count, data.value.toLocaleString(), data.purchased.toLocaleString()
      ]),
      [],
      ['Thống kê Theo trạng thái'],
      ['Trạng thái', 'Số lượng'],
      ...Object.entries(stats.byStatus).map(([status, count]) => [
        getStatusText(status), count
      ])
    ];

    downloadCSV(data, `bao-cao-tom-tat-mua-sam-${new Date().getFullYear()}.csv`);
  };

  const exportDetailedReport = () => {
    const data = [
      [
        'STT', 'Tên thiết bị', 'Danh mục', 'Bộ phận', 'Người yêu cầu',
        'Số lượng', 'Đơn vị', 'Giá trị yêu cầu (VND)', 'Giá trị thực tế (VND)',
        'Trạng thái', 'Độ ưu tiên', 'Ngày yêu cầu', 'Ngày mua', 'Nhà cung cấp', 'Ghi chú'
      ],
      ...items.map((item, index) => [
        index + 1,
        item.item_name,
        item.category === 'fixed-assets' ? 'Tài sản cố định' : 'Công cụ & Thiết bị',
        item.department,
        item.requested_by,
        item.quantity,
        item.unit,
        (item.requested_value || 0).toLocaleString(),
        (item.actual_payment_value || 0).toLocaleString(),
        getStatusText(item.status),
        getPriorityText(item.priority),
        item.department_request_date || '',
        item.purchase_date || '',
        item.supplier || '',
        item.notes || ''
      ])
    ];

    downloadCSV(data, `bao-cao-chi-tiet-mua-sam-${new Date().getFullYear()}.csv`);
  };

  const downloadCSV = (data: any[][], filename: string) => {
    const csvContent = data.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'draft': 'Nháp',
      'requested': 'Đã yêu cầu',
      'approved': 'Đã duyệt',
      'purchased': 'Đã mua',
      'completed': 'Hoàn thành',
      'rejected': 'Từ chối'
    };
    return statusMap[status] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityMap: Record<string, string> = {
      'low': 'Thấp',
      'medium': 'Trung bình', 
      'high': 'Cao',
      'urgent': 'Khẩn cấp'
    };
    return priorityMap[priority] || priority;
  };

  const resetForm = () => {
    setFormData({
      item_name: '',
      category: 'tools-equipment',
      image: '',
      department_request_date: '',
      department_budget_date: '',
      requested_value: 0,
      selection_method: 'quotation',
      actual_payment_value: 0,
      notes: '',
      status: 'draft',
      priority: 'medium',
      department: '',
      requested_by: '',
      approved_by: '',
      purchase_date: '',
      warranty_period: 12,
      supplier: '',
      specifications: '',
      quantity: 1,
      unit: 'chiếc',
      budget_year: new Date().getFullYear(),
    });
    setEditingItem(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await ProcurementService.updateItem(editingItem.id!, formData);
      } else {
        await ProcurementService.createItem(formData);
      }
      await loadItems();
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
      alert('Có lỗi xảy ra khi lưu dữ liệu');
    }
  };

  const handleEdit = (item: ProcurementItem) => {
    setFormData({
      item_name: item.item_name,
      category: item.category,
      image: item.image || '',
      department_request_date: item.department_request_date,
      department_budget_date: item.department_budget_date,
      requested_value: item.requested_value,
      selection_method: item.selection_method,
      actual_payment_value: item.actual_payment_value || 0,
      notes: item.notes || '',
      status: item.status,
      priority: item.priority,
      department: item.department,
      requested_by: item.requested_by,
      approved_by: item.approved_by || '',
      purchase_date: item.purchase_date || '',
      warranty_period: item.warranty_period || 12,
      supplier: item.supplier || '',
      specifications: item.specifications || '',
      quantity: item.quantity,
      unit: item.unit,
      budget_year: item.budget_year,
    });
    setEditingItem(item);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
      try {
        await ProcurementService.deleteItem(id);
        await loadItems();
      } catch (error) {
        console.error('Error deleting item:', error);
        alert('Có lỗi xảy ra khi xóa dữ liệu');
      }
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Mua sắm Hàng năm</h1>
        <div className="flex space-x-3">
          <button
            onClick={exportSummaryReport}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            📊 Báo cáo Tóm tắt
          </button>
          <button
            onClick={exportDetailedReport}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            📋 Báo cáo Chi tiết  
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            + Thêm yêu cầu
          </button>
        </div>
      </div>

      {/* Enhanced Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tổng yêu cầu</h3>
          <p className="text-2xl font-bold text-gray-900">{calculateDetailedStats().total}</p>
          <p className="text-xs text-gray-400 mt-1">Số lượng đề xuất</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Giá trị yêu cầu</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(calculateDetailedStats().totalValue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Tổng dự kiến</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Đã thanh toán</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(calculateDetailedStats().purchasedValue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Số tiền thực chi</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Tiết kiệm</h3>
          <p className="text-2xl font-bold text-orange-600">
            {formatCurrency(calculateDetailedStats().savings)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Chênh lệch dự kiến</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Hoàn thành</h3>
          <p className="text-2xl font-bold text-purple-600">
            {calculateDetailedStats().completionRate}%
          </p>
          <p className="text-xs text-gray-400 mt-1">Tỷ lệ hoàn thành</p>
        </div>
      </div>

      {/* Category Statistics */}
      <div className="bg-white rounded-lg shadow mb-6 p-6">
        <h2 className="text-xl font-semibold mb-4">Thống kê Theo danh mục</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(calculateDetailedStats().byCategory).map(([category, data]: [string, any]) => (
            <div key={category} className="border rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">{category}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Số lượng:</span>
                  <span className="font-medium">{data.count} yêu cầu</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Giá trị yêu cầu:</span>
                  <span className="font-medium text-blue-600">{formatCurrency(data.value)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Đã thanh toán:</span>
                  <span className="font-medium text-green-600">{formatCurrency(data.purchased)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Danh sách yêu cầu mua sắm</h2>
          <div className="grid gap-4">
            {items.map((item) => (
              <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.item_name}
                        className="h-16 w-16 rounded-lg object-cover"
                      />
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                      <p className="text-sm text-gray-600">{item.department} - {item.requested_by}</p>
                      <p className="text-sm text-blue-600">{formatCurrency(item.requested_value)}</p>
                      <p className="text-xs text-gray-500">
                        {item.category === 'fixed-assets' ? 'Tài sản cố định' : 'Công cụ & Thiết bị'} 
                        • {item.quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      item.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'requested' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'purchased' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getStatusText(item.status)}
                    </span>
                    <div className={`text-xs mt-1 font-medium ${
                      item.priority === 'urgent' ? 'text-red-600' :
                      item.priority === 'high' ? 'text-orange-600' :
                      item.priority === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {getPriorityText(item.priority)}
                    </div>
                    <div className="mt-2 space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:text-blue-800 text-xs"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(item.id!)}
                        className="text-red-600 hover:text-red-800 text-xs"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
                {item.notes && (
                  <p className="text-sm text-gray-600 mt-2 pl-20">{item.notes}</p>
                )}
              </div>
            ))}
          </div>
          {items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Không có yêu cầu mua sắm nào</p>
              <p className="text-gray-400 text-sm mt-2">Sử dụng mock data để demo tính năng</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingItem ? 'Chỉnh sửa' : 'Thêm mới'} Yêu cầu Mua sắm
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên thiết bị *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.item_name}
                    onChange={(e) => setFormData({...formData, item_name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Danh mục *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="tools-equipment">Công cụ & Thiết bị</option>
                    <option value="fixed-assets">Tài sản cố định</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bộ phận *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Người yêu cầu *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.requested_by}
                    onChange={(e) => setFormData({...formData, requested_by: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Số lượng *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.quantity}
                    onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Đơn vị *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="chiếc, bộ, cái..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá trị yêu cầu (VND) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.requested_value}
                    onChange={(e) => setFormData({...formData, requested_value: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Độ ưu tiên
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                    <option value="urgent">Khẩn cấp</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ngày yêu cầu
                  </label>
                  <input
                    type="date"
                    value={formData.department_request_date}
                    onChange={(e) => setFormData({...formData, department_request_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trạng thái
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Nháp</option>
                    <option value="requested">Đã yêu cầu</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="purchased">Đã mua</option>
                    <option value="completed">Hoàn thành</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả/Ghi chú
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Thông tin bổ sung về yêu cầu mua sắm..."
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
                  {editingItem ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
