import { deviceManager, roomManager } from './localStorage';

// Procurement Management System for Annual Purchasing

export interface ProcurementItem {
  id: string;
  itemName: string;
  category: 'fixed-assets' | 'tools-equipment';
  
  // Core procurement fields (as requested by user)
  departmentRequestDate: string; // Ngày đề nghị đơn vị
  departmentBudgetDate: string; // Ngày đề nghị và dự toán của phòng
  requestedValue: number; // Giá trị đề nghị
  selectionMethod: 'tender' | 'quotation' | 'direct' | 'emergency'; // Hình thức lựa chọn
  actualPaymentValue?: number; // Giá trị thanh toán nghiệm thu
  notes: string; // Ghi chú
  
  // Additional fields
  status: 'draft' | 'requested' | 'approved' | 'rejected' | 'purchased' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  department: string;
  requestedBy: string;
  approvedBy?: string;
  purchaseDate?: string;
  warrantyPeriod?: number; // Thời gian bảo hành (tháng)
  supplier?: string;
  specifications?: string; // Thông số kỹ thuật
  quantity: number;
  unit: string;
  budgetYear: number;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface ProcurementBudget {
  year: number;
  department: string;
  fixedAssetsAllocated: number;
  fixedAssetsUsed: number;
  toolsEquipmentAllocated: number;
  toolsEquipmentUsed: number;
  totalAllocated: number;
  totalUsed: number;
}

export class ProcurementManager {
  private items: ProcurementItem[] = [];
  private budgets: ProcurementBudget[] = [];
  private storageKey = 'facilityHub_procurement';
  private budgetStorageKey = 'facilityHub_procurementBudget';

  constructor() {
    this.loadFromStorage();
    this.initializeSampleData();
  }

  private loadFromStorage(): void {
    try {
      const storedItems = localStorage.getItem(this.storageKey);
      const storedBudgets = localStorage.getItem(this.budgetStorageKey);
      
      if (storedItems) {
        this.items = JSON.parse(storedItems);
      }
      
      if (storedBudgets) {
        this.budgets = JSON.parse(storedBudgets);
      }
    } catch (error) {
      console.error('Error loading procurement data from localStorage:', error);
      this.items = [];
      this.budgets = [];
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
      localStorage.setItem(this.budgetStorageKey, JSON.stringify(this.budgets));
    } catch (error) {
      console.error('Error saving procurement data to localStorage:', error);
    }
  }

  private initializeSampleData(): void {
    if (this.items.length > 0) return;

    const currentYear = new Date().getFullYear();
    
    const sampleItems: ProcurementItem[] = [
      {
        id: '1',
        itemName: 'Máy tính để bàn Dell OptiPlex 7090',
        category: 'fixed-assets',
        departmentRequestDate: '2025-01-15',
        departmentBudgetDate: '2025-01-20',
        requestedValue: 45000000,
        selectionMethod: 'quotation',
        actualPaymentValue: 42000000,
        notes: 'Nâng cấp máy tính cho phòng IT',
        status: 'completed',
        priority: 'high',
        department: 'Phòng IT',
        requestedBy: 'Nguyễn Văn A',
        approvedBy: 'Trần Thị B',
        purchaseDate: '2025-02-01',
        warrantyPeriod: 36,
        supplier: 'Công ty Dell Việt Nam',
        specifications: 'CPU i7, RAM 16GB, SSD 512GB',
        quantity: 10,
        unit: 'chiếc',
        budgetYear: currentYear,
        createdAt: '2025-01-15T08:00:00Z',
        updatedAt: '2025-02-15T10:00:00Z'
      },
      {
        id: '2',
        itemName: 'Máy in HP LaserJet Pro M404dn',
        category: 'tools-equipment',
        departmentRequestDate: '2025-02-01',
        departmentBudgetDate: '2025-02-03',
        requestedValue: 8500000,
        selectionMethod: 'quotation',
        actualPaymentValue: 8200000,
        notes: 'Thay thế máy in cũ',
        status: 'completed',
        priority: 'medium',
        department: 'Phòng Hành chính',
        requestedBy: 'Lê Thị C',
        approvedBy: 'Phạm Văn D',
        purchaseDate: '2025-02-15',
        warrantyPeriod: 12,
        supplier: 'HP Vietnam',
        specifications: 'In laser đen trắng, tốc độ 38ppm',
        quantity: 3,
        unit: 'chiếc',
        budgetYear: currentYear,
        createdAt: '2025-02-01T09:00:00Z',
        updatedAt: '2025-02-15T14:00:00Z'
      },
      {
        id: '3',
        itemName: 'Bộ bàn ghế văn phòng cao cấp',
        category: 'fixed-assets',
        departmentRequestDate: '2025-03-01',
        departmentBudgetDate: '2025-03-05',
        requestedValue: 15000000,
        selectionMethod: 'tender',
        notes: 'Trang bị cho phòng họp mới',
        status: 'approved',
        priority: 'medium',
        department: 'Phòng Hành chính',
        requestedBy: 'Hoàng Văn E',
        approvedBy: 'Nguyễn Thị F',
        specifications: 'Bàn gỗ tự nhiên, ghế da cao cấp',
        quantity: 1,
        unit: 'bộ',
        budgetYear: currentYear,
        createdAt: '2025-03-01T10:00:00Z',
        updatedAt: '2025-03-05T15:00:00Z'
      },
      {
        id: '4',
        itemName: 'Máy photocopy Ricoh MP 3055',
        category: 'tools-equipment',
        departmentRequestDate: '2025-03-10',
        departmentBudgetDate: '2025-03-12',
        requestedValue: 35000000,
        selectionMethod: 'quotation',
        notes: 'Máy photocopy đa chức năng cho toàn công ty',
        status: 'requested',
        priority: 'high',
        department: 'Phòng Hành chính',
        requestedBy: 'Vũ Thị G',
        specifications: 'Photocopy, scan, fax, in màu và đen trắng',
        quantity: 1,
        unit: 'chiếc',
        budgetYear: currentYear,
        createdAt: '2025-03-10T11:00:00Z',
        updatedAt: '2025-03-12T09:00:00Z'
      }
    ];

    this.items = sampleItems;

    // Sample budgets
    const sampleBudgets: ProcurementBudget[] = [
      {
        year: currentYear,
        department: 'Phòng IT',
        fixedAssetsAllocated: 100000000,
        fixedAssetsUsed: 42000000,
        toolsEquipmentAllocated: 50000000,
        toolsEquipmentUsed: 15000000,
        totalAllocated: 150000000,
        totalUsed: 57000000
      },
      {
        year: currentYear,
        department: 'Phòng Hành chính',
        fixedAssetsAllocated: 80000000,
        fixedAssetsUsed: 25000000,
        toolsEquipmentAllocated: 40000000,
        toolsEquipmentUsed: 28200000,
        totalAllocated: 120000000,
        totalUsed: 53200000
      },
      {
        year: currentYear,
        department: 'Phòng Kế toán',
        fixedAssetsAllocated: 60000000,
        fixedAssetsUsed: 0,
        toolsEquipmentAllocated: 30000000,
        toolsEquipmentUsed: 0,
        totalAllocated: 90000000,
        totalUsed: 0
      }
    ];

    this.budgets = sampleBudgets;
    this.saveToStorage();
  }

