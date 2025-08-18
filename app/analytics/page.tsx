'use client';

import { useState, useEffect } from 'react';
import { deviceManager, roomManager, workOrderManager, taskManager } from '@/lib/localStorage';

interface AnalyticsData {
  devicesByCategory: { [key: string]: number };
  devicesByStatus: { [key: string]: number };
  devicesByRoom: { [key: string]: number };
  workOrdersByPriority: { [key: string]: number };
  workOrdersByStatus: { [key: string]: number };
  monthlyTrends: { month: string; devices: number; workOrders: number; tasks: number }[];
  roomUtilization: { roomName: string; deviceCount: number; capacity: number; utilization: number }[];
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'workorders' | 'rooms'>('overview');

  useEffect(() => {
    generateAnalytics();
  }, []);

  const generateAnalytics = () => {
    const devices = deviceManager.getAll();
    const rooms = roomManager.getAll();
    const workOrders = workOrderManager.getAll();
    const tasks = taskManager.getAll();

    // Thống kê thiết bị theo danh mục
    const devicesByCategory: { [key: string]: number } = {};
    devices.forEach(device => {
      devicesByCategory[device.category] = (devicesByCategory[device.category] || 0) + device.quantity;
    });

    // Thống kê thiết bị theo trạng thái
    const devicesByStatus: { [key: string]: number } = {};
    devices.forEach(device => {
      devicesByStatus[device.status] = (devicesByStatus[device.status] || 0) + device.quantity;
    });

    // Thống kê thiết bị theo phòng
    const devicesByRoom: { [key: string]: number } = {};
    const roomIdToName = new Map(rooms.map(room => [room.id, room.name]));
    devices.forEach(device => {
      const roomName = device.roomId ? roomIdToName.get(device.roomId) || 'Chưa phân bổ' : 'Chưa phân bổ';
      devicesByRoom[roomName] = (devicesByRoom[roomName] || 0) + device.quantity;
    });

    // Thống kê work orders theo độ ưu tiên
    const workOrdersByPriority: { [key: string]: number } = {};
    workOrders.forEach(wo => {
      workOrdersByPriority[wo.priority] = (workOrdersByPriority[wo.priority] || 0) + 1;
    });

    // Thống kê work orders theo trạng thái
    const workOrdersByStatus: { [key: string]: number } = {};
    workOrders.forEach(wo => {
      workOrdersByStatus[wo.status] = (workOrdersByStatus[wo.status] || 0) + 1;
    });

    // Xu hướng theo tháng (mock data)
    const monthlyTrends = [
      { month: 'Tháng 1', devices: Math.floor(devices.length * 0.7), workOrders: Math.floor(workOrders.length * 0.6), tasks: Math.floor(tasks.length * 0.5) },
      { month: 'Tháng 2', devices: Math.floor(devices.length * 0.8), workOrders: Math.floor(workOrders.length * 0.7), tasks: Math.floor(tasks.length * 0.6) },
      { month: 'Tháng 3', devices: Math.floor(devices.length * 0.9), workOrders: Math.floor(workOrders.length * 0.8), tasks: Math.floor(tasks.length * 0.8) },
      { month: 'Tháng 4', devices: devices.length, workOrders: workOrders.length, tasks: tasks.length }
    ];

    // Tỷ lệ sử dụng phòng
    const roomUtilization = rooms.map(room => {
      const deviceCount = devices.filter(d => d.roomId === room.id).reduce((sum, d) => sum + d.quantity, 0);
      const capacity = room.capacity || 0;
      const utilization = capacity > 0 ? Math.min((deviceCount / capacity) * 100, 100) : 0;
      
      return {
        roomName: room.name,
        deviceCount,
        capacity,
        utilization: Math.round(utilization)
      };
    });

    setAnalytics({
      devicesByCategory,
      devicesByStatus,
      devicesByRoom,
      workOrdersByPriority,
      workOrdersByStatus,
      monthlyTrends,
      roomUtilization
    });
  };

