'use client';

import { useState, useEffect } from 'react';

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'devices' | 'rooms' | 'tasks' | 'documents' | 'users' | 'system';
  actions: ('view' | 'create' | 'edit' | 'delete' | 'approve')[];
}

export interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

export default function UserRolesPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'permissions'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = () => {
    // Initialize permissions
    const defaultPermissions: Permission[] = [
      // Devices
      { id: 'devices_view', name: 'Xem thiết bị', description: 'Xem danh sách và thông tin thiết bị', category: 'devices', actions: ['view'] },
      { id: 'devices_manage', name: 'Quản lý thiết bị', description: 'Thêm, sửa, xóa thiết bị', category: 'devices', actions: ['create', 'edit', 'delete'] },
      { id: 'devices_approve', name: 'Phê duyệt thiết bị', description: 'Phê duyệt yêu cầu thêm/sửa thiết bị', category: 'devices', actions: ['approve'] },
      
      // Rooms
      { id: 'rooms_view', name: 'Xem phòng', description: 'Xem danh sách và thông tin phòng', category: 'rooms', actions: ['view'] },
      { id: 'rooms_manage', name: 'Quản lý phòng', description: 'Thêm, sửa, xóa phòng', category: 'rooms', actions: ['create', 'edit', 'delete'] },
      
      // Tasks
      { id: 'tasks_view', name: 'Xem Tasks', description: 'Xem danh sách và chi tiết tasks', category: 'tasks', actions: ['view'] },
      { id: 'tasks_manage', name: 'Quản lý Tasks', description: 'Tạo, cập nhật tasks', category: 'tasks', actions: ['create', 'edit'] },
      { id: 'tasks_approve', name: 'Phê duyệt Tasks', description: 'Phê duyệt và đóng tasks', category: 'tasks', actions: ['approve'] },
      
      // Documents
      { id: 'documents_view', name: 'Xem tài liệu', description: 'Xem và tải tài liệu', category: 'documents', actions: ['view'] },
      { id: 'documents_manage', name: 'Quản lý tài liệu', description: 'Upload, sửa, xóa tài liệu', category: 'documents', actions: ['create', 'edit', 'delete'] },
      
      // Users
      { id: 'users_view', name: 'Xem người dùng', description: 'Xem danh sách người dùng', category: 'users', actions: ['view'] },
      { id: 'users_manage', name: 'Quản lý người dùng', description: 'Thêm, sửa, xóa người dùng', category: 'users', actions: ['create', 'edit', 'delete'] },
      
      // System
      { id: 'system_backup', name: 'Backup hệ thống', description: 'Tạo và quản lý backup', category: 'system', actions: ['create', 'view'] },
      { id: 'system_settings', name: 'Cài đặt hệ thống', description: 'Cấu hình hệ thống', category: 'system', actions: ['edit'] },
      { id: 'system_reports', name: 'Báo cáo hệ thống', description: 'Xem báo cáo và thống kê', category: 'system', actions: ['view'] }
    ];

    // Initialize roles
    const defaultRoles: Role[] = [
      {
        id: 'admin',
        name: 'Administrator',
        description: 'Quyền quản trị toàn hệ thống',
        color: 'red',
        permissions: defaultPermissions.map(p => p.id),
        isDefault: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Quản lý thiết bị và công việc',
        color: 'blue',
        permissions: [
          'devices_view', 'devices_manage', 'devices_approve',
          'rooms_view', 'rooms_manage',
          'workorders_view', 'workorders_manage', 'workorders_approve',
          'documents_view', 'documents_manage',
          'users_view',
          'system_reports'
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'technician',
        name: 'Technician',
        description: 'Kỹ thuật viên bảo trì',
        color: 'green',
        permissions: [
          'devices_view',
          'rooms_view',
          'workorders_view', 'workorders_manage',
          'documents_view'
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Chỉ xem thông tin',
        color: 'gray',
        permissions: [
          'devices_view',
          'rooms_view',
          'workorders_view',
          'documents_view'
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }
    ];

    // Initialize users
    const defaultUsers: User[] = [
      {
        id: '1',
        name: 'Nguyễn Văn Admin',
        email: 'admin@company.com',
        roleId: 'admin',
        status: 'active',
        lastLogin: '2024-01-15T10:30:00Z',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '2',
        name: 'Trần Thị Manager',
        email: 'manager@company.com',
        roleId: 'manager',
        status: 'active',
        lastLogin: '2024-01-15T09:15:00Z',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '3',
        name: 'Lê Văn Kỹ thuật',
        email: 'tech@company.com',
        roleId: 'technician',
        status: 'active',
        lastLogin: '2024-01-15T08:45:00Z',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: '4',
        name: 'Phạm Thị Viewer',
        email: 'viewer@company.com',
        roleId: 'viewer',
        status: 'inactive',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ];

    setPermissions(defaultPermissions);
    setRoles(defaultRoles);
    setUsers(defaultUsers);

    // Save to localStorage
    localStorage.setItem('user-permissions', JSON.stringify(defaultPermissions));
    localStorage.setItem('user-roles', JSON.stringify(defaultRoles));
    localStorage.setItem('system-users', JSON.stringify(defaultUsers));
  };

  const getRoleById = (roleId: string) => {
    return roles.find(role => role.id === roleId);
  };

  const getPermissionById = (permissionId: string) => {
    return permissions.find(permission => permission.id === permissionId);
  };

  const getRoleColor = (color: string) => {
    const colors = {
      red: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
      green: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
    };
    return colors[color as keyof typeof colors] || colors.gray;
  };

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('system-users', JSON.stringify(updatedUsers));
    setShowAddUser(false);
  };

  const updateUserRole = (userId: string, roleId: string) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, roleId } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('system-users', JSON.stringify(updatedUsers));
  };

  const updateUserStatus = (userId: string, status: User['status']) => {
    const updatedUsers = users.map(user => 
      user.id === userId ? { ...user, status } : user
    );
    setUsers(updatedUsers);
    localStorage.setItem('system-users', JSON.stringify(updatedUsers));
  };

  const deleteUser = (userId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;
    
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('system-users', JSON.stringify(updatedUsers));
  };

  const saveRole = (roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingRole) {
      // Update existing role
      const updatedRole = {
        ...editingRole,
        ...roleData,
        updatedAt: new Date().toISOString()
      };
      
      const updatedRoles = roles.map(role => 
        role.id === editingRole.id ? updatedRole : role
      );
      setRoles(updatedRoles);
      localStorage.setItem('user-roles', JSON.stringify(updatedRoles));
      setEditingRole(null);
    } else {
      // Add new role
      const newRole: Role = {
        ...roleData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const updatedRoles = [...roles, newRole];
      setRoles(updatedRoles);
      localStorage.setItem('user-roles', JSON.stringify(updatedRoles));
    }
    setShowAddRole(false);
  };

  const deleteRole = (roleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return;
    
    // Check if any users have this role
    const usersWithRole = users.filter(user => user.roleId === roleId);
    if (usersWithRole.length > 0) {
      alert(`Không thể xóa vai trò này vì có ${usersWithRole.length} người dùng đang sử dụng.`);
      return;
    }
    
    const updatedRoles = roles.filter(role => role.id !== roleId);
    setRoles(updatedRoles);
    localStorage.setItem('user-roles', JSON.stringify(updatedRoles));
  };

  const groupPermissionsByCategory = () => {
    const grouped: { [key: string]: Permission[] } = {};
    permissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = [];
      }
      grouped[permission.category].push(permission);
    });
    return grouped;
  };

  const categoryNames = {
    devices: '🖥️ Thiết bị',
    rooms: '🏢 Phòng ban',
    'tasks': '📋 Tasks',
    documents: '📄 Tài liệu',
    users: '👥 Người dùng',
    system: '⚙️ Hệ thống'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">User Roles</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Quản lý người dùng, vai trò và quyền hạn
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'users', name: '👥 Người dùng', count: users.length },
            { id: 'roles', name: '🎭 Vai trò', count: roles.length },
            { id: 'permissions', name: '🔐 Quyền hạn', count: permissions.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.name} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quản lý người dùng</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              ➕ Thêm người dùng
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Đăng nhập cuối
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map(user => {
                    const role = getRoleById(user.roleId);
                    return (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                                <span className="text-gray-700 dark:text-gray-300 font-medium">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {user.name}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            role ? getRoleColor(role.color) : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                          }`}>
                            {role?.name || 'Không xác định'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                              : user.status === 'inactive'
                              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                          }`}>
                            {user.status === 'active' ? '🟢 Hoạt động' : 
                             user.status === 'inactive' ? '🔴 Ngưng hoạt động' : '🟡 Chờ duyệt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa đăng nhập'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                          >
                            ✏️ Sửa
                          </button>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            🗑️ Xóa
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Quản lý vai trò</h2>
            <button
              onClick={() => setShowAddRole(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              ➕ Thêm vai trò
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map(role => {
              const userCount = users.filter(user => user.roleId === role.id).length;
              return (
                <div key={role.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {role.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {role.description}
                      </p>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(role.color)}`}>
                      {userCount} người dùng
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Quyền hạn ({role.permissions.length}):
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map(permId => {
                        const permission = getPermissionById(permId);
                        return permission ? (
                          <span key={permId} className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                            {permission.name}
                          </span>
                        ) : null;
                      })}
                      {role.permissions.length > 3 && (
                        <span className="inline-flex px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                          +{role.permissions.length - 3} khác
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => {
                        setEditingRole(role);
                        setShowAddRole(true);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 text-sm"
                    >
                      ✏️ Sửa
                    </button>
                    {!role.isDefault && (
                      <button
                        onClick={() => deleteRole(role.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Permissions Tab */}
      {activeTab === 'permissions' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Danh sách quyền hạn</h2>

          {Object.entries(groupPermissionsByCategory()).map(([category, perms]) => (
            <div key={category} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                {categoryNames[category as keyof typeof categoryNames]}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {perms.map(permission => (
                  <div key={permission.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {permission.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                      {permission.description}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {permission.actions.map(action => (
                        <span key={action} className="inline-flex px-2 py-1 text-xs bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-100 rounded">
                          {action === 'view' ? '👁️ Xem' :
                           action === 'create' ? '➕ Tạo' :
                           action === 'edit' ? '✏️ Sửa' :
                           action === 'delete' ? '🗑️ Xóa' :
                           action === 'approve' ? '✅ Duyệt' : action}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Role Modal */}
      {(showAddRole || editingRole) && (
        <RoleModal
          role={editingRole}
          permissions={permissions}
          onSave={saveRole}
          onClose={() => {
            setShowAddRole(false);
            setEditingRole(null);
          }}
        />
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <UserModal
          roles={roles}
          onSave={addUser}
          onClose={() => setShowAddUser(false)}
        />
      )}

      {/* Edit User Modal */}
      {selectedUser && (
        <EditUserModal
          user={selectedUser}
          roles={roles}
          onSave={(userId, updates) => {
            const updatedUsers = users.map(user => 
              user.id === userId ? { ...user, ...updates } : user
            );
            setUsers(updatedUsers);
            localStorage.setItem('system-users', JSON.stringify(updatedUsers));
            setSelectedUser(null);
          }}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

// Role Modal Component
function RoleModal({ 
  role, 
  permissions, 
  onSave, 
  onClose 
}: { 
  role: Role | null;
  permissions: Permission[];
  onSave: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    color: role?.color || 'blue',
    permissions: role?.permissions || []
  });

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) acc[permission.category] = [];
    acc[permission.category].push(permission);
    return acc;
  }, {} as { [key: string]: Permission[] });

  const categoryNames = {
    devices: '🖥️ Thiết bị',
    rooms: '🏢 Phòng ban',
    'tasks': '📋 Tasks',
    documents: '📄 Tài liệu',
    users: '👥 Người dùng',
    system: '⚙️ Hệ thống'
  };

  const togglePermission = (permissionId: string) => {
    const newPermissions = formData.permissions.includes(permissionId)
      ? formData.permissions.filter(id => id !== permissionId)
      : [...formData.permissions, permissionId];
    setFormData({ ...formData, permissions: newPermissions });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên vai trò');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-6">
            {role ? 'Chỉnh sửa vai trò' : 'Thêm vai trò mới'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên vai trò
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Màu sắc
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
                >
                  <option value="blue">🔵 Xanh dương</option>
                  <option value="green">🟢 Xanh lá</option>
                  <option value="red">🔴 Đỏ</option>
                  <option value="yellow">🟡 Vàng</option>
                  <option value="purple">🟣 Tím</option>
                  <option value="gray">⚫ Xám</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mô tả
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                Quyền hạn ({formData.permissions.length} đã chọn)
              </label>
              
              <div className="space-y-4">
                {Object.entries(groupedPermissions).map(([category, perms]) => (
                  <div key={category} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100 mb-3">
                      {categoryNames[category as keyof typeof categoryNames]}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {perms.map(permission => (
                        <label key={permission.id} className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.permissions.includes(permission.id)}
                            onChange={() => togglePermission(permission.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                            {permission.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {role ? 'Cập nhật' : 'Thêm vai trò'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// User Modal Component
function UserModal({ 
  roles, 
  onSave, 
  onClose 
}: { 
  roles: Role[];
  onSave: (user: Omit<User, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    status: 'active' as User['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.roleId) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Thêm người dùng mới</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Họ tên
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vai trò
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            >
              <option value="">Chọn vai trò</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Thêm người dùng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ 
  user, 
  roles, 
  onSave, 
  onClose 
}: { 
  user: User;
  roles: Role[];
  onSave: (userId: string, updates: Partial<User>) => void;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    roleId: user.roleId,
    status: user.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Chỉnh sửa người dùng</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Họ tên
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vai trò
            </label>
            <select
              value={formData.roleId}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              required
            >
              {roles.map(role => (
                <option key={role.id} value={role.id}>{role.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trạng thái
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as User['status'] })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
            >
              <option value="active">🟢 Hoạt động</option>
              <option value="inactive">🔴 Ngưng hoạt động</option>
              <option value="pending">🟡 Chờ duyệt</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Cập nhật
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
