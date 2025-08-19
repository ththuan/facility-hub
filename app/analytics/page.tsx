'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalDevices: number;
  totalRooms: number;
  totalWorkOrders: number;
  completedWorkOrders: number;
  devicesByCategory: { [key: string]: number };
  workOrdersByStatus: { [key: string]: number };
  roomsByStatus: { [key: string]: number };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAnalytics();
  }, []);

  const generateAnalytics = async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockData: AnalyticsData = {
      totalDevices: 150,
      totalRooms: 25,
      totalWorkOrders: 45,
      completedWorkOrders: 32,
      devicesByCategory: {
        'Máy tính': 25,
        'Thiết bị văn phòng': 18,
        'Thiết bị trình chiếu': 8,
        'Thiết bị mạng': 12,
        'Khác': 7
      },
      workOrdersByStatus: {
        'Mở': 12,
        'Đang xử lý': 15,
        'Hoàn thành': 8,
        'Đóng': 10
      },
      roomsByStatus: {
        'Hoạt động': 20,
        'Bảo trì': 3,
        'Ngưng sử dụng': 2
      }
    };

    setAnalytics(mockData);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu phân tích...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-600">Không thể tải dữ liệu phân tích.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Báo cáo và Phân tích</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Tổng thiết bị</h3>
          <p className="text-3xl font-bold text-blue-600">{analytics.totalDevices}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Tổng phòng</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.totalRooms}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Tổng công việc</h3>
          <p className="text-3xl font-bold text-orange-600">{analytics.totalWorkOrders}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Công việc hoàn thành</h3>
          <p className="text-3xl font-bold text-purple-600">{analytics.completedWorkOrders}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Thiết bị theo danh mục</h2>
          <div className="space-y-3">
            {Object.entries(analytics.devicesByCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="text-gray-700">{category}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Công việc theo trạng thái</h2>
          <div className="space-y-3">
            {Object.entries(analytics.workOrdersByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-gray-700">{status}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