  if (!analytics) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  const BarChart = ({ data, title, color = 'blue' }: { data: { [key: string]: number }, title: string, color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' }) => {
    const maxValue = Math.max(...Object.values(data));
    const colorClasses = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      red: 'bg-red-500',
      purple: 'bg-purple-500'
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {Object.entries(data).map(([key, value]) => (
            <div key={key}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{key}</span>
                <span className="font-medium">{value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${colorClasses[color]}`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const LineChart = ({ data, title }: { data: any[], title: string }) => {
    const maxValue = Math.max(...data.flatMap(d => [d.devices, d.workOrders, d.tasks]));

    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={index} className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900">{item.month}</h4>
              <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                <div>
                  <span className="text-gray-600">Thiết bị: </span>
                  <span className="font-medium text-blue-600">{item.devices}</span>
                </div>
                <div>
                  <span className="text-gray-600">Work Orders: </span>
                  <span className="font-medium text-green-600">{item.workOrders}</span>
                </div>
                <div>
                  <span className="text-gray-600">Tasks: </span>
                  <span className="font-medium text-purple-600">{item.tasks}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Báo cáo</h1>
        <p className="mt-2 text-gray-600">
          Phân tích dữ liệu và thống kê chi tiết về hệ thống
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Tổng quan', icon: '📊' },
            { key: 'devices', label: 'Thiết bị', icon: '📱' },
            { key: 'workorders', label: 'Work Orders', icon: '🔧' },
            { key: 'rooms', label: 'Phòng ban', icon: '🏢' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart 
            data={analytics.devicesByStatus} 
            title="Thiết bị theo trạng thái" 
            color="green"
          />
          <BarChart 
            data={analytics.workOrdersByStatus} 
            title="Work Orders theo trạng thái" 
            color="purple"
          />
          <div className="lg:col-span-2">
            <LineChart 
              data={analytics.monthlyTrends} 
              title="Xu hướng theo tháng"
            />
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart 
            data={analytics.devicesByCategory} 
            title="Thiết bị theo danh mục" 
            color="blue"
          />
          <BarChart 
            data={analytics.devicesByRoom} 
            title="Thiết bị theo phòng" 
            color="green"
          />
          <BarChart 
            data={analytics.devicesByStatus} 
            title="Thiết bị theo trạng thái" 
            color="yellow"
          />
          
          {/* Top Insights */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📈 Insights</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">Danh mục phổ biến nhất</h4>
                <p className="text-blue-700 text-sm">
                  {Object.entries(analytics.devicesByCategory).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">Tỷ lệ thiết bị tốt</h4>
                <p className="text-green-700 text-sm">
                  {Math.round((analytics.devicesByStatus['Tốt'] || 0) / Object.values(analytics.devicesByStatus).reduce((a, b) => a + b, 0) * 100)}%
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <h4 className="font-medium text-yellow-900">Thiết bị cần chú ý</h4>
                <p className="text-yellow-700 text-sm">
                  {(analytics.devicesByStatus['Hư'] || 0) + (analytics.devicesByStatus['Đang bảo trì'] || 0)} thiết bị
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Orders Tab */}
      {activeTab === 'workorders' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart 
            data={analytics.workOrdersByPriority} 
            title="Work Orders theo độ ưu tiên" 
            color="red"
          />
          <BarChart 
            data={analytics.workOrdersByStatus} 
            title="Work Orders theo trạng thái" 
            color="purple"
          />
          
          {/* Performance Metrics */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">🎯 Performance Metrics</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {analytics.workOrdersByStatus['Hoàn thành'] || 0}
                </div>
                <div className="text-sm text-blue-600">Đã hoàn thành</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {analytics.workOrdersByStatus['Đang xử lý'] || 0}
                </div>
                <div className="text-sm text-yellow-600">Đang xử lý</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(((analytics.workOrdersByStatus['Hoàn thành'] || 0) / Object.values(analytics.workOrdersByStatus).reduce((a, b) => a + b, 0)) * 100) || 0}%
                </div>
                <div className="text-sm text-green-600">Tỷ lệ hoàn thành</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {analytics.workOrdersByPriority['Cao'] || 0}
                </div>
                <div className="text-sm text-red-600">Ưu tiên cao</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rooms Tab */}
      {activeTab === 'rooms' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">🏢 Tỷ lệ sử dụng phòng</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {analytics.roomUtilization.map((room, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">{room.roomName}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        room.utilization > 80 ? 'bg-red-100 text-red-800' :
                        room.utilization > 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {room.utilization}%
                      </span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Thiết bị: {room.deviceCount}</span>
                      <span>Sức chứa: {room.capacity}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          room.utilization > 80 ? 'bg-red-500' :
                          room.utilization > 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${room.utilization}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Room Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-blue-600">
                {analytics.roomUtilization.length}
              </div>
              <div className="text-gray-600">Tổng số phòng</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-green-600">
                {Math.round(analytics.roomUtilization.reduce((sum, room) => sum + room.utilization, 0) / analytics.roomUtilization.length) || 0}%
              </div>
              <div className="text-gray-600">Tỷ lệ sử dụng trung bình</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <div className="text-3xl font-bold text-purple-600">
                {analytics.roomUtilization.reduce((sum, room) => sum + room.deviceCount, 0)}
              </div>
              <div className="text-gray-600">Tổng thiết bị</div>
            </div>
          </div>
        </div>
      )}

      {/* Export Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">📄 Xuất báo cáo</h3>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
            📊 Xuất Excel
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm">
            📑 Xuất PDF
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
            📈 Xuất CSV
          </button>
        </div>
      </div>
    </div>
  );
}
