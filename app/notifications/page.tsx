'use client';

import { useState, useEffect } from 'react';
import { deviceManager, workOrderManager, taskManager } from '@/lib/localStorage';

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread' | 'warning' | 'info'>('all');

  useEffect(() => {
    generateNotifications();
  }, []);

  const generateNotifications = () => {
    const notifs: Notification[] = [];
    const now = new Date();

    // Kiểm tra thiết bị sắp hết bảo hành
    const devices = deviceManager.getAll();
    devices.forEach(device => {
      if (device.warrantyUntil) {
        const warrantyDate = new Date(device.warrantyUntil);
        const daysUntilExpiry = Math.ceil((warrantyDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          notifs.push({
            id: `warranty_${device.id}`,
            type: 'warning',
            title: 'Sắp hết bảo hành',
            message: `Thiết bị "${device.name}" sẽ hết bảo hành trong ${daysUntilExpiry} ngày`,
            timestamp: now.toISOString(),
            read: false,
            actionUrl: '/devices'
          });
        } else if (daysUntilExpiry <= 0) {
          notifs.push({
            id: `warranty_expired_${device.id}`,
            type: 'error',
            title: 'Đã hết bảo hành',
            message: `Thiết bị "${device.name}" đã hết bảo hành`,
            timestamp: now.toISOString(),
            read: false,
            actionUrl: '/devices'
          });
        }
      }

      // Thiết bị đang hư
      if (device.status === 'Hư') {
        notifs.push({
          id: `broken_${device.id}`,
          type: 'error',
          title: 'Thiết bị hư hỏng',
          message: `Thiết bị "${device.name}" đang ở trạng thái hư hỏng`,
          timestamp: now.toISOString(),
          read: false,
          actionUrl: '/devices'
        });
      }
    });

    // Kiểm tra work orders quá hạn
    const workOrders = workOrderManager.getAll();
    workOrders.forEach(wo => {
      if (wo.dueDate && wo.status !== 'Hoàn thành' && wo.status !== 'Đóng') {
        const dueDate = new Date(wo.dueDate);
        const isOverdue = dueDate < now;
        const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (isOverdue) {
          notifs.push({
            id: `overdue_wo_${wo.id}`,
            type: 'error',
            title: 'Work Order quá hạn',
            message: `"${wo.title}" đã quá hạn ${daysOverdue} ngày`,
            timestamp: now.toISOString(),
            read: false,
            actionUrl: '/tasks'
          });
        }
      }
    });

    // Kiểm tra tasks quá hạn
    const tasks = taskManager.getAll();
    tasks.forEach(task => {
      if (task.dueDate && task.status !== 'Hoàn thành') {
        const dueDate = new Date(task.dueDate);
        const isOverdue = dueDate < now;
        const daysOverdue = Math.ceil((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (isOverdue) {
          notifs.push({
            id: `overdue_task_${task.id}`,
            type: 'warning',
            title: 'Task quá hạn',
            message: `"${task.title}" đã quá hạn ${daysOverdue} ngày`,
            timestamp: now.toISOString(),
            read: false,
            actionUrl: '/tasks'
          });
        }
      }
    });

    // Thông báo hệ thống
    notifs.push({
      id: 'system_backup',
      type: 'info',
      title: 'Sao lưu dữ liệu',
      message: 'Hệ thống đã tự động sao lưu dữ liệu thành công',
      timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      actionUrl: '/import'
    });

    // Sắp xếp theo thời gian mới nhất
    notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    setNotifications(notifs);
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread':
        return !notif.read;
      case 'warning':
        return notif.type === 'warning';
      case 'info':
        return notif.type === 'info';
      default:
        return true;
    }
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning': return '⚠️';
      case 'error': return '🚨';
      case 'success': return '✅';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error': return 'bg-red-50 border-red-200 text-red-800';
      case 'success': return 'bg-green-50 border-green-200 text-green-800';
      case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thông báo</h1>
          <p className="mt-2 text-gray-600">
            Theo dõi các thông báo quan trọng và cảnh báo hệ thống
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            {unreadCount} chưa đọc
          </span>
          <button
            onClick={markAllAsRead}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Đánh dấu tất cả đã đọc
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex space-x-4">
        {[
          { key: 'all', label: 'Tất cả', count: notifications.length },
          { key: 'unread', label: 'Chưa đọc', count: unreadCount },
          { key: 'warning', label: 'Cảnh báo', count: notifications.filter(n => n.type === 'warning').length },
          { key: 'info', label: 'Thông tin', count: notifications.filter(n => n.type === 'info').length }
        ].map(item => (
          <button
            key={item.key}
            onClick={() => setFilter(item.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === item.key
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {item.label} ({item.count})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white shadow rounded-lg">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Không có thông báo
            </h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'Bạn đã đọc tất cả thông báo' : 'Chưa có thông báo nào'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getIcon(notification.type)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(notification.type)}`}>
                          {notification.type === 'warning' ? 'Cảnh báo' : 
                           notification.type === 'error' ? 'Lỗi' :
                           notification.type === 'info' ? 'Thông tin' : 'Thành công'}
                        </span>
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-blue-600 hover:text-blue-800 text-xs"
                          >
                            Đánh dấu đã đọc
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {notification.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.timestamp).toLocaleString('vi-VN')}
                      </span>
                      {notification.actionUrl && (
                        <a
                          href={notification.actionUrl}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Xem chi tiết →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Hành động nhanh</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/devices?filter=warranty"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📅</span>
              <div>
                <h4 className="font-medium text-gray-900">Kiểm tra bảo hành</h4>
                <p className="text-sm text-gray-600">Xem thiết bị sắp hết bảo hành</p>
              </div>
            </div>
          </a>
          
          <a
            href="/tasks?filter=overdue"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⏰</span>
              <div>
                <h4 className="font-medium text-gray-900">Tasks quá hạn</h4>
                <p className="text-sm text-gray-600">Xử lý các công việc bị trễ</p>
              </div>
            </div>
          </a>
          
          <a
            href="/devices?filter=broken"
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔧</span>
              <div>
                <h4 className="font-medium text-gray-900">Thiết bị hư hỏng</h4>
                <p className="text-sm text-gray-600">Sửa chữa thiết bị có vấn đề</p>
              </div>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
