import { supabaseBrowser } from './supabaseClient';

export interface Device {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  image?: string;
  purchase_year?: number;
  warranty_until?: string;
  room_id?: string;
  status: 'Tốt' | 'Đang bảo trì' | 'Hư';
  quantity: number;
  meta?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  area?: string;
  capacity?: number;
  note?: string;
  created_at: string;
  updated_at: string;
}

class DeviceService {
  private supabase = supabaseBrowser();

  async getAllDevices(): Promise<Device[]> {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching devices:', error);
      return [];
    }

    return data || [];
  }

  async getDeviceById(id: string): Promise<Device | null> {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching device:', error);
      return null;
    }

    return data;
  }

  async createDevice(device: Omit<Device, 'id' | 'code' | 'created_at' | 'updated_at'>): Promise<Device | null> {
    const { data, error } = await this.supabase
      .from('devices')
      .insert([{
        name: device.name,
        category: device.category,
        unit: device.unit,
        image: device.image,
        purchase_year: device.purchase_year,
        warranty_until: device.warranty_until,
        room_id: device.room_id,
        status: device.status,
        quantity: device.quantity,
        meta: device.meta || {}
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating device:', error);
      return null;
    }

    return data;
  }

  async updateDevice(id: string, updates: Partial<Omit<Device, 'id' | 'created_at' | 'updated_at'>>): Promise<Device | null> {
    const { data, error } = await this.supabase
      .from('devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating device:', error);
      return null;
    }

    return data;
  }

  async deleteDevice(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('devices')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting device:', error);
      return false;
    }

    return true;
  }

  async searchDevices(query: string): Promise<Device[]> {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching devices:', error);
      return [];
    }

    return data || [];
  }

  async getDevicesByRoom(roomId: string): Promise<Device[]> {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching devices by room:', error);
      return [];
    }

    return data || [];
  }

  async getDevicesByCategory(category: string): Promise<Device[]> {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching devices by category:', error);
      return [];
    }

    return data || [];
  }

  async getDevicesByStatus(status: Device['status']): Promise<Device[]> {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching devices by status:', error);
      return [];
    }

    return data || [];
  }

  // Upload device image to Supabase Storage
  async uploadDeviceImage(file: File, deviceId: string): Promise<string | null> {
    const fileName = `devices/${deviceId}/${Date.now()}-${file.name}`;
    
    const { data, error } = await this.supabase.storage
      .from('device-images')
      .upload(fileName, file);

    if (error) {
      console.error('Error uploading device image:', error);
      return null;
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('device-images')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  }

  // Delete device image from Supabase Storage
  async deleteDeviceImage(imagePath: string): Promise<boolean> {
    // Extract file path from URL
    const fileName = imagePath.split('/').pop();
    if (!fileName) return false;

    const { error } = await this.supabase.storage
      .from('device-images')
      .remove([fileName]);

    if (error) {
      console.error('Error deleting device image:', error);
      return false;
    }

    return true;
  }
}

class RoomService {
  private supabase = supabaseBrowser();

  async getAllRooms(): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .order('code', { ascending: true });

    if (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }

    return data || [];
  }

  async getRoomById(id: string): Promise<Room | null> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return null;
    }

    return data;
  }
}

export const deviceService = new DeviceService();
export const roomService = new RoomService();
