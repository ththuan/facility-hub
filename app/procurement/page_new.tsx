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

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Quản lý Mua sắm</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
        >
          Thêm yêu cầu mua sắm
        </button>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Tổng yêu cầu</h3>
            <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Giá trị yêu cầu</h3>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(statistics.totalValue)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Đã thanh toán</h3>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(statistics.totalActualValue)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Đã hoàn thành</h3>
            <p className="text-2xl font-bold text-purple-600">
              {statistics.byStatus?.completed || 0}
            </p>
          </div>
        </div>
      )}

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
                      {item.status}
                    </span>
                    <div className={`text-xs mt-1 font-medium ${
                      item.priority === 'urgent' ? 'text-red-600' :
                      item.priority === 'high' ? 'text-orange-600' :
                      item.priority === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {item.priority}
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
    </div>
  );
}