  // CRUD Operations for Procurement Items
  getAll(): ProcurementItem[] {
    return [...this.items];
  }

  getById(id: string): ProcurementItem | undefined {
    return this.items.find(item => item.id === id);
  }

  getByCategory(category: 'fixed-assets' | 'tools-equipment'): ProcurementItem[] {
    return this.items.filter(item => item.category === category);
  }

  getByYear(year: number): ProcurementItem[] {
    return this.items.filter(item => item.budgetYear === year);
  }

  getByDepartment(department: string): ProcurementItem[] {
    return this.items.filter(item => item.department === department);
  }

  getByStatus(status: ProcurementItem['status']): ProcurementItem[] {
    return this.items.filter(item => item.status === status);
  }

  add(item: Omit<ProcurementItem, 'id' | 'createdAt' | 'updatedAt'>): ProcurementItem {
    const newItem: ProcurementItem = {
      ...item,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    this.items.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  update(id: string, updates: Partial<ProcurementItem>): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;

    const oldItem = this.items[index];
    this.items[index] = {
      ...this.items[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Auto-create device when status changes to 'completed'
    if (oldItem.status !== 'completed' && this.items[index].status === 'completed') {
      this.createDeviceFromProcurement(this.items[index]);
    }
    
    this.saveToStorage();
    return true;
  }

  delete(id: string): boolean {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.items.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Auto-create device when procurement is completed
  private createDeviceFromProcurement(procurementItem: ProcurementItem): void {
    try {
      // Generate device code based on category and year
      const year = procurementItem.budgetYear.toString().slice(-2);
      const categoryPrefix = procurementItem.category === 'fixed-assets' ? 'FA' : 'TE';
      const deviceCode = `${categoryPrefix}${year}${Date.now().toString().slice(-4)}`;

      // Find room by department name (if exists)
      const rooms = roomManager.getAll();
      const matchingRoom = rooms.find(room => 
        room.name.toLowerCase().includes(procurementItem.department.toLowerCase()) ||
        room.description?.toLowerCase().includes(procurementItem.department.toLowerCase())
      );

      // Create device
      const device = {
        code: deviceCode,
        name: procurementItem.itemName,
        category: this.mapProcurementCategoryToDeviceCategory(procurementItem.category),
        unit: procurementItem.unit,
        purchaseYear: procurementItem.budgetYear,
        warrantyUntil: this.calculateWarrantyDate(procurementItem.purchaseDate, procurementItem.warrantyPeriod),
        roomId: matchingRoom?.id,
        status: 'Tốt' as const,
        quantity: procurementItem.quantity,
        meta: {
          procurementId: procurementItem.id,
          supplier: procurementItem.supplier,
          selectionMethod: procurementItem.selectionMethod,
          actualPaymentValue: procurementItem.actualPaymentValue,
          specifications: procurementItem.specifications,
          autoCreated: true,
          createdFromProcurement: new Date().toISOString()
        }
      };

      deviceManager.create(device);
      
      console.log(`✅ Đã tự động tạo thiết bị từ mua sắm: ${procurementItem.itemName} (${deviceCode})`);
    } catch (error) {
      console.error('❌ Lỗi khi tự động tạo thiết bị từ mua sắm:', error);
    }
  }

  private mapProcurementCategoryToDeviceCategory(category: 'fixed-assets' | 'tools-equipment'): string {
    const categoryMapping = {
      'fixed-assets': 'Tài sản cố định',
      'tools-equipment': 'Công cụ dụng cụ'
    };
    return categoryMapping[category] || 'Khác';
  }

  private calculateWarrantyDate(purchaseDate?: string, warrantyPeriod?: number): string {
    if (!purchaseDate || !warrantyPeriod) {
      // Default 1 year warranty from today
      const warrantyDate = new Date();
      warrantyDate.setFullYear(warrantyDate.getFullYear() + 1);
      return warrantyDate.toISOString().split('T')[0];
    }

    const purchase = new Date(purchaseDate);
    purchase.setMonth(purchase.getMonth() + warrantyPeriod);
    return purchase.toISOString().split('T')[0];
  }

  // Budget Operations
  getBudgets(): ProcurementBudget[] {
    return [...this.budgets];
  }

  getBudgetByYearAndDepartment(year: number, department: string): ProcurementBudget | undefined {
    return this.budgets.find(b => b.year === year && b.department === department);
  }

  updateBudget(year: number, department: string, updates: Partial<ProcurementBudget>): boolean {
    const index = this.budgets.findIndex(b => b.year === year && b.department === department);
    if (index === -1) {
      // Create new budget if not exists
      this.budgets.push({
        year,
        department,
        fixedAssetsAllocated: 0,
        fixedAssetsUsed: 0,
        toolsEquipmentAllocated: 0,
        toolsEquipmentUsed: 0,
        totalAllocated: 0,
        totalUsed: 0,
        ...updates
      });
    } else {
      this.budgets[index] = { ...this.budgets[index], ...updates };
    }
    
    this.saveToStorage();
    return true;
  }

  // Statistics and Reports
  getStatsByCategory(year: number): { fixedAssets: number; toolsEquipment: number } {
    const yearItems = this.getByYear(year);
    const fixedAssets = yearItems.filter(item => item.category === 'fixed-assets').length;
    const toolsEquipment = yearItems.filter(item => item.category === 'tools-equipment').length;
    return { fixedAssets, toolsEquipment };
  }

  getStatsByStatus(year: number): Record<string, number> {
    const yearItems = this.getByYear(year);
    const stats: Record<string, number> = {};
    
    yearItems.forEach(item => {
      stats[item.status] = (stats[item.status] || 0) + 1;
    });
    
    return stats;
  }

  getTotalValueByCategory(year: number): { fixedAssets: number; toolsEquipment: number } {
    const yearItems = this.getByYear(year);
    const fixedAssetsValue = yearItems
      .filter(item => item.category === 'fixed-assets')
      .reduce((sum, item) => sum + (item.actualPaymentValue || item.requestedValue), 0);
    const toolsEquipmentValue = yearItems
      .filter(item => item.category === 'tools-equipment')
      .reduce((sum, item) => sum + (item.actualPaymentValue || item.requestedValue), 0);
    
    return { fixedAssets: fixedAssetsValue, toolsEquipment: toolsEquipmentValue };
  }

  // Utility methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  getCategoryLabel(category: 'fixed-assets' | 'tools-equipment'): string {
    const labels = {
      'fixed-assets': 'Tài sản cố định',
      'tools-equipment': 'Công cụ dụng cụ'
    };
    return labels[category] || category;
  }

  getStatusLabel(status: ProcurementItem['status']): string {
    const labels = {
      'draft': 'Nháp',
      'requested': 'Đã đề nghị',
      'approved': 'Đã phê duyệt',
      'rejected': 'Từ chối',
      'purchased': 'Đã mua',
      'completed': 'Hoàn thành'
    };
    return labels[status] || status;
  }

  getSelectionMethodLabel(method: ProcurementItem['selectionMethod']): string {
    const labels = {
      'tender': 'Đấu thầu',
      'quotation': 'Chào hàng cạnh tranh',
      'direct': 'Chỉ định thầu',
      'emergency': 'Mua sắm khẩn cấp'
    };
    return labels[method] || method;
  }

  getPriorityLabel(priority: ProcurementItem['priority']): string {
    const labels = {
      'low': 'Thấp',
      'medium': 'Trung bình',
      'high': 'Cao',
      'urgent': 'Khẩn cấp'
    };
    return labels[priority] || priority;
  }
}

// Create and export singleton instance
export const procurementManager = new ProcurementManager();
