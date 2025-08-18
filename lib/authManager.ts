// Authentication and User Management System

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  password: string; // In production, this should be hashed
  role: UserRole;
  department: string;
  phone?: string;
  position?: string;
  avatar?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  permissions: Permission[];
  level: number; // 1 = Admin, 2 = Manager, 3 = Staff, 4 = Viewer
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  displayName: string;
  module: string; // devices, rooms, tasks, procurement, etc.
  actions: string[]; // create, read, update, delete, approve, etc.
}

export interface LoginSession {
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export class AuthManager {
  private users: User[] = [];
  private roles: UserRole[] = [];
  private permissions: Permission[] = [];
  private currentSession: LoginSession | null = null;
  
  private storageKeys = {
    users: 'facilityHub_users',
    roles: 'facilityHub_roles',
    permissions: 'facilityHub_permissions',
    session: 'facilityHub_session'
  };

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultData();
  }

  private loadFromStorage(): void {
    // Check if we're running in the browser
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      const usersData = localStorage.getItem(this.storageKeys.users);
      const rolesData = localStorage.getItem(this.storageKeys.roles);
      const permissionsData = localStorage.getItem(this.storageKeys.permissions);
      const sessionData = localStorage.getItem(this.storageKeys.session);

      if (usersData) this.users = JSON.parse(usersData);
      if (rolesData) this.roles = JSON.parse(rolesData);
      if (permissionsData) this.permissions = JSON.parse(permissionsData);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Check if session is still valid
        if (new Date(session.expiresAt) > new Date()) {
          this.currentSession = session;
        } else {
          localStorage.removeItem(this.storageKeys.session);
        }
      }
    } catch (error) {
      console.error('Error loading auth data:', error);
    }
  }

  private saveToStorage(): void {
    // Check if we're running in the browser
    if (typeof window === 'undefined') {
      return;
    }
    
    try {
      localStorage.setItem(this.storageKeys.users, JSON.stringify(this.users));
      localStorage.setItem(this.storageKeys.roles, JSON.stringify(this.roles));
      localStorage.setItem(this.storageKeys.permissions, JSON.stringify(this.permissions));
      if (this.currentSession) {
        localStorage.setItem(this.storageKeys.session, JSON.stringify(this.currentSession));
      }
    } catch (error) {
      console.error('Error saving auth data:', error);
    }
  }

  private initializeDefaultData(): void {
    if (this.permissions.length === 0) {
      this.initializePermissions();
    }
    if (this.roles.length === 0) {
      this.initializeRoles();
    }
    if (this.users.length === 0) {
      this.initializeUsers();
    }
  }

  private initializePermissions(): void {
    const modules = [
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'devices', name: 'Thiết bị' },
      { id: 'rooms', name: 'Phòng ban' },
      { id: 'tasks', name: 'Công việc' },
      { id: 'procurement', name: 'Mua sắm' },
      { id: 'documents', name: 'Tài liệu' },
      { id: 'calendar', name: 'Lịch' },
      { id: 'reports', name: 'Báo cáo' },
      { id: 'users', name: 'Người dùng' },
      { id: 'settings', name: 'Cài đặt' }
    ];

    const actions = [
      'create', 'read', 'update', 'delete', 'approve', 'export', 'import'
    ];

    this.permissions = modules.flatMap(module => 
      actions.map(action => ({
        id: `${module.id}_${action}`,
        name: `${module.id}_${action}`,
        displayName: `${action} ${module.name}`,
        module: module.id,
        actions: [action]
      }))
    );

    this.saveToStorage();
  }

  private initializeRoles(): void {
    const now = new Date().toISOString();

    // Admin role - toàn quyền
    const adminPermissions = this.permissions.map(p => p);
    
    // Viewer role - chỉ được xem, không được thao tác
    const viewerPermissions = this.permissions.filter(p => 
      p.actions.includes('read')
    );

    this.roles = [
      {
        id: '1',
        name: 'admin',
        displayName: 'Quản trị viên',
        permissions: adminPermissions,
        level: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        id: '2',
        name: 'viewer',
        displayName: 'Nhân viên',
        permissions: viewerPermissions,
        level: 4,
        createdAt: now,
        updatedAt: now
      }
    ];

    this.saveToStorage();
  }

  private initializeUsers(): void {
    const now = new Date().toISOString();
    const adminRole = this.roles.find(r => r.name === 'admin')!;

    // Chỉ tạo một tài khoản admin duy nhất
    this.users = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@company.com',
        fullName: 'Quản trị hệ thống',
        password: 'admin123', // In production, hash this
        role: adminRole,
        department: 'IT',
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ];

    this.saveToStorage();
  }

  // Authentication methods
  async login(username: string, password: string): Promise<{ success: boolean; user?: User; message: string }> {
    const user = this.users.find(u => 
      (u.username === username || u.email === username) && 
      u.password === password && 
      u.isActive
    );

    if (!user) {
      return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
    }

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hours session

    this.currentSession = {
      userId: user.id,
      token: this.generateToken(),
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    };

    // Update last login
    user.lastLogin = new Date().toISOString();
    this.saveToStorage();

    return { success: true, user, message: 'Đăng nhập thành công' };
  }

  logout(): void {
    this.currentSession = null;
    localStorage.removeItem(this.storageKeys.session);
  }

  getCurrentUser(): User | null {
    if (!this.currentSession) return null;
    
    // Check if session is expired
    if (new Date(this.currentSession.expiresAt) <= new Date()) {
      this.logout();
      return null;
    }

    return this.users.find(u => u.id === this.currentSession!.userId) || null;
  }

  isLoggedIn(): boolean {
    return this.getCurrentUser() !== null;
  }

  hasPermission(module: string, action: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    return user.role.permissions.some(p => 
      p.module === module && p.actions.includes(action)
    );
  }

  hasRole(roleName: string): boolean {
    const user = this.getCurrentUser();
    return user?.role.name === roleName;
  }

  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  canAccess(requiredRole: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;

    const userLevel = user.role.level;
    const requiredRoleObj = this.roles.find(r => r.name === requiredRole);
    const requiredLevel = requiredRoleObj?.level || 999;

    return userLevel <= requiredLevel;
  }

  private generateToken(): string {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  // User management methods
  getAllUsers(): User[] {
    return this.users.map(u => ({ ...u, password: '***' })); // Don't expose passwords
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): { success: boolean; user?: User; message: string } {
    // Kiểm tra username đã tồn tại
    if (this.users.find(u => u.username === userData.username)) {
      return { success: false, message: 'Tên đăng nhập đã tồn tại' };
    }

    // Kiểm tra email đã tồn tại
    if (this.users.find(u => u.email === userData.email)) {
      return { success: false, message: 'Email đã tồn tại' };
    }

    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.saveToStorage();
    
    return { success: true, user: newUser, message: 'Tạo người dùng thành công' };
  }

  updateUser(id: string, updates: Partial<User>): { success: boolean; message: string } {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    // Nếu cập nhật password và password rỗng, giữ nguyên password cũ
    if (updates.password === '') {
      delete updates.password;
    }

    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage();
    return { success: true, message: 'Cập nhật người dùng thành công' };
  }

  deleteUser(id: string): { success: boolean; message: string } {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) {
      return { success: false, message: 'Không tìm thấy người dùng' };
    }

    this.users.splice(index, 1);
    this.saveToStorage();
    return { success: true, message: 'Xóa người dùng thành công' };
  }

  changePassword(userId: string, oldPassword: string, newPassword: string): boolean {
    const user = this.users.find(u => u.id === userId);
    if (!user || user.password !== oldPassword) return false;

    user.password = newPassword;
    user.updatedAt = new Date().toISOString();
    this.saveToStorage();
    return true;
  }

  // Role management methods
  getAllRoles(): UserRole[] {
    return this.roles;
  }

  getRoleById(id: string): UserRole | undefined {
    return this.roles.find(r => r.id === id);
  }

  createRole(roleData: Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>): UserRole {
    const newRole: UserRole = {
      ...roleData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.roles.push(newRole);
    this.saveToStorage();
    return newRole;
  }

  updateRole(id: string, updates: Partial<UserRole>): boolean {
    const index = this.roles.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.roles[index] = {
      ...this.roles[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.saveToStorage();
    return true;
  }

  deleteRole(id: string): boolean {
    // Don't allow deleting if users are using this role
    const usersWithRole = this.users.filter(u => u.role.id === id);
    if (usersWithRole.length > 0) return false;

    const index = this.roles.findIndex(r => r.id === id);
    if (index === -1) return false;

    this.roles.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  getAllPermissions(): Permission[] {
    return this.permissions;
  }

  // Utility methods
  getDepartments(): string[] {
    const departments = new Set(this.users.map(u => u.department));
    return Array.from(departments);
  }

  getUsersByDepartment(department: string): User[] {
    return this.users.filter(u => u.department === department);
  }

  getUsersByRole(roleId: string): User[] {
    return this.users.filter(u => u.role.id === roleId);
  }
}

// Create and export singleton instance
export const authManager = new AuthManager();
