'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getRoomService, getDeviceService } from '@/lib/serviceFactory'
import type { Room, Device } from '@/lib/serviceFactory'

const RoomService = getRoomService()
const DeviceService = getDeviceService()

// Types for asset transfer
interface AssetTransferRecord {
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

export default function AssetTransferPage() {
  const { user } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [transfers, setTransfers] = useState<AssetTransferRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<string>('')
  const [fromRoom, setFromRoom] = useState<string>('')
  const [toRoom, setToRoom] = useState<string>('')
  const [reason, setReason] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [devicesData, roomsData] = await Promise.all([
        DeviceService.getAllDevices(),
        RoomService.getAllRooms()
      ])
      
      setDevices(devicesData)
      setRooms(roomsData)
      
      // Load transfers từ localStorage
      const storedTransfers = localStorage.getItem('assetTransfers')
      if (storedTransfers) {
        setTransfers(JSON.parse(storedTransfers))
      }
      
      console.log('✅ Loaded data:', {
        devices: devicesData.length,
        rooms: roomsData.length,
        transfers: storedTransfers ? JSON.parse(storedTransfers).length : 0
      })
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransfer = async () => {
    if (!selectedDevice || !toRoom || !reason.trim()) {
      alert('Vui lòng điền đầy đủ thông tin')
      return
    }

    try {
      const device = devices.find(d => d.id === selectedDevice)
      const fromRoomData = rooms.find(r => r.id === (device as any)?.room_id)
      const toRoomData = rooms.find(r => r.id === toRoom)

      if (!device || !toRoomData) {
        alert('Thông tin thiết bị hoặc phòng không hợp lệ')
        return
      }

      const newTransfer: AssetTransferRecord = {
        id: `transfer_${Date.now()}`,
        deviceId: device.id,
        deviceCode: device.code,
        deviceName: device.name,
        fromRoomId: fromRoomData?.id,
        fromRoomName: fromRoomData?.name,
        toRoomId: toRoom,
        toRoomName: toRoomData.name,
        requestedBy: user?.username || 'current_user',
        requestedAt: new Date().toISOString(),
        status: 'pending',
        reason: reason.trim()
      }

      // Save to localStorage
      const currentTransfers = JSON.parse(localStorage.getItem('assetTransfers') || '[]')
      currentTransfers.push(newTransfer)
      localStorage.setItem('assetTransfers', JSON.stringify(currentTransfers))
      
      // Update state
      setTransfers(currentTransfers)
      
      // Reset form
      setSelectedDevice('')
      setFromRoom('')
      setToRoom('')
      setReason('')
      setShowCreateForm(false)
      
      alert('✅ Tạo yêu cầu điều chuyển thành công!')
    } catch (error) {
      console.error('❌ Error creating transfer:', error)
      alert('Có lỗi xảy ra khi tạo yêu cầu')
    }
  }

  const handleApproveTransfer = async (transferId: string) => {
    try {
      const currentTransfers = JSON.parse(localStorage.getItem('assetTransfers') || '[]')
      const transferIndex = currentTransfers.findIndex((t: AssetTransferRecord) => t.id === transferId)
      
      if (transferIndex !== -1) {
        currentTransfers[transferIndex].status = 'approved'
        currentTransfers[transferIndex].approvedBy = user?.username || 'current_user'
        currentTransfers[transferIndex].approvedAt = new Date().toISOString()
        
        localStorage.setItem('assetTransfers', JSON.stringify(currentTransfers))
        setTransfers(currentTransfers)
        alert('✅ Đã phê duyệt yêu cầu điều chuyển')
      }
    } catch (error) {
      console.error('❌ Error approving transfer:', error)
      alert('Có lỗi xảy ra khi phê duyệt')
    }
  }

  const handleCompleteTransfer = async (transferId: string) => {
    try {
      const currentTransfers = JSON.parse(localStorage.getItem('assetTransfers') || '[]')
      const transferIndex = currentTransfers.findIndex((t: AssetTransferRecord) => t.id === transferId)
      
      if (transferIndex !== -1) {
        const transfer = currentTransfers[transferIndex]
        
        // Update device room (if we had real API)
        // For now just update transfer status
        currentTransfers[transferIndex].status = 'completed'
        currentTransfers[transferIndex].completedBy = user?.username || 'current_user'
        currentTransfers[transferIndex].completedAt = new Date().toISOString()
        
        localStorage.setItem('assetTransfers', JSON.stringify(currentTransfers))
        setTransfers(currentTransfers)
        alert('✅ Đã hoàn thành điều chuyển tài sản')
      }
    } catch (error) {
      console.error('❌ Error completing transfer:', error)
      alert('Có lỗi xảy ra khi hoàn thành điều chuyển')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'approved': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Chờ duyệt'
      case 'approved': return 'Đã duyệt'
      case 'completed': return 'Hoàn thành'
      case 'rejected': return 'Từ chối'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">🔄 Điều chuyển tài sản</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Tạo yêu cầu điều chuyển
        </button>
      </div>

      {/* Data Status */}
      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
        <div className="flex items-center space-x-4 text-sm">
          <span className="font-medium text-blue-800 dark:text-blue-200">📊 Dữ liệu hệ thống:</span>
          <span className="text-blue-700 dark:text-blue-300">
            <strong>{devices.length}</strong> thiết bị
          </span>
          <span className="text-blue-700 dark:text-blue-300">
            <strong>{rooms.length}</strong> phòng ban
          </span>
          <span className="text-blue-700 dark:text-blue-300">
            <strong>{transfers.length}</strong> yêu cầu điều chuyển
          </span>
        </div>
      </div>

      {/* Create Transfer Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Tạo yêu cầu điều chuyển</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Thiết bị ({devices.length} thiết bị có sẵn)
                </label>
                <select
                  value={selectedDevice}
                  onChange={(e) => {
                    setSelectedDevice(e.target.value)
                    const device = devices.find(d => d.id === e.target.value)
                    setFromRoom((device as any)?.room_id || '')
                  }}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">-- Chọn thiết bị cần điều chuyển --</option>
                  {devices.map(device => (
                    <option key={device.id} value={device.id}>
                      {device.code} - {device.name}
                    </option>
                  ))}
                </select>
                {devices.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ Không có thiết bị nào. Vui lòng thêm thiết bị trước.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Từ phòng</label>
                <input
                  type="text"
                  value={fromRoom ? rooms.find(r => r.id === fromRoom)?.name || 'Không xác định' : 'Chưa chọn thiết bị'}
                  disabled
                  className="w-full px-3 py-2 border rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Đến phòng ({rooms.length} phòng có sẵn)
                </label>
                <select
                  value={toRoom}
                  onChange={(e) => setToRoom(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  required
                >
                  <option value="">-- Chọn phòng đích --</option>
                  {rooms.length > 0 ? (
                    rooms
                      .filter(room => room.id !== fromRoom) // Loại bỏ phòng hiện tại
                      .map(room => (
                        <option key={room.id} value={room.id}>
                          {room.code} - {room.name} ({room.type || 'Không xác định'})
                        </option>
                      ))
                  ) : (
                    <option disabled>Không có phòng nào</option>
                  )}
                </select>
                {rooms.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    ⚠️ Không có phòng nào. Vui lòng thêm phòng ban trước.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Lý do điều chuyển</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Nhập lý do điều chuyển tài sản..."
                  required
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateForm(false)
                    setSelectedDevice('')
                    setFromRoom('')
                    setToRoom('')
                    setReason('')
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateTransfer}
                  disabled={!selectedDevice || !toRoom || !reason.trim() || devices.length === 0 || rooms.length === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tạo yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transfers List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Danh sách yêu cầu điều chuyển</h3>
        </div>
        
        {transfers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Chưa có yêu cầu điều chuyển nào
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Tạo yêu cầu điều chuyển đầu tiên để bắt đầu quản lý
            </p>
            {devices.length > 0 && rooms.length > 0 ? (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                + Tạo yêu cầu điều chuyển
              </button>
            ) : (
              <div className="text-sm text-gray-500">
                <p>Cần có ít nhất 1 thiết bị và 1 phòng để tạo yêu cầu điều chuyển</p>
                <p className="mt-1">
                  Vui lòng thêm dữ liệu tại: 
                  <span className="font-medium"> 🖥️ Thiết bị</span> và 
                  <span className="font-medium"> 🏢 Phòng ban</span>
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thiết bị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Điều chuyển
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Lý do
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {transfers.map((transfer) => (
                  <tr key={transfer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {transfer.deviceCode}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {transfer.deviceName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm">
                        <div className="text-gray-900 dark:text-white">
                          <span className="text-gray-500">Từ:</span> {transfer.fromRoomName || 'Không xác định'}
                        </div>
                        <div className="text-blue-600 dark:text-blue-400 font-medium">
                          <span className="text-gray-500">Đến:</span> {transfer.toRoomName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs">
                      <div className="truncate" title={transfer.reason}>
                        {transfer.reason}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(transfer.status)}`}>
                        {getStatusText(transfer.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(transfer.requestedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {transfer.status === 'pending' && (
                          <button
                            onClick={() => handleApproveTransfer(transfer.id)}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            ✅ Phê duyệt
                          </button>
                        )}
                        {transfer.status === 'approved' && (
                          <button
                            onClick={() => handleCompleteTransfer(transfer.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                          >
                            🎯 Hoàn thành
                          </button>
                        )}
                        {transfer.status === 'completed' && (
                          <span className="text-gray-400 text-sm">✅ Đã xong</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
