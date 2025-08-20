// Build-safe SupabaseService that returns mock data during Docker build
export interface Document {
  id: string;
  title: string;
  type: 'contract' | 'quote' | 'handover' | 'procedure' | 'other';
  description?: string;
  tags: string[];
  deviceId?: string;
  filePath: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  image?: string;
  purchaseYear?: number;
  warrantyUntil?: string;
  roomId?: string;
  status: 'good' | 'maintenance' | 'broken' | 'repairing';
  quantity: number;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  description?: string;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'doing' | 'done';
  priority: 'low' | 'med' | 'high';
  assignee?: string;
  dueDate?: string;
  workOrderId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkOrder {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'working' | 'completed';
  priority: 'low' | 'med' | 'high';
  deviceId?: string;
  assignee?: string;
  reporter?: string;
  scheduledDate?: string;
  completedDate?: string;
  cost?: number;
  estimatedHours?: number;
  actualHours?: number;
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalPrice?: number;
  supplier?: string;
  status: 'requested' | 'pending' | 'ordered' | 'received' | 'cancelled';
  requestedBy?: string;
  approvedBy?: string;
  requestDate: string;
  deliveryDate?: string;
  notes?: string;
  category?: string;
  specifications?: Record<string, any>;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

class SupabaseService {
  // Always return empty arrays during build to prevent API calls
  async getDocuments(): Promise<Document[]> { return []; }
  async getDevices(): Promise<Device[]> { return []; }
  async getRooms(): Promise<Room[]> { return []; }
  async getTasks(): Promise<Task[]> { return []; }
  async getWorkOrders(): Promise<WorkOrder[]> { return []; }
  async getProcurementItems(): Promise<ProcurementItem[]> { return []; }
  
  async createDocument(_: any): Promise<Document | null> { return null; }
  async createDevice(_: any): Promise<Device | null> { return null; }
  async createRoom(_: any): Promise<Room | null> { return null; }
  async createTask(_: any): Promise<Task | null> { return null; }
  async createWorkOrder(_: any): Promise<WorkOrder | null> { return null; }
  async createProcurementItem(_: any): Promise<ProcurementItem | null> { return null; }
  
  // Update methods
  async updateDocument(_id: string, _data: any): Promise<Document | null> { return null; }
  async updateDevice(_id: string, _data: any): Promise<Device | null> { return null; }
  async updateRoom(_id: string, _data: any): Promise<Room | null> { return null; }
  async updateTask(_id: string, _data: any): Promise<Task | null> { return null; }
  async updateWorkOrder(_id: string, _data: any): Promise<WorkOrder | null> { return null; }
  async updateProcurementItem(_id: string, _data: any): Promise<ProcurementItem | null> { return null; }
  
  // Delete methods
  async deleteDocument(_id: string): Promise<boolean> { return false; }
  async deleteDevice(_id: string): Promise<boolean> { return false; }
  async deleteRoom(_id: string): Promise<boolean> { return false; }
  async deleteTask(_id: string): Promise<boolean> { return false; }
  async deleteWorkOrder(_id: string): Promise<boolean> { return false; }
  async deleteProcurementItem(_id: string): Promise<boolean> { return false; }
}

// Export singleton instance
export const supabaseService = new SupabaseService();
