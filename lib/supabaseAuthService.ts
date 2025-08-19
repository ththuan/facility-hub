// Supabase Authentication Service
// This service handles user authentication using the Supabase database

import { supabaseBrowser } from './supabaseClient';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  department: string;
  phone?: string;
  position?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  name: string;
  display_name: string;
  level: number;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  display_name: string;
  module: string;
  actions: string[];
}

export interface LoginSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  full_name: string;
  password: string;
  role_id: string;
  department: string;
  phone?: string;
  position?: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  full_name?: string;
  role_id?: string;
  department?: string;
  phone?: string;
  position?: string;
  status?: 'active' | 'inactive' | 'suspended';
}

export class SupabaseAuthService {
  private static getSupabase() {
    return supabaseBrowser();
  }

  // Authentication methods
  static async login(username: string, password: string): Promise<{ 
    success: boolean; 
    user?: User; 
    token?: string;
    message: string 
  }> {
    const supabase = this.getSupabase();
    
    try {
      // Get user first - simplified query to avoid join issues
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('status', 'active')
        .single();

      if (userError || !userData) {
        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
      }

      // Verify password - use sync method for consistency
      const isPasswordValid = bcrypt.compareSync(password, userData.password_hash);
      
      if (!isPasswordValid) {
        return { success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng' };
      }

      // Create session token
      const token = this.generateToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 8); // 8 hours

      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: userData.id,
          token: token,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session creation error:', sessionError);
        return { success: false, message: 'Lỗi tạo phiên đăng nhập' };
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

      // Get user's role and permissions separately
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permissions (*)
          )
        `)
        .eq('id', userData.role_id)
        .single();

      if (roleError || !roleData) {
        console.error('Role fetch error:', roleError);
        return { success: false, message: 'Lỗi tải thông tin vai trò người dùng' };
      }

      // Format user data
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        role: {
          id: roleData.id,
          name: roleData.name,
          display_name: roleData.display_name,
          level: roleData.level,
          permissions: roleData.role_permissions?.map((rp: any) => rp.permissions) || [],
          created_at: roleData.created_at,
          updated_at: roleData.updated_at
        },
        department: userData.department,
        phone: userData.phone,
        position: userData.position,
        avatar: userData.avatar,
        status: userData.status,
        last_login: userData.last_login,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      // Store session in localStorage for client-side access
      if (typeof window !== 'undefined') {
        localStorage.setItem('facilityHub_session', JSON.stringify({
          token,
          userId: userData.id,
          expiresAt: expiresAt.toISOString()
        }));
      }

      return { success: true, user, token, message: 'Đăng nhập thành công' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }

  static async logout(): Promise<void> {
    const supabase = this.getSupabase();
    
    if (typeof window !== 'undefined') {
      const sessionData = localStorage.getItem('facilityHub_session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        
        // Delete session from database
        await supabase
          .from('user_sessions')
          .delete()
          .eq('token', session.token);

        // Remove from localStorage
        localStorage.removeItem('facilityHub_session');
      }
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    if (typeof window === 'undefined') return null;

    const sessionData = localStorage.getItem('facilityHub_session');
    if (!sessionData) return null;

    try {
      const session = JSON.parse(sessionData);
      
      // Check if session is expired
      if (new Date(session.expiresAt) <= new Date()) {
        await this.logout();
        return null;
      }

      const supabase = this.getSupabase();
      
      // Verify session in database and get user data
      const { data: sessionRecord, error: sessionError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('token', session.token)
        .eq('user_id', session.userId)
        .single();

      if (sessionError || !sessionRecord) {
        await this.logout();
        return null;
      }

      // Get user with role and permissions
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          roles!inner (
            *,
            role_permissions (
              permissions (*)
            )
          )
        `)
        .eq('id', session.userId)
        .eq('status', 'active')
        .single();

      if (userError || !userData) {
        await this.logout();
        return null;
      }

