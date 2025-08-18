'use client';

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabaseService, Device, Room, Document, Task, WorkOrder } from "@/lib/supabaseService";
import { withAuth } from "@/contexts/AuthContext";

function DashboardPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [devicesData, roomsData, documentsData, tasksData, workOrdersData] = await Promise.all([
        supabaseService.getDevices(),
        supabaseService.getRooms(),
        supabaseService.getDocuments(),
        supabaseService.getTasks(),
        supabaseService.getWorkOrders()
      ]);
      
      setDevices(devicesData);
      setRooms(roomsData);
      setDocuments(documentsData);
      setTasks(tasksData);
      setWorkOrders(workOrdersData);
      
      console.log('✅ Dashboard loaded:', {
        devices: devicesData.length,
        rooms: roomsData.length,
        documents: documentsData.length,
        tasks: tasksData.length,
        workOrders: workOrdersData.length
      });
      
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalDevices: devices.length,
    workingDevices: devices.filter(d => d.status === 'good').length,
    maintenanceDevices: devices.filter(d => d.status === 'maintenance').length,
    brokenDevices: devices.filter(d => d.status === 'broken').length,
    repairingDevices: devices.filter(d => d.status === 'repairing').length,
    totalRooms: rooms.length,
    totalDocuments: documents.length,
    contractDocuments: documents.filter(d => d.type === 'contract').length,
    quoteDocuments: documents.filter(d => d.type === 'quote').length,
    totalTasks: tasks.length,
    pendingTasks: tasks.filter(t => t.status === 'todo' || t.status === 'doing').length,
    completedTasks: tasks.filter(t => t.status === 'done').length,
    totalWorkOrders: workOrders.length,
    openWorkOrders: workOrders.filter(w => w.status === 'open' || w.status === 'in_progress').length,
    completedWorkOrders: workOrders.filter(w => w.status === 'done').length,
  };

  // Recent work orders (last 5)
  const recentWorkOrders = workOrders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Upcoming tasks (tasks with due dates, sorted by due date)
  const upcomingTasks = tasks
    .filter(t => t.dueDate && t.status !== 'done')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Vừa xong";
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 0) return "Hôm nay";
    return `${diffInDays} ngày trước`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-2 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 dark:text-white">Dashboard - Tổng quan</h1>
      
      {/* Stats Cards - Responsive */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Tổng thiết bị</h3>
          <p className="text-xl sm:text-3xl font-bold text-blue-600">{stats.totalDevices}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.workingDevices} hoạt động tốt
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Phòng ban</h3>
          <p className="text-xl sm:text-3xl font-bold text-green-600">{stats.totalRooms}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tổng số phòng
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Công việc</h3>
          <p className="text-xl sm:text-3xl font-bold text-purple-600">{stats.openWorkOrders}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.completedWorkOrders} hoàn thành
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 p-3 sm:p-6 rounded-lg shadow-sm border dark:border-gray-700">
          <h3 className="text-sm sm:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">Tasks</h3>
          <p className="text-xl sm:text-3xl font-bold text-orange-600">{stats.pendingTasks}</p>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.completedTasks} xong
          </p>
        </div>
      </div>

      {/* Device Status Overview - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 sm:p-6 rounded-lg border border-green-200 dark:border-green-800">
          <h3 className="text-base sm:text-lg font-semibold text-green-700 dark:text-green-400 mb-1 sm:mb-2">Hoạt động tốt</h3>
          <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.workingDevices}</p>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 sm:p-6 rounded-lg border border-yellow-200 dark:border-yellow-800">
          <h3 className="text-base sm:text-lg font-semibold text-yellow-700 dark:text-yellow-400 mb-1 sm:mb-2">Đang bảo trì</h3>
          <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.maintenanceDevices}</p>
        </div>
        
        <div className="bg-red-50 dark:bg-red-900/20 p-4 sm:p-6 rounded-lg border border-red-200 dark:border-red-800">
          <h3 className="text-base sm:text-lg font-semibold text-red-700 dark:text-red-400 mb-1 sm:mb-2">Hư hỏng</h3>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.brokenDevices}</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Work Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Work Orders gần đây</h2>
            <Link href="/work-orders" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {recentWorkOrders.length > 0 ? recentWorkOrders.map((workOrder) => (
              <div key={workOrder.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  workOrder.status === 'open' ? 'bg-blue-500' :
                  workOrder.status === 'in_progress' ? 'bg-orange-500' :
                  workOrder.status === 'done' ? 'bg-green-500' :
                  'bg-gray-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-gray-900 font-medium">{workOrder.title}</p>
                  <p className="text-gray-600 text-sm">{workOrder.description}</p>
                  <p className="text-gray-500 text-xs">{getRelativeTime(workOrder.createdAt)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  workOrder.priority === 'high' ? 'bg-red-100 text-red-800' :
                  workOrder.priority === 'med' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {workOrder.priority === 'high' ? 'Cao' : workOrder.priority === 'med' ? 'Trung bình' : 'Thấp'}
                </span>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">Chưa có work order nào</p>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tasks sắp đến hạn</h2>
            <Link href="/tasks" className="text-blue-600 hover:text-blue-800 text-sm">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {upcomingTasks.length > 0 ? upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 text-sm">Hạn: {formatDate(task.dueDate!)}</p>
                  {task.assignee && (
                    <p className="text-gray-500 text-xs">Phụ trách: {task.assignee}</p>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  task.priority === 'high' ? 'bg-red-100 text-red-800' :
                  task.priority === 'med' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {task.priority === 'high' ? 'Cao' : task.priority === 'med' ? 'Trung bình' : 'Thấp'}
                </span>
              </div>
            )) : (
              <p className="text-gray-500 text-center py-4">Chưa có task nào sắp đến hạn</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Thao tác nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/devices" className="p-4 bg-blue-50 rounded-lg text-center hover:bg-blue-100 transition-colors">
            <div className="text-blue-600 text-2xl mb-2">📱</div>
            <p className="font-medium text-blue-800">Quản lý thiết bị</p>
            <p className="text-xs text-blue-600">{stats.totalDevices} thiết bị</p>
          </Link>
          
          <Link href="/rooms" className="p-4 bg-green-50 rounded-lg text-center hover:bg-green-100 transition-colors">
            <div className="text-green-600 text-2xl mb-2">🏢</div>
            <p className="font-medium text-green-800">Quản lý phòng</p>
            <p className="text-xs text-green-600">{stats.totalRooms} phòng</p>
          </Link>
          
          <Link href="/work-orders" className="p-4 bg-purple-50 rounded-lg text-center hover:bg-purple-100 transition-colors">
            <div className="text-purple-600 text-2xl mb-2">🔧</div>
            <p className="font-medium text-purple-800">Work Orders</p>
            <p className="text-xs text-purple-600">{stats.openWorkOrders} đang mở</p>
          </Link>
          
          <Link href="/tasks" className="p-4 bg-orange-50 rounded-lg text-center hover:bg-orange-100 transition-colors">
            <div className="text-orange-600 text-2xl mb-2">📋</div>
            <p className="font-medium text-orange-800">Tasks</p>
            <p className="text-xs text-orange-600">{stats.pendingTasks} chưa xong</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default withAuth(DashboardPage, undefined, [{ module: 'dashboard', action: 'read' }]);
