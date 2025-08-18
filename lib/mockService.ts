// Mock service để demo các trang mà không cần kết nối Supabase thực

import { Device } from './deviceService';
import { ProcurementItem } from './procurementService';
import { Room } from './roomService';

// Mock data for rooms
const mockRooms: Room[] = [
  {
    id: '1',
    code: 'A101',
    name: 'Phòng học Khoa Công nghệ Thông tin',
    area: 80,
    capacity: 40,
    type: 'Phòng học',
    floor: '1',
    building: 'Tòa A',
    description: 'Phòng học chính cho khoa CNTT',
    status: 'Hoạt động',
    department: 'Khoa Công nghệ Thông tin',
    equipment: 'Máy chiếu, bảng thông minh, điều hòa',
    note: 'Phòng học lý thuyết',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    code: 'LAB201',
    name: 'Phòng thí nghiệm Hóa học',
    area: 60,
    capacity: 25,
    type: 'Phòng thí nghiệm',
    floor: '2',
    building: 'Tòa B',
    description: 'Phòng thí nghiệm hóa học cơ bản',
    status: 'Hoạt động',
    department: 'Khoa Hóa học',
    equipment: 'Bàn thí nghiệm, tủ hóa chất, hệ thống thông gió',
    note: 'Cần trang bị bảo hộ khi vào',
    created_at: '2024-01-02T00:00:00Z',
    updated_at: '2024-01-02T00:00:00Z'
  },
  {
    id: '3',
    code: 'C301',
    name: 'Phòng thực hành CNTT 1',
    area: 70,
    capacity: 35,
    type: 'Phòng thực hành công nghệ thông tin',
    floor: '3',
    building: 'Tòa C',
    description: 'Phòng thực hành lập trình và ứng dụng công nghệ thông tin',
    status: 'Bảo trì',
    department: 'Khoa Công nghệ Thông tin',
    equipment: 'Máy tính cá nhân, máy chiếu, bảng thông minh, mạng LAN tốc độ cao',
    note: 'Đang nâng cấp hệ thống máy tính',
    created_at: '2024-01-03T00:00:00Z',
    updated_at: '2024-01-03T00:00:00Z'
  },
  {
    id: '4',
    code: 'HALL01',
    name: 'Hội trường Đa năng',
    area: 200,
    capacity: 150,
    type: 'Hội trường',
    floor: '1',
    building: 'Tòa D',
    description: 'Hội trường tổ chức sự kiện lớn',
    status: 'Hoạt động',
    department: 'Phòng Tổ chức Sự kiện',
    equipment: 'Sân khấu, âm thanh chuyên nghiệp, đèn LED',
    note: 'Cần đặt lịch trước 1 tuần',
    created_at: '2024-01-04T00:00:00Z',
    updated_at: '2024-01-04T00:00:00Z'
  }
];

// Mock data for devices
const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Máy tính xách tay Dell',
    code: 'DELL_001',
    category: 'computer',
    unit: 'chiếc',
    room_id: '1',
    status: 'Tốt',
    quantity: 1,
    image: '',
    purchase_year: 2024,
    warranty_until: '2026-01-15',
    meta: { specifications: 'Intel Core i5, 8GB RAM, 256GB SSD', notes: 'Máy dành cho văn phòng' },
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z'
  },
  {
    id: '2',
    name: 'Máy in HP LaserJet',
    code: 'PRIN_001',
    category: 'printer',
    unit: 'chiếc',
    room_id: '2',
    status: 'Đang bảo trì',
    quantity: 1,
    image: '',
    purchase_year: 2024,
    warranty_until: '2025-02-01',
    meta: { specifications: 'In laser đơn sắc, A4', notes: 'Cần bảo trì định kỳ' },
    created_at: '2024-02-01T00:00:00Z',
    updated_at: '2024-02-01T00:00:00Z'
  }
];

