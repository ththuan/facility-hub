import { supabaseBrowser } from './supabaseClient';

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
  roomId?: string;
  deviceId?: string;
  priority: 'low' | 'med' | 'high';
  status: 'open' | 'in_progress' | 'done';
  assignee?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementItem {
  id: string;
  itemName: string;
  category: 'fixed-assets' | 'tools-equipment';
  image?: string;
  departmentRequestDate: string;
  departmentBudgetDate: string;
  requestedValue: number;
  selectionMethod: 'tender' | 'quotation' | 'direct' | 'emergency';
  actualPaymentValue?: number;
  notes?: string;
  status: 'draft' | 'requested' | 'approved' | 'rejected' | 'purchased' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  requestedBy: string;
  approvedBy?: string;
  purchaseDate?: string;
  warrantyPeriod?: number;
  supplier?: string;
  specifications?: string;
  quantity: number;
  unit: string;
  budgetYear: number;
  createdAt: string;
  updatedAt: string;
}

// Simple service class focused on Google Drive upload functionality
class SupabaseService {
  private supabase = supabaseBrowser();

  // Documents
  async getDocuments(): Promise<Document[]> {
    const { data, error } = await this.supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents:', error);
      return [];
    }

    return data.map(doc => ({
      id: doc.id,
      title: doc.title,
      type: doc.type as Document['type'], // Direct type assertion
      description: doc.description || '',
      tags: doc.tags || [],
      deviceId: doc.related_device_id,
      filePath: doc.file_path,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
    }));
  }

  async createDocument(document: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Promise<Document | null> {
    const { data, error } = await this.supabase
      .from('documents')
      .insert({
        title: document.title,
        type: document.type,
        description: document.description,
        tags: document.tags,
        file_path: document.filePath,
        related_device_id: document.deviceId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      type: data.type as Document['type'],
      description: data.description,
      tags: data.tags,
      deviceId: data.related_device_id,
      filePath: data.file_path,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateDocument(id: string, updates: Partial<Omit<Document, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Document | null> {
    const updateData: any = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.tags) updateData.tags = updates.tags;
    if (updates.deviceId) updateData.related_device_id = updates.deviceId;
    if (updates.filePath) updateData.file_path = updates.filePath;
    if (updates.type) updateData.type = updates.type;

    const { data, error } = await this.supabase
      .from('documents')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      type: data.type as Document['type'],
      description: data.description,
      tags: data.tags,
      deviceId: data.related_device_id,
      filePath: data.file_path,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteDocument(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }

    return true;
  }

  // Devices
  async getDevices(): Promise<Device[]> {
    const { data, error } = await this.supabase
      .from('devices')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching devices:', error);
      return [];
    }

    return data.map(device => ({
      id: device.id,
      code: device.code,
      name: device.name,
      category: device.category,
      unit: device.unit,
      image: device.image,
      purchaseYear: device.purchase_year,
      warrantyUntil: device.warranty_until,
      roomId: device.room_id,
      status: device.status as Device['status'],
      quantity: device.quantity,
      meta: device.meta,
      createdAt: device.created_at,
      updatedAt: device.updated_at,
    }));
  }

  async createDevice(device: Omit<Device, 'id' | 'createdAt' | 'updatedAt'>): Promise<Device | null> {
    const { data, error } = await this.supabase
      .from('devices')
      .insert({
        code: device.code,
        name: device.name,
        category: device.category,
        unit: device.unit,
        image: device.image,
        purchase_year: device.purchaseYear,
        warranty_until: device.warrantyUntil,
        room_id: device.roomId,
        status: device.status,
        quantity: device.quantity,
        meta: device.meta,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating device:', error);
      return null;
    }

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      category: data.category,
      unit: data.unit,
      image: data.image,
      purchaseYear: data.purchase_year,
      warrantyUntil: data.warranty_until,
      roomId: data.room_id,
      status: data.status as Device['status'],
      quantity: data.quantity,
      meta: data.meta,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateDevice(id: string, updates: Partial<Omit<Device, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Device | null> {
    const updateData: any = {};
    if (updates.code) updateData.code = updates.code;
    if (updates.name) updateData.name = updates.name;
    if (updates.category) updateData.category = updates.category;
    if (updates.unit) updateData.unit = updates.unit;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.purchaseYear) updateData.purchase_year = updates.purchaseYear;
    if (updates.warrantyUntil !== undefined) updateData.warranty_until = updates.warrantyUntil;
    if (updates.roomId !== undefined) updateData.room_id = updates.roomId;
    if (updates.status) updateData.status = updates.status;
    if (updates.quantity) updateData.quantity = updates.quantity;
    if (updates.meta !== undefined) updateData.meta = updates.meta;

    const { data, error } = await this.supabase
      .from('devices')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating device:', error);
      return null;
    }

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      category: data.category,
      unit: data.unit,
      image: data.image,
      purchaseYear: data.purchase_year,
      warrantyUntil: data.warranty_until,
      roomId: data.room_id,
      status: data.status as Device['status'],
      quantity: data.quantity,
      meta: data.meta,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
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

  // Rooms
  async getRooms(): Promise<Room[]> {
    const { data, error } = await this.supabase
      .from('rooms')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }

    return data.map(room => ({
      id: room.id,
      name: room.name,
      code: room.code,
      description: room.description,
      meta: room.meta,
      createdAt: room.created_at,
      updatedAt: room.updated_at,
    }));
  }

  // Tasks
  async getTasks(): Promise<Task[]> {
    const { data, error } = await this.supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return data.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status as Task['status'],
      priority: task.priority as Task['priority'],
      assignee: task.assignee,
      dueDate: task.due_date,
      workOrderId: task.linked_work_order_id,
      notes: task.notes,
      createdAt: task.created_at,
      updatedAt: task.updated_at,
    }));
  }

  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task | null> {
    const { data, error } = await this.supabase
      .from('tasks')
      .insert({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        due_date: task.dueDate,
        linked_work_order_id: task.workOrderId,
        notes: task.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as Task['status'],
      priority: data.priority as Task['priority'],
      assignee: data.assignee,
      dueDate: data.due_date,
      workOrderId: data.linked_work_order_id,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task | null> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.assignee !== undefined) updateData.assignee = updates.assignee;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;
    if (updates.workOrderId !== undefined) updateData.linked_work_order_id = updates.workOrderId;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await this.supabase
      .from('tasks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status as Task['status'],
      priority: data.priority as Task['priority'],
      assignee: data.assignee,
      dueDate: data.due_date,
      workOrderId: data.linked_work_order_id,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteTask(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return false;
    }

    return true;
  }

  // Work Orders
  async getWorkOrders(): Promise<WorkOrder[]> {
    const { data, error } = await this.supabase
      .from('work_orders')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching work orders:', error);
      return [];
    }

    return data.map(wo => ({
      id: wo.id,
      title: wo.title,
      description: wo.description,
      roomId: wo.room_id,
      deviceId: wo.device_id,
      priority: wo.priority as WorkOrder['priority'],
      status: wo.status as WorkOrder['status'],
      assignee: wo.assignee,
      dueDate: wo.due_date,
      createdAt: wo.created_at,
      updatedAt: wo.updated_at,
    }));
  }

  async createWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<WorkOrder | null> {
    const { data, error } = await this.supabase
      .from('work_orders')
      .insert({
        title: workOrder.title,
        description: workOrder.description,
        room_id: workOrder.roomId,
        device_id: workOrder.deviceId,
        priority: workOrder.priority,
        status: workOrder.status,
        assignee: workOrder.assignee,
        due_date: workOrder.dueDate,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      roomId: data.room_id,
      deviceId: data.device_id,
      priority: data.priority as WorkOrder['priority'],
      status: data.status as WorkOrder['status'],
      assignee: data.assignee,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateWorkOrder(id: string, updates: Partial<Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>>): Promise<WorkOrder | null> {
    const updateData: any = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.roomId !== undefined) updateData.room_id = updates.roomId;
    if (updates.deviceId !== undefined) updateData.device_id = updates.deviceId;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.assignee !== undefined) updateData.assignee = updates.assignee;
    if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate;

    const { data, error } = await this.supabase
      .from('work_orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order:', error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      roomId: data.room_id,
      deviceId: data.device_id,
      priority: data.priority as WorkOrder['priority'],
      status: data.status as WorkOrder['status'],
      assignee: data.assignee,
      dueDate: data.due_date,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteWorkOrder(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('work_orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting work order:', error);
      return false;
    }

    return true;
  }

  // Procurement Items
  async getProcurementItems(): Promise<ProcurementItem[]> {
    const { data, error } = await this.supabase
      .from('procurement_items')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching procurement items:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      itemName: item.item_name,
      category: item.category as ProcurementItem['category'],
      image: item.image,
      departmentRequestDate: item.department_request_date,
      departmentBudgetDate: item.department_budget_date,
      requestedValue: item.requested_value,
      selectionMethod: item.selection_method as ProcurementItem['selectionMethod'],
      actualPaymentValue: item.actual_payment_value,
      notes: item.notes,
      status: item.status as ProcurementItem['status'],
      priority: item.priority as ProcurementItem['priority'],
      department: item.department,
      requestedBy: item.requested_by,
      approvedBy: item.approved_by,
      purchaseDate: item.purchase_date,
      warrantyPeriod: item.warranty_period,
      supplier: item.supplier,
      specifications: item.specifications,
      quantity: item.quantity,
      unit: item.unit,
      budgetYear: item.budget_year,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  }

  async createProcurementItem(item: Omit<ProcurementItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ProcurementItem | null> {
    const { data, error } = await this.supabase
      .from('procurement_items')
      .insert({
        item_name: item.itemName,
        category: item.category,
        image: item.image,
        department_request_date: item.departmentRequestDate,
        department_budget_date: item.departmentBudgetDate,
        requested_value: item.requestedValue,
        selection_method: item.selectionMethod,
        actual_payment_value: item.actualPaymentValue,
        notes: item.notes,
        status: item.status,
        priority: item.priority,
        department: item.department,
        requested_by: item.requestedBy,
        approved_by: item.approvedBy,
        purchase_date: item.purchaseDate,
        warranty_period: item.warrantyPeriod,
        supplier: item.supplier,
        specifications: item.specifications,
        quantity: item.quantity,
        unit: item.unit,
        budget_year: item.budgetYear,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating procurement item:', error);
      return null;
    }

    return {
      id: data.id,
      itemName: data.item_name,
      category: data.category as ProcurementItem['category'],
      image: data.image,
      departmentRequestDate: data.department_request_date,
      departmentBudgetDate: data.department_budget_date,
      requestedValue: data.requested_value,
      selectionMethod: data.selection_method as ProcurementItem['selectionMethod'],
      actualPaymentValue: data.actual_payment_value,
      notes: data.notes,
      status: data.status as ProcurementItem['status'],
      priority: data.priority as ProcurementItem['priority'],
      department: data.department,
      requestedBy: data.requested_by,
      approvedBy: data.approved_by,
      purchaseDate: data.purchase_date,
      warrantyPeriod: data.warranty_period,
      supplier: data.supplier,
      specifications: data.specifications,
      quantity: data.quantity,
      unit: data.unit,
      budgetYear: data.budget_year,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateProcurementItem(id: string, updates: Partial<Omit<ProcurementItem, 'id' | 'createdAt' | 'updatedAt'>>): Promise<ProcurementItem | null> {
    const updateData: any = {};
    if (updates.itemName !== undefined) updateData.item_name = updates.itemName;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.image !== undefined) updateData.image = updates.image;
    if (updates.departmentRequestDate !== undefined) updateData.department_request_date = updates.departmentRequestDate;
    if (updates.departmentBudgetDate !== undefined) updateData.department_budget_date = updates.departmentBudgetDate;
    if (updates.requestedValue !== undefined) updateData.requested_value = updates.requestedValue;
    if (updates.selectionMethod !== undefined) updateData.selection_method = updates.selectionMethod;
    if (updates.actualPaymentValue !== undefined) updateData.actual_payment_value = updates.actualPaymentValue;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.priority !== undefined) updateData.priority = updates.priority;
    if (updates.department !== undefined) updateData.department = updates.department;
    if (updates.requestedBy !== undefined) updateData.requested_by = updates.requestedBy;
    if (updates.approvedBy !== undefined) updateData.approved_by = updates.approvedBy;
    if (updates.purchaseDate !== undefined) updateData.purchase_date = updates.purchaseDate;
    if (updates.warrantyPeriod !== undefined) updateData.warranty_period = updates.warrantyPeriod;
    if (updates.supplier !== undefined) updateData.supplier = updates.supplier;
    if (updates.specifications !== undefined) updateData.specifications = updates.specifications;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.budgetYear !== undefined) updateData.budget_year = updates.budgetYear;

    const { data, error } = await this.supabase
      .from('procurement_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating procurement item:', error);
      return null;
    }

    return {
      id: data.id,
      itemName: data.item_name,
      category: data.category as ProcurementItem['category'],
      image: data.image,
      departmentRequestDate: data.department_request_date,
      departmentBudgetDate: data.department_budget_date,
      requestedValue: data.requested_value,
      selectionMethod: data.selection_method as ProcurementItem['selectionMethod'],
      actualPaymentValue: data.actual_payment_value,
      notes: data.notes,
      status: data.status as ProcurementItem['status'],
      priority: data.priority as ProcurementItem['priority'],
      department: data.department,
      requestedBy: data.requested_by,
      approvedBy: data.approved_by,
      purchaseDate: data.purchase_date,
      warrantyPeriod: data.warranty_period,
      supplier: data.supplier,
      specifications: data.specifications,
      quantity: data.quantity,
      unit: data.unit,
      budgetYear: data.budget_year,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async deleteProcurementItem(id: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('procurement_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting procurement item:', error);
      return false;
    }

    return true;
  }

  // Helper function để chuyển procurement item thành device khi được mua
  async convertProcurementToDevice(procurementId: string, deviceData: {
    roomId?: string;
    deviceCode?: string;
  }): Promise<Device | null> {
    try {
      // Lấy procurement item
      const procurementItem = await this.supabase
        .from('procurement_items')
        .select('*')
        .eq('id', procurementId)
        .single();

      if (procurementItem.error) {
        console.error('Error fetching procurement item:', procurementItem.error);
        return null;
      }

      const item = procurementItem.data;

      // Tạo device mới từ procurement item
      const deviceToCreate: Omit<Device, 'id' | 'createdAt' | 'updatedAt'> = {
        code: deviceData.deviceCode || `DEV-${Date.now()}`,
        name: item.item_name,
        category: item.category === 'fixed-assets' ? 'Tài sản cố định' : 'Dụng cụ thiết bị',
        unit: item.unit,
        image: item.image,
        purchaseYear: new Date(item.purchase_date || item.created_at).getFullYear(),
        warrantyUntil: item.warranty_period ? 
          new Date(new Date(item.purchase_date || item.created_at).setMonth(
            new Date(item.purchase_date || item.created_at).getMonth() + item.warranty_period
          )).toISOString().split('T')[0] : undefined,
        roomId: deviceData.roomId,
        status: 'good',
        quantity: item.quantity,
        meta: {
          procurementId: procurementId,
          supplier: item.supplier,
          specifications: item.specifications,
          originalValue: item.actual_payment_value || item.requested_value
        }
      };

      // Tạo device
      const newDevice = await this.createDevice(deviceToCreate);
      
      if (newDevice) {
        // Cập nhật procurement item status thành completed
        await this.updateProcurementItem(procurementId, { status: 'completed' });
      }

      return newDevice;
    } catch (error) {
      console.error('Error converting procurement to device:', error);
      return null;
    }
  }
}

export const supabaseService = new SupabaseService();
