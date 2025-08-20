'use client'

import { supabaseService, Device, Room } from '@/lib/supabaseService'

// Types cho asset management
export interface AssetTransferRecord {
  id: string
  deviceId: string
  deviceCode: string
  deviceName: string
  fromRoomId?: string
  fromRoomName?: string
  toRoomId: string
  toRoomName: string
  requestedBy: string
  requestedAt: string
  approvedBy?: string
  approvedAt?: string
  completedBy?: string
  completedAt?: string
  status: 'pending' | 'approved' | 'completed' | 'rejected'
  reason: string
  notes?: string
}

export interface AssetInventoryItem {
  id: string
  deviceCode: string
  deviceName: string
  roomId?: string
  roomName?: string
  status: 'good' | 'maintenance' | 'broken' | 'repairing'
  expectedLocation: string
  actualLocation?: string
  lastChecked?: string
  checkedBy?: string
  inventoryStatus: 'found' | 'missing' | 'damaged' | 'relocated'
  notes?: string
}

export interface InventorySession {
  id: string
  name: string
  description?: string
  startDate: string
  endDate?: string
  status: 'active' | 'completed' | 'paused'
  totalItems: number
  checkedItems: number
  createdBy: string
  items: AssetInventoryItem[]
}

class AssetService {
  // Lấy tất cả devices từ service chính
  async getDevices(): Promise<Device[]> {
    try {
      return await supabaseService.getDevices()
    } catch (error) {
      console.error('Error fetching devices:', error)
      return this.getMockDevices()
    }
  }

  // Lấy tất cả rooms từ service chính
  async getRooms(): Promise<Room[]> {
    try {
      return await supabaseService.getRooms()
    } catch (error) {
      console.error('Error fetching rooms:', error)
      return this.getMockRooms()
    }
  }

  // Cập nhật thông tin device (đồng bộ với devices page)
  async updateDevice(device: Device): Promise<void> {
    try {
      await supabaseService.updateDevice(device.id, device)
    } catch (error) {
      console.error('Error updating device:', error)
      throw error
    }
  }

  // Tạo yêu cầu điều chuyển
  async createTransferRequest(transfer: Omit<AssetTransferRecord, 'id' | 'requestedAt' | 'status'>): Promise<string> {
    const transferRecord: AssetTransferRecord = {
      ...transfer,
      id: `transfer_${Date.now()}`,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    }
    
    // Lưu vào localStorage hoặc database
    const transfers = this.getStoredTransfers()
    transfers.push(transferRecord)
    localStorage.setItem('assetTransfers', JSON.stringify(transfers))
    
    return transferRecord.id
  }

  // Lấy danh sách điều chuyển
  async getTransferRequests(): Promise<AssetTransferRecord[]> {
    return this.getStoredTransfers()
  }

  // Phê duyệt điều chuyển
  async approveTransfer(transferId: string, approvedBy: string): Promise<void> {
    const transfers = this.getStoredTransfers()
    const transfer = transfers.find(t => t.id === transferId)
    
    if (transfer) {
      transfer.status = 'approved'
      transfer.approvedBy = approvedBy
      transfer.approvedAt = new Date().toISOString()
      localStorage.setItem('assetTransfers', JSON.stringify(transfers))
    }
  }

  // Hoàn thành điều chuyển và cập nhật device location
  async completeTransfer(transferId: string, completedBy: string): Promise<void> {
    const transfers = this.getStoredTransfers()
    const transfer = transfers.find(t => t.id === transferId)
    
    if (transfer) {
      // Cập nhật thông tin device
      const devices = await this.getDevices()
      const device = devices.find(d => d.id === transfer.deviceId)
      
      if (device) {
        device.roomId = transfer.toRoomId
        await this.updateDevice(device)
      }
      
      // Cập nhật trạng thái transfer
      transfer.status = 'completed'
      transfer.completedBy = completedBy
      transfer.completedAt = new Date().toISOString()
      localStorage.setItem('assetTransfers', JSON.stringify(transfers))
    }
  }

  // Tạo session kiểm kê
  async createInventorySession(name: string, description?: string): Promise<string> {
    const devices = await this.getDevices()
    const rooms = await this.getRooms()
    
    const inventoryItems: AssetInventoryItem[] = devices.map(device => {
      const room = rooms.find(r => r.id === device.roomId)
      return {
        id: `inv_${device.id}`,
        deviceCode: device.code,
        deviceName: device.name,
        roomId: device.roomId,
        roomName: room?.name || 'Không xác định',
        status: device.status,
        expectedLocation: room?.name || 'Không xác định',
        inventoryStatus: 'found' // Mặc định là found, sẽ update khi check
      }
    })

    const session: InventorySession = {
      id: `session_${Date.now()}`,
      name,
      description,
      startDate: new Date().toISOString(),
      status: 'active',
      totalItems: inventoryItems.length,
      checkedItems: 0,
      createdBy: 'current_user', // TODO: Get from auth context
      items: inventoryItems
    }

    const sessions = this.getStoredInventorySessions()
    sessions.push(session)
    localStorage.setItem('inventorySessions', JSON.stringify(sessions))
    
    return session.id
  }

  // Lấy danh sách inventory sessions
  async getInventorySessions(): Promise<InventorySession[]> {
    return this.getStoredInventorySessions()
  }

  // Lấy session cụ thể
  async getInventorySession(sessionId: string): Promise<InventorySession | null> {
    const sessions = this.getStoredInventorySessions()
    return sessions.find(s => s.id === sessionId) || null
  }

  // Cập nhật item trong inventory
  async updateInventoryItem(sessionId: string, deviceCode: string, updates: Partial<AssetInventoryItem>): Promise<void> {
    const sessions = this.getStoredInventorySessions()
    const session = sessions.find(s => s.id === sessionId)
    
    if (session) {
      const item = session.items.find(i => i.deviceCode === deviceCode)
      if (item) {
        Object.assign(item, updates)
        
        // Cập nhật lastChecked nếu chưa có
        if (!item.lastChecked) {
          item.lastChecked = new Date().toISOString()
          session.checkedItems += 1
        }
        
        localStorage.setItem('inventorySessions', JSON.stringify(sessions))
      }
    }
  }

  // Private methods
  private getStoredTransfers(): AssetTransferRecord[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('assetTransfers')
    return stored ? JSON.parse(stored) : []
  }

  private getStoredInventorySessions(): InventorySession[] {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('inventorySessions')
    return stored ? JSON.parse(stored) : []
  }

  private getMockDevices(): Device[] {
    return [
      {
        id: '1',
        code: 'MB001',
        name: 'Máy tính Dell OptiPlex',
        category: 'Máy tính',
        unit: 'IT',
        status: 'good',
        quantity: 1,
        roomId: '1',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]
  }

  private getMockRooms(): Room[] {
    return [
      {
        id: '1',
        code: 'IT001',
        name: 'Phòng IT',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01'
      }
    ]
  }
}

export const assetService = new AssetService()
