'use client';

import { useState, useEffect } from 'react';
import { supabaseService } from '@/lib/supabaseService';

interface AnalyticsData {
  totalDevices: number;
  totalRooms: number;
  devicesByCategory: { [key: string]: number };
  devicesByStatus: { [key: string]: number };
  roomsByFloor: { [key: string]: number };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateAnalytics();
  }, []);

  const generateAnalytics = async () => {
    try {
      const [devicesData, roomsData] = await Promise.all([
        supabaseService.getDevices(),
        supabaseService.getRooms()
      ]);

      // Calculate device statistics from real data
      const devicesByCategory: { [key: string]: number } = {};
      const devicesByStatus: { [key: string]: number } = {};
      
      devicesData.forEach(device => {
        const category = device.category || 'Khác';
        devicesByCategory[category] = (devicesByCategory[category] || 0) + 1;
        
        const status = device.status || 'Không xác định';
        devicesByStatus[status] = (devicesByStatus[status] || 0) + 1;
      });

      // Calculate room statistics from real data  
      const roomsByFloor: { [key: string]: number } = {};
      roomsData.forEach(room => {
        const floor = room.code?.charAt(0) || '1'; // Extract floor from room code
        roomsByFloor[`Tầng ${floor}`] = (roomsByFloor[`Tầng ${floor}`] || 0) + 1;
      });

      const realData: AnalyticsData = {
        totalDevices: devicesData.length,
        totalRooms: roomsData.length,
        devicesByCategory,
        devicesByStatus,
        roomsByFloor
      };

      setAnalytics(realData);
    } catch (error) {
      console.error('❌ Error loading analytics:', error);
      // Fallback to mock data if error
      setAnalytics({
        totalDevices: 0,
        totalRooms: 0,
        devicesByCategory: {},
        devicesByStatus: {},
        roomsByFloor: {}
      });
    } finally {
      setLoading(false);
    }
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
          <h3 className="text-lg font-semibold text-gray-700">Thiết bị hoạt động</h3>
          <p className="text-3xl font-bold text-green-600">{analytics.devicesByStatus?.['good'] || 0}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-700">Thiết bị cần bảo trì</h3>
          <p className="text-3xl font-bold text-orange-600">{(analytics.devicesByStatus?.['maintenance'] || 0) + (analytics.devicesByStatus?.['broken'] || 0)}</p>
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
          <h2 className="text-xl font-semibold mb-4">Phòng theo tầng</h2>
          <div className="space-y-3">
            {Object.entries(analytics.roomsByFloor).map(([floor, count]) => (
              <div key={floor} className="flex justify-between items-center">
                <span className="text-gray-700">{floor}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
