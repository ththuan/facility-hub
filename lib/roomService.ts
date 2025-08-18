// Room service để quản lý phòng, khoa, lớp học
import { supabaseBrowser } from './supabaseClient';

export interface Room {
  id?: string;
  code: string;
  name: string;
  area?: number;
  capacity?: number;
  type?: string;
  floor?: string;
  building?: string;
  description?: string;
  status: 'Hoạt động' | 'Bảo trì' | 'Tạm dừng';
  department?: string;
  equipment?: string;
  note?: string;
  created_at?: string;
  updated_at?: string;
}

export class RoomService {
  private static getSupabase() {
    return supabaseBrowser();
  }

  static async getAllRooms(): Promise<Room[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching rooms:', error);
      throw error;
    }
    
    return data || [];
  }

  static async getRoomById(id: string): Promise<Room | null> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
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

  static async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('rooms')
      .insert([room])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating room:', error);
      throw error;
    }
    
    return data;
  }

  static async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating room:', error);
      throw error;
    }
    
    return data;
  }

  static async deleteRoom(id: string): Promise<boolean> {
    const supabase = this.getSupabase();
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting room:', error);
      return false;
    }
    
    return true;
  }

  static async getRoomsByStatus(status: string): Promise<Room[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching rooms by status:', error);
      throw error;
    }
    
    return data || [];
  }

  static async getRoomsByType(type: string): Promise<Room[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching rooms by type:', error);
      throw error;
    }
    
    return data || [];
  }

  static async searchRooms(query: string): Promise<Room[]> {
    const supabase = this.getSupabase();
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .or(`name.ilike.%${query}%,code.ilike.%${query}%,building.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error searching rooms:', error);
      throw error;
    }
    
    return data || [];
  }

  // Statistics methods
  static async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    totalCapacity: number;
    totalArea: number;
  }> {
    try {
      const rooms = await this.getAllRooms();
      
      const stats = {
        total: rooms.length,
        byStatus: {} as Record<string, number>,
        byType: {} as Record<string, number>,
        totalCapacity: 0,
        totalArea: 0,
      };

      rooms.forEach(room => {
        // Status stats
        if (room.status) {
          stats.byStatus[room.status] = (stats.byStatus[room.status] || 0) + 1;
        }

        // Type stats
        if (room.type) {
          stats.byType[room.type] = (stats.byType[room.type] || 0) + 1;
        }

        // Capacity and area
        stats.totalCapacity += room.capacity || 0;
        stats.totalArea += room.area || 0;
      });

      return stats;
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        total: 0,
        byStatus: {},
        byType: {},
        totalCapacity: 0,
        totalArea: 0,
      };
    }
  }
}

export const roomService = new RoomService();
