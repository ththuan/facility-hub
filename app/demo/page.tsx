'use client';

import { useState } from 'react';
import AdvancedFilters, { FilterOption, Filter } from '@/components/AdvancedFilters';

export default function DemoPage() {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [savedFilters, setSavedFilters] = useState<{ name: string; filters: Filter[] }[]>([]);

  // Demo filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'name',
      label: 'Tên thiết bị',
      type: 'text',
      placeholder: 'Nhập tên thiết bị...'
    },
    {
      key: 'category',
      label: 'Loại thiết bị',
      type: 'select',
      options: [
        { value: 'computer', label: 'Máy tính' },
        { value: 'printer', label: 'Máy in' },
        { value: 'monitor', label: 'Màn hình' },
        { value: 'network', label: 'Thiết bị mạng' }
      ]
    },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'multi-select',
      options: [
        { value: 'active', label: 'Hoạt động' },
        { value: 'maintenance', label: 'Bảo trì' },
        { value: 'broken', label: 'Hỏng' },
        { value: 'retired', label: 'Ngừng sử dụng' }
      ]
    },
    {
      key: 'purchaseDate',
      label: 'Ngày mua',
      type: 'date'
    },
    {
      key: 'warrantyDate',
      label: 'Ngày hết bảo hành',
      type: 'date'
    },
    {
      key: 'price',
      label: 'Giá thành',
      type: 'range'
    },
    {
      key: 'hasWarranty',
      label: 'Còn bảo hành',
      type: 'boolean'
    },
    {
      key: 'room',
      label: 'Phòng',
      type: 'select',
      options: [
        { value: 'room1', label: 'Phòng IT' },
        { value: 'room2', label: 'Phòng Kế toán' },
        { value: 'room3', label: 'Phòng Nhân sự' },
        { value: 'room4', label: 'Phòng họp A' }
      ]
    }
  ];

  const handleFiltersChange = (filters: Filter[]) => {
    setActiveFilters(filters);
    console.log('Active filters:', filters);
  };

  const handleSaveFilter = (name: string, filters: Filter[]) => {
    const newSavedFilter = { name, filters };
    setSavedFilters([...savedFilters, newSavedFilter]);
  };

  const renderFilterResults = () => {
    if (activeFilters.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">🔍</div>
            <div className="text-lg font-medium mb-2">Chưa có bộ lọc nào được áp dụng</div>
            <div className="text-sm">Sử dụng bộ lọc ở trên để tìm kiếm thiết bị</div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
            <span className="text-lg">🎯</span>
            <span className="font-medium">Kết quả lọc: {activeFilters.length} điều kiện được áp dụng</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Điều kiện lọc hiện tại
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {activeFilters.map((filter, index) => {
                const filterOption = filterOptions.find(f => f.key === filter.key);
                return (
                  <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {filterOption?.label}:
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {filter.operator || 'equals'}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-100 rounded text-sm">
                        {Array.isArray(filter.value) 
                          ? filter.value.join(', ') 
                          : typeof filter.value === 'boolean'
                          ? (filter.value ? 'Có' : 'Không')
                          : filter.value || 'Trống'
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Demo Results */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Kết quả tìm kiếm (Demo)
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(item => (
                <div key={item} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-300 text-lg">🖥️</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        Thiết bị {item}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        DEVICE-{item.toString().padStart(3, '0')}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Khớp với {Math.floor(Math.random() * activeFilters.length) + 1} điều kiện
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Demo Advanced Filters</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Kiểm tra tính năng bộ lọc nâng cao với dữ liệu mẫu
          </p>
        </div>
      </div>

      {/* Features Overview */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          🎉 Tất cả tính năng đã được triển khai!
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">PWA Ready</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Progressive Web App với Service Worker</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">🌙</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Chế độ sáng/tối với Theme Switcher</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">📧</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Email System</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Thông báo email tự động</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">📅</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Calendar</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lịch bảo trì và sự kiện</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">🔍</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Advanced Filters</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Bộ lọc thông minh đa điều kiện</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">💾</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Auto Backup</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Sao lưu tự động và khôi phục</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">User Roles</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Quản lý người dùng và quyền hạn</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-medium text-gray-900 dark:text-gray-100">Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Báo cáo và phân tích dữ liệu</p>
          </div>
        </div>
      </div>

      {/* Advanced Filters Demo */}
      <AdvancedFilters
        filters={filterOptions}
        onFiltersChange={handleFiltersChange}
        onSaveFilter={handleSaveFilter}
        savedFilters={savedFilters}
      />

      {/* Results Display */}
      {renderFilterResults()}

      {/* Feature Status */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          📋 Trạng thái triển khai tính năng
        </h3>
        
        <div className="space-y-3">
          {[
            { name: '📱 Progressive Web App (PWA)', status: 'completed', description: 'Manifest, Service Worker, offline support' },
            { name: '🌙 Dark Mode System', status: 'completed', description: 'Theme context, switcher, localStorage persistence' },
            { name: '📧 Email Notifications', status: 'completed', description: 'SMTP config, scheduling, notification types' },
            { name: '📅 Calendar Integration', status: 'completed', description: 'Maintenance schedule, events, warranty alerts' },
            { name: '🔍 Advanced Filters', status: 'completed', description: 'Multi-condition filters, save/load, operators' },
            { name: '💾 Auto Backup System', status: 'completed', description: 'Scheduled backup, restore, cleanup' },
            { name: '👥 User Roles Management', status: 'completed', description: 'Users, roles, permissions, access control' },
            { name: '📊 Analytics Dashboard', status: 'existing', description: 'Charts, reports, statistics' },
            { name: '📱 QR Code Generator', status: 'existing', description: 'Device QR codes, bulk generation' },
            { name: '📄 Document Management', status: 'existing', description: 'File upload, categorization, search' }
          ].map((feature, index) => (
            <div key={index} className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  feature.status === 'completed' ? 'bg-green-500' : 
                  feature.status === 'existing' ? 'bg-blue-500' : 'bg-yellow-500'
                }`}></div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {feature.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {feature.description}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                feature.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
                feature.status === 'existing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
              }`}>
                {feature.status === 'completed' ? '✅ Hoàn thành' :
                 feature.status === 'existing' ? '📋 Có sẵn' : '🔄 Đang phát triển'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
          🚀 Hướng dẫn sử dụng
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Cho người dùng mới:</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Bắt đầu từ Dashboard để xem tổng quan</li>
              <li>• Thêm thiết bị đầu tiên trong phần "Thiết bị"</li>
              <li>• Tạo phòng ban và gán thiết bị</li>
              <li>• Sử dụng QR Code để quản lý nhanh</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tính năng nâng cao:</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li>• Cài đặt Email để nhận thông báo tự động</li>
              <li>• Sử dụng Calendar cho lịch bảo trì</li>
              <li>• Cấu hình Auto Backup để bảo vệ dữ liệu</li>
              <li>• Quản lý User Roles cho team</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