// Mock data for procurement
const mockProcurementItems: ProcurementItem[] = [
  {
    id: '1',
    item_name: 'Máy tính để bàn gaming',
    category: 'fixed-assets',
    image: '',
    department_request_date: '2024-01-10',
    department_budget_date: '2024-01-15',
    requested_value: 25000000,
    selection_method: 'quotation',
    actual_payment_value: 24000000,
    notes: 'Dùng cho bộ phận thiết kế',
    status: 'completed',
    priority: 'high',
    department: 'IT',
    requested_by: 'Nguyễn Văn A',
    approved_by: 'Trần Văn B',
    purchase_date: '2024-02-15',
    warranty_period: 36,
    supplier: 'FPT Shop',
    specifications: 'Core i7, 16GB RAM, RTX 3060',
    quantity: 2,
    unit: 'chiếc',
    budget_year: 2024,
    created_at: '2024-01-10T00:00:00Z',
    updated_at: '2024-02-15T00:00:00Z'
  },
  {
    id: '2',
    item_name: 'Bàn làm việc văn phòng',
    category: 'tools-equipment',
    image: '',
    department_request_date: '2024-01-20',
    department_budget_date: '2024-01-25',
    requested_value: 5000000,
    selection_method: 'direct',
    notes: 'Bàn cho nhân viên mới',
    status: 'approved',
    priority: 'medium',
    department: 'HR',
    requested_by: 'Lê Thị C',
    quantity: 5,
    unit: 'chiếc',
    budget_year: 2024,
    created_at: '2024-01-20T00:00:00Z',
    updated_at: '2024-01-25T00:00:00Z'
  }
];

// Mock device service
export class MockDeviceService {
  private static devices = mockDevices;

  static async getAllDevices(): Promise<Device[]> {
    return Promise.resolve([...this.devices]);
  }

  static async getDeviceById(id: string): Promise<Device | null> {
    const device = this.devices.find(d => d.id === id);
    return Promise.resolve(device || null);
  }

