// Local Storage utilities for Facility Hub
export interface Device {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  image?: string; // URL hoặc base64 của hình ảnh
  purchaseYear?: number;
  warrantyUntil?: string;
  roomId?: string;
  status: 'Tốt' | 'Đang bảo trì' | 'Hư';
  quantity: number;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  code: string;
  name: string;
  area?: number;
  capacity?: number;
  type?: string;
  floor?: string;
  building?: string;
  description?: string;
  status: 'Hoạt động' | 'Bảo trì' | 'Ngưng sử dụng';
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description?: string;
  roomId?: string;
  deviceId?: string;
  priority: 'Thấp' | 'Trung bình' | 'Cao';
  status: 'Mở' | 'Đang xử lý' | 'Hoàn thành' | 'Đóng';
  assignee?: string;
  dueDate?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  type: 'Hợp đồng' | 'Báo giá' | 'Bàn giao' | 'Quy trình' | 'Khác';
  description?: string;
  filePath?: string;
  tags?: string[];
  deviceId?: string;
  relatedRoomId?: string;
  uploadedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Chưa bắt đầu' | 'Đang thực hiện' | 'Hoàn thành';
  dueDate?: string;
  priority: 'Thấp' | 'Trung bình' | 'Cao';
  assignee?: string;
  workOrderId?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Note {
  id: string;
  title?: string;
  content: string;
  tags: string[];
  linkedRoomId?: string;
  linkedDeviceId?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Generic localStorage operations
class LocalStorageManager<T extends { id: string; createdAt: string; updatedAt: string }> {
  private storageKey: string;

  constructor(storageKey: string) {
    this.storageKey = storageKey;
  }

  getAll(): T[] {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): T | null {
    const items = this.getAll();
    return items.find(item => item.id === id) || null;
  }

  create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): T {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as T;

    const items = this.getAll();
    items.push(newItem);
    this.save(items);
    return newItem;
  }

  update(id: string, updates: Partial<Omit<T, 'id' | 'createdAt'>>): T | null {
    const items = this.getAll();
    const index = items.findIndex(item => item.id === id);
    
    if (index === -1) return null;

    const updatedItem = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    items[index] = updatedItem;
    this.save(items);
    return updatedItem;
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filteredItems = items.filter(item => item.id !== id);
    
    if (filteredItems.length === items.length) return false;
    
    this.save(filteredItems);
    return true;
  }

  search(query: string): T[] {
    const items = this.getAll();
    const lowerQuery = query.toLowerCase();
    
    return items.filter(item => 
      JSON.stringify(item).toLowerCase().includes(lowerQuery)
    );
  }

  private save(items: T[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  // Initialize with sample data if empty
  initializeSampleData(sampleData: T[]): void {
    if (this.getAll().length === 0) {
      this.save(sampleData);
    }
  }
}

// Create managers for each data type
export const deviceManager = new LocalStorageManager<Device>('facility-hub-devices');
export const roomManager = new LocalStorageManager<Room>('facility-hub-rooms');
export const workOrderManager = new LocalStorageManager<WorkOrder>('facility-hub-work-orders');
export const documentManager = new LocalStorageManager<Document>('facility-hub-documents');
export const taskManager = new LocalStorageManager<Task>('facility-hub-tasks');
export const noteManager = new LocalStorageManager<Note>('facility-hub-notes');

// Initialize sample data
export const initializeSampleData = () => {
  // Sample rooms
  roomManager.initializeSampleData([
    {
      id: '1',
      code: 'R001',
      name: 'Phòng Giám đốc',
      area: 25,
      capacity: 1,
      type: 'Văn phòng',
      floor: '3',
      building: 'Tòa A',
      description: 'Phòng làm việc của giám đốc',
      status: 'Hoạt động',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      code: 'R002',
      name: 'Phòng Kế toán',
      area: 30,
      capacity: 5,
      type: 'Văn phòng',
      floor: '2',
      building: 'Tòa A',
      description: 'Phòng kế toán và tài chính',
      status: 'Hoạt động',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      code: 'R003',
      name: 'Phòng IT',
      area: 40,
      capacity: 8,
      type: 'Văn phòng',
      floor: '1',
      building: 'Tòa A',
      description: 'Phòng công nghệ thông tin',
      status: 'Hoạt động',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      code: 'R004',
      name: 'Phòng họp lớn',
      area: 60,
      capacity: 20,
      type: 'Phòng họp',
      floor: '2',
      building: 'Tòa A',
      description: 'Phòng họp chính của công ty',
      status: 'Hoạt động',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '5',
      code: 'R005',
      name: 'Phòng nhân sự',
      area: 25,
      capacity: 3,
      type: 'Văn phòng',
      floor: '2',
      building: 'Tòa A',
      description: 'Phòng quản lý nhân sự',
      status: 'Hoạt động',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '6',
      code: 'R006',
      name: 'Kho thiết bị',
      area: 50,
      capacity: 0,
      type: 'Kho',
      floor: '1',
      building: 'Tòa B',
      description: 'Kho lưu trữ thiết bị văn phòng',
      status: 'Bảo trì',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ]);

  // Sample devices
  deviceManager.initializeSampleData([
    {
      id: '1',
      code: 'DEV001',
      name: 'Máy tính để bàn Dell OptiPlex',
      category: 'Máy tính',
      unit: 'Chiếc',
      purchaseYear: 2023,
      warrantyUntil: '2026-01-01',
      roomId: '1',
      status: 'Tốt',
      quantity: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      code: 'DEV002',
      name: 'Máy in HP LaserJet',
      category: 'Thiết bị văn phòng',
      unit: 'Chiếc',
      purchaseYear: 2022,
      warrantyUntil: '2025-06-01',
      roomId: '2',
      status: 'Tốt',
      quantity: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      code: 'DEV003',
      name: 'Máy chiếu Epson',
      category: 'Thiết bị trình chiếu',
      unit: 'Chiếc',
      purchaseYear: 2021,
      warrantyUntil: '2024-12-01',
      roomId: '3',
      status: 'Đang bảo trì',
      quantity: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ]);

  // Sample work orders
  workOrderManager.initializeSampleData([
    {
      id: '1',
      title: 'Bảo trì máy chiếu phòng họp',
      description: 'Máy chiếu bị mờ hình, cần vệ sinh và thay bóng đèn',
      deviceId: '3',
      priority: 'Cao',
      status: 'Đang xử lý',
      assignee: 'Nguyễn Văn A',
      dueDate: '2024-08-20',
      notes: 'Cần đặt mua bóng đèn mới',
      createdAt: '2024-08-15T00:00:00Z',
      updatedAt: '2024-08-15T00:00:00Z',
    },
    {
      id: '2',
      title: 'Kiểm tra máy in phòng kế toán',
      description: 'Máy in có tiếng ồn bất thường',
      deviceId: '2',
      priority: 'Trung bình',
      status: 'Mở',
      assignee: 'Lê Thị C',
      dueDate: '2024-08-25',
      notes: 'Kiểm tra lịch bảo trì định kỳ',
      createdAt: '2024-08-15T00:00:00Z',
      updatedAt: '2024-08-15T00:00:00Z',
    },
    {
      id: '3',
      title: 'Cài đặt phần mềm server mới',
      description: 'Cài đặt và cấu hình hệ điều hành cho server Dell',
      deviceId: '5',
      priority: 'Thấp',
      status: 'Hoàn thành',
      assignee: 'Phạm Minh D',
      dueDate: '2024-08-10',
      notes: 'Đã hoàn thành, hệ thống đang hoạt động ổn định',
      createdAt: '2024-08-01T00:00:00Z',
      updatedAt: '2024-08-10T00:00:00Z',
    },
  ]);

  // Sample tasks
  taskManager.initializeSampleData([
    {
      id: '1',
      title: 'Mua bóng đèn máy chiếu',
      description: 'Đặt mua bóng đèn thay thế cho máy chiếu phòng họp',
      status: 'Hoàn thành',
      dueDate: '2024-08-16',
      priority: 'Trung bình',
      assignee: 'Nguyễn Văn A',
      workOrderId: '1',
      notes: 'Đã đặt mua và nhận được bóng đèn',
      createdAt: '2024-08-15T00:00:00Z',
      updatedAt: '2024-08-16T00:00:00Z',
    },
    {
      id: '2',
      title: 'Vệ sinh máy chiếu',
      description: 'Vệ sinh bên trong máy chiếu và thay bóng đèn mới',
      status: 'Đang thực hiện',
      dueDate: '2024-08-20',
      priority: 'Trung bình',
      assignee: 'Nguyễn Văn A',
      workOrderId: '1',
      notes: 'Đã có bóng đèn, chuẩn bị vệ sinh',
      createdAt: '2024-08-15T00:00:00Z',
      updatedAt: '2024-08-17T00:00:00Z',
    },
    {
      id: '3',
      title: 'Kiểm tra máy in phòng kế toán',
      description: 'Kiểm tra và khắc phục tiếng ồn bất thường từ máy in',
      status: 'Chưa bắt đầu',
      dueDate: '2024-08-25',
      priority: 'Thấp',
      assignee: 'Lê Thị C',
      workOrderId: '2',
      notes: 'Chờ sắp xếp lịch kiểm tra',
      createdAt: '2024-08-15T00:00:00Z',
      updatedAt: '2024-08-15T00:00:00Z',
    },
  ]);

  // Sample documents
  documentManager.initializeSampleData([
    {
      id: '1',
      title: 'Hợp đồng mua máy tính Dell',
      type: 'Hợp đồng',
      description: 'Hợp đồng mua sắm máy tính Dell OptiPlex cho phòng Giám đốc',
      filePath: 'docs/2023/contracts/dell-contract.pdf',
      tags: ['hợp đồng', 'Dell', 'máy tính'],
      deviceId: '1',
      uploadedBy: 'Admin',
      createdAt: '2023-01-15T00:00:00Z',
      updatedAt: '2023-01-15T00:00:00Z',
    },
    {
      id: '2',
      title: 'Sổ tay bảo hành máy in HP',
      type: 'Bàn giao',
      description: 'Tài liệu hướng dẫn sử dụng và bảo hành máy in HP LaserJet',
      filePath: 'docs/2022/manuals/hp-warranty.pdf',
      tags: ['bảo hành', 'HP', 'máy in'],
      deviceId: '2',
      uploadedBy: 'Admin',
      createdAt: '2022-06-01T00:00:00Z',
      updatedAt: '2022-06-01T00:00:00Z',
    },
    {
      id: '3',
      title: 'Báo giá bảo trì máy lạnh',
      type: 'Báo giá',
      description: 'Báo giá dịch vụ bảo trì và sửa chữa hệ thống máy lạnh văn phòng',
      filePath: 'docs/2024/quotes/ac-maintenance-quote.pdf',
      tags: ['báo giá', 'bảo trì', 'máy lạnh'],
      uploadedBy: 'Technician',
      createdAt: '2024-07-20T00:00:00Z',
      updatedAt: '2024-07-20T00:00:00Z',
    },
  ]);
};