      // Format user data
      const user: User = {
        id: userData.id,
        username: userData.username,
        email: userData.email,
        full_name: userData.full_name,
        role: {
          id: userData.roles.id,
          name: userData.roles.name,
          display_name: userData.roles.display_name,
          level: userData.roles.level,
          permissions: userData.roles.role_permissions.map((rp: any) => rp.permissions),
          created_at: userData.roles.created_at,
          updated_at: userData.roles.updated_at
        },
        department: userData.department,
        phone: userData.phone,
        position: userData.position,
        avatar: userData.avatar,
        status: userData.status,
        last_login: userData.last_login,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };

      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      await this.logout();
      return null;
    }
  }

  // User management methods
  static async getAllUsers(): Promise<User[]> {
    const supabase = this.getSupabase();
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        roles (
          *,
          role_permissions (
            permissions (*)
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }

    return data.map(userData => ({
      id: userData.id,
      username: userData.username,
      email: userData.email,
      full_name: userData.full_name,
      role: {
        id: userData.roles.id,
        name: userData.roles.name,
        display_name: userData.roles.display_name,
        level: userData.roles.level,
        permissions: userData.roles.role_permissions.map((rp: any) => rp.permissions),
        created_at: userData.roles.created_at,
        updated_at: userData.roles.updated_at
      },
      department: userData.department,
      phone: userData.phone,
      position: userData.position,
      avatar: userData.avatar,
      status: userData.status,
      last_login: userData.last_login,
      created_at: userData.created_at,
      updated_at: userData.updated_at
    }));
  }

  static async createUser(userData: CreateUserData): Promise<{ 
    success: boolean; 
    user?: User; 
    message: string 
  }> {
    const supabase = this.getSupabase();

    try {
      // Check if username exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', userData.username)
        .single();

      if (existingUser) {
        return { success: false, message: 'Tên đăng nhập đã tồn tại' };
      }

      // Check if email exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingEmail) {
        return { success: false, message: 'Email đã tồn tại' };
      }

      // Hash password - use sync method for consistency with admin user
      const passwordHash = bcrypt.hashSync(userData.password, 10);

      // Verify the hash works immediately after creation
      const testVerify = bcrypt.compareSync(userData.password, passwordHash);

      // Create user
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          username: userData.username,
          email: userData.email,
          full_name: userData.full_name,
          password_hash: passwordHash,
          role_id: userData.role_id,
          department: userData.department,
          phone: userData.phone,
          position: userData.position,
          status: 'active' // Explicitly set status to active
        })
        .select('*')
        .single();

      if (error) {
        console.error('Create user error:', error);
        return { success: false, message: 'Lỗi tạo người dùng' };
      }

      // Get role separately to avoid join issues
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select(`
          *,
          role_permissions (
            permissions (*)
          )
        `)
        .eq('id', newUser.role_id)
        .single();

      if (roleError || !roleData) {
        console.error('Role fetch error:', roleError);
        return { success: false, message: 'Lỗi tải thông tin vai trò' };
      }

      const user: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        full_name: newUser.full_name,
        role: {
          id: roleData.id,
          name: roleData.name,
          display_name: roleData.display_name,
          level: roleData.level,
          permissions: roleData.role_permissions?.map((rp: any) => rp.permissions) || [],
          created_at: roleData.created_at,
          updated_at: roleData.updated_at
        },
        department: newUser.department,
        phone: newUser.phone,
        position: newUser.position,
        avatar: newUser.avatar,
        status: newUser.status,
        last_login: newUser.last_login,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      };

      return { success: true, user, message: 'Tạo người dùng thành công' };
    } catch (error) {
      console.error('Create user error:', error);
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }

  static async updateUser(userId: string, updates: UpdateUserData): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    const supabase = this.getSupabase();

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Update user error:', error);
        return { success: false, message: 'Lỗi cập nhật người dùng' };
      }

      return { success: true, message: 'Cập nhật người dùng thành công' };
    } catch (error) {
      console.error('Update user error:', error);
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }

  static async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    const supabase = this.getSupabase();

    try {
      // Delete user sessions first
      await supabase
        .from('user_sessions')
        .delete()
        .eq('user_id', userId);

      // Delete user
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        console.error('Delete user error:', error);
        return { success: false, message: 'Lỗi xóa người dùng' };
      }

      return { success: true, message: 'Xóa người dùng thành công' };
    } catch (error) {
      console.error('Delete user error:', error);
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }

  // Role management methods
  static async getAllRoles(): Promise<UserRole[]> {
    const supabase = this.getSupabase();
    
    const { data, error } = await supabase
      .from('roles')
      .select(`
        *,
        role_permissions (
          permissions (*)
        )
      `)
      .order('level', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return [];
    }

    return data.map(role => ({
      id: role.id,
      name: role.name,
      display_name: role.display_name,
      level: role.level,
      permissions: role.role_permissions.map((rp: any) => rp.permissions),
      created_at: role.created_at,
      updated_at: role.updated_at
    }));
  }

  // Permission methods
  static async hasPermission(userId: string, module: string, action: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;

    return user.role.permissions.some(permission => 
      permission.module === module && permission.actions.includes(action)
    );
  }

  static async isAdmin(userId?: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user?.role.name === 'admin' || false;
  }

  // Utility methods
  private static generateToken(): string {
    return Math.random().toString(36).substr(2) + Date.now().toString(36);
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    const supabase = this.getSupabase();

    try {
      // Get current user data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('password_hash')
        .eq('id', userId)
        .single();

      if (userError || !userData) {
        return { success: false, message: 'Không tìm thấy người dùng' };
      }

      // Verify old password - use sync method for consistency
      const isOldPasswordValid = bcrypt.compareSync(oldPassword, userData.password_hash);
      if (!isOldPasswordValid) {
        return { success: false, message: 'Mật khẩu cũ không đúng' };
      }

      // Hash new password - use sync method for consistency
      const newPasswordHash = bcrypt.hashSync(newPassword, 10);

      // Update password
      const { error } = await supabase
        .from('users')
        .update({ password_hash: newPasswordHash })
        .eq('id', userId);

      if (error) {
        console.error('Change password error:', error);
        return { success: false, message: 'Lỗi đổi mật khẩu' };
      }

      return { success: true, message: 'Đổi mật khẩu thành công' };
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }

  // Clean up expired sessions
  static async cleanExpiredSessions(): Promise<void> {
    const supabase = this.getSupabase();
    
    await supabase
      .from('user_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
  }

  // Fix user password hash format
  static async fixUserPassword(username: string, newPassword: string): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    const supabase = this.getSupabase();

    try {
      // Get user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, username, password_hash')
        .eq('username', username)
        .single();

      if (userError || !userData) {
        return { success: false, message: 'User not found' };
      }

      console.log('Current hash format:', userData.password_hash.substring(0, 4));

      // Create new hash with bcryptjs
      const newHash = bcrypt.hashSync(newPassword, 10);
      console.log('New hash format:', newHash.substring(0, 4));

      // Test the new hash
      const testVerify = bcrypt.compareSync(newPassword, newHash);
      console.log('New hash verification:', testVerify);

      // Update password
      const { error: updateError } = await supabase
        .from('users')
        .update({ password_hash: newHash })
        .eq('id', userData.id);

      if (updateError) {
        console.error('Password update error:', updateError);
        return { success: false, message: 'Failed to update password' };
      }

      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      console.error('Fix password error:', error);
      return { success: false, message: 'System error' };
    }
  }

  // Reset password for a user (admin function)
  static async resetUserPassword(username: string, newPassword: string): Promise<{ 
    success: boolean; 
    message: string 
  }> {
    const supabase = this.getSupabase();

    try {
      // Hash new password - use sync method for consistency
      const passwordHash = bcrypt.hashSync(newPassword, 10);
      console.log('Resetting password for user:', username, 'Hash length:', passwordHash.length);

      // Update password
      const { data, error } = await supabase
        .from('users')
        .update({ password_hash: passwordHash })
        .eq('username', username)
        .select('username')
        .single();

      if (error) {
        console.error('Reset password error:', error);
        return { success: false, message: 'Lỗi reset mật khẩu: ' + error.message };
      }

      if (!data) {
        return { success: false, message: 'Không tìm thấy user' };
      }

      console.log('Password reset successful for user:', data.username);
      return { success: true, message: 'Reset mật khẩu thành công' };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, message: 'Lỗi hệ thống' };
    }
  }
}

// Export singleton instance
export const supabaseAuthService = new SupabaseAuthService();