  static async createDevice(device: Omit<Device, 'id' | 'created_at' | 'updated_at'>): Promise<Device> {
    const newDevice: Device = {
      ...device,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.devices.push(newDevice);
    return Promise.resolve(newDevice);
  }

  static async updateDevice(id: string, device: Partial<Device>): Promise<Device> {
    const index = this.devices.findIndex(d => d.id === id);
    if (index === -1) {
      throw new Error('Device not found');
    }
    
    this.devices[index] = {
      ...this.devices[index],
      ...device,
      updated_at: new Date().toISOString()
    };
    
    return Promise.resolve(this.devices[index]);
  }

  static async deleteDevice(id: string): Promise<boolean> {
    const index = this.devices.findIndex(d => d.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    
    this.devices.splice(index, 1);
    return Promise.resolve(true);
  }

  static async getDevicesByRoom(roomId: string): Promise<Device[]> {
    const devices = this.devices.filter(d => d.room_id === roomId);
    return Promise.resolve(devices);
  }

  static async searchDevices(query: string): Promise<Device[]> {
    const devices = this.devices.filter(d => 
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.code.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(devices);
  }
}

// Mock procurement service  
export class MockProcurementService {
  private static items = mockProcurementItems;

  static async getAllItems(): Promise<ProcurementItem[]> {
    return Promise.resolve([...this.items]);
  }

  static async getItemById(id: string): Promise<ProcurementItem | null> {
    const item = this.items.find(i => i.id === id);
    return Promise.resolve(item || null);
  }

  static async createItem(item: Omit<ProcurementItem, 'id' | 'created_at' | 'updated_at'>): Promise<ProcurementItem> {
    const newItem: ProcurementItem = {
      ...item,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.items.push(newItem);
    return Promise.resolve(newItem);
  }

  static async updateItem(id: string, item: Partial<ProcurementItem>): Promise<ProcurementItem> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    this.items[index] = {
      ...this.items[index],
      ...item,
      updated_at: new Date().toISOString()
    };
    
    return Promise.resolve(this.items[index]);
  }

  static async deleteItem(id: string): Promise<boolean> {
    const index = this.items.findIndex(i => i.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    
    this.items.splice(index, 1);
    return Promise.resolve(true);
  }

  static async getItemsByStatus(status: string): Promise<ProcurementItem[]> {
    const items = this.items.filter(i => i.status === status);
    return Promise.resolve(items);
  }

  static async getItemsByDepartment(department: string): Promise<ProcurementItem[]> {
    const items = this.items.filter(i => i.department.includes(department));
    return Promise.resolve(items);
  }

  static async getItemsByBudgetYear(year: number): Promise<ProcurementItem[]> {
    const items = this.items.filter(i => i.budget_year === year);
    return Promise.resolve(items);
  }

  static async searchItems(query: string): Promise<ProcurementItem[]> {
    const items = this.items.filter(i => 
      i.item_name.toLowerCase().includes(query.toLowerCase()) ||
      i.department.toLowerCase().includes(query.toLowerCase())
    );
    return Promise.resolve(items);
  }

  static async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    totalValue: number;
    totalActualValue: number;
  }> {
    const items = this.items;
    
    const byStatus: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    let totalValue = 0;
    let totalActualValue = 0;
    
    items.forEach(item => {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byCategory[item.category] = (byCategory[item.category] || 0) + 1;
      totalValue += item.requested_value || 0;
      totalActualValue += item.actual_payment_value || 0;
    });
    
    return Promise.resolve({
      total: items.length,
      byStatus,
      byCategory,
      totalValue,
      totalActualValue
    });
  }
}

// Mock Room Service
export class MockRoomService {
  private static rooms: Room[] = [...mockRooms];

  static async getAllRooms(): Promise<Room[]> {
    return Promise.resolve([...this.rooms]);
  }

  static async getRoomById(id: string): Promise<Room | null> {
    const room = this.rooms.find(r => r.id === id);
    return Promise.resolve(room || null);
  }

  static async createRoom(room: Omit<Room, 'id' | 'created_at' | 'updated_at'>): Promise<Room> {
    const newRoom: Room = {
      ...room,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    this.rooms.unshift(newRoom);
    return Promise.resolve(newRoom);
  }

  static async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    const index = this.rooms.findIndex(r => r.id === id);
    if (index === -1) {
      throw new Error('Room not found');
    }
    
    this.rooms[index] = {
      ...this.rooms[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    return Promise.resolve(this.rooms[index]);
  }

  static async deleteRoom(id: string): Promise<boolean> {
    const index = this.rooms.findIndex(r => r.id === id);
    if (index === -1) {
      return Promise.resolve(false);
    }
    
    this.rooms.splice(index, 1);
    return Promise.resolve(true);
  }

  static async getRoomsByStatus(status: string): Promise<Room[]> {
    const rooms = this.rooms.filter(r => r.status === status);
    return Promise.resolve(rooms);
  }

  static async getRoomsByType(type: string): Promise<Room[]> {
    const rooms = this.rooms.filter(r => r.type === type);
    return Promise.resolve(rooms);
  }

  static async searchRooms(query: string): Promise<Room[]> {
    const rooms = this.rooms.filter(r => 
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.code.toLowerCase().includes(query.toLowerCase()) ||
      (r.building && r.building.toLowerCase().includes(query.toLowerCase()))
    );
    return Promise.resolve(rooms);
  }

  static async getStatistics(): Promise<{
    total: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    totalCapacity: number;
    totalArea: number;
  }> {
    const rooms = this.rooms;
    
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let totalCapacity = 0;
    let totalArea = 0;
    
    rooms.forEach(room => {
      byStatus[room.status] = (byStatus[room.status] || 0) + 1;
      if (room.type) {
        byType[room.type] = (byType[room.type] || 0) + 1;
      }
      totalCapacity += room.capacity || 0;
      totalArea += room.area || 0;
    });
    
    return Promise.resolve({
      total: rooms.length,
      byStatus,
      byType,
      totalCapacity,
      totalArea
    });
  }
}
