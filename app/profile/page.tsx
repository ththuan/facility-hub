'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
    avatar: user?.avatar || ''
  });
  const [saving, setSaving] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Bạn cần đăng nhập để xem trang này
          </h2>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUser({ ...user, ...formData });
      setIsEditing(false);
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin:', error);
    } finally {
      setSaving(false);
    }
  };

  const getRoleColor = (roleName: string): string => {
    const colors = {
      'admin': 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      'manager': 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      'staff': 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      'viewer': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
    };
    return colors[roleName as keyof typeof colors] || colors.viewer;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Thông tin cá nhân
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Quản lý thông tin tài khoản và cài đặt cá nhân
        </p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Avatar Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-medium">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.full_name} className="w-24 h-24 rounded-full object-cover" />
                ) : (
                  user.full_name
                    .split(' ')
                    .map(name => name.charAt(0))
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                )}
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.full_name}
              </h2>
              <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
              <div className="flex items-center space-x-3 mt-2">
                <span className={`px-3 py-1 text-sm font-medium rounded-full ${getRoleColor(user.role.name)}`}>
                  {user.role.displayName}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {user.department}
                </span>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Đang lưu...' : 'Lưu'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        fullName: user.full_name,
                        email: user.email,
                        phone: user.phone || '',
                        department: user.department,
                        position: user.position || '',
                        avatar: user.avatar || ''
                      });
                    }}
                    className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Hủy
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Information Form */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Họ và tên
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 py-2">{user.full_name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 py-2">{user.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Số điện thoại
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 py-2">{user.phone || 'Chưa cập nhật'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phòng ban
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 py-2">{user.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Chức vụ
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-100"
                />
              ) : (
                <p className="text-gray-900 dark:text-gray-100 py-2">{user.position || 'Chưa cập nhật'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quyền hạn
              </label>
              <p className="text-gray-900 dark:text-gray-100 py-2">{user.role.displayName}</p>
            </div>
          </div>
        </div>

        {/* Activity Information */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Thông tin hoạt động
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Tạo tài khoản:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {new Date(user.createdAt).toLocaleString('vi-VN')}
              </span>
            </div>
            {user.lastLogin && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">Đăng nhập lần cuối:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">
                  {new Date(user.lastLogin).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
            <div>
              <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                user.isActive 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                  : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
              }`}>
                {user.isActive ? 'Hoạt động' : 'Tạm khóa'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
