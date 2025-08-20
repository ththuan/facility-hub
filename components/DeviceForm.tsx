'use client'

import { useState, useEffect } from 'react'
import type { Device, Room } from '@/lib/serviceFactory'

interface DeviceFormProps {
  device?: Device | null
  rooms: Room[]
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: any, selectedImage: File | null) => void
}

export default function DeviceForm({ device, rooms, isOpen, onClose, onSubmit }: DeviceFormProps) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    unit: "Chiếc", // Default unit value
    image: "",
    purchaseYear: new Date().getFullYear(),
    warrantyUntil: "",
    roomId: "",
    status: "good" as Device['status'],
    quantity: 1,
  })
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>("")

  // Load device data when editing
  useEffect(() => {
    if (device) {
      setFormData({
        code: device.code,
        name: device.name,
        category: device.category,
        unit: device.unit,
        image: device.image || '',
        purchaseYear: device.purchase_year || new Date().getFullYear(),
        warrantyUntil: device.warranty_until || '',
        roomId: device.room_id || '',
        status: device.status,
        quantity: device.quantity,
      })
      
      if (device.image) {
        setImagePreview(device.image)
      }
    } else {
      // Reset for new device
      setFormData({
        code: "",
        name: "",
        category: "",
        unit: "",
        image: "",
        purchaseYear: new Date().getFullYear(),
        warrantyUntil: "",
        roomId: "",
        status: "good" as Device['status'],
        quantity: 1,
      })
      setSelectedImage(null)
      setImagePreview("")
    }
  }, [device])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, selectedImage)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {device ? '✏️ Sửa thiết bị' : '➕ Thêm thiết bị mới'}
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Device Code & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🏷️ Mã thiết bị *
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, code: e.target.value }))
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: PROJ001"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📝 Tên thiết bị *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, name: e.target.value }))
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Máy chiếu Epson"
              />
            </div>
          </div>
          
          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📂 Danh mục *
              </label>
              <input
                type="text"
                required
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Thiết bị giảng dạy"
              />
            </div>
          </div>

          {/* Purchase Year & Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📅 Năm mua
              </label>
              <input
                type="number"
                min="1990"
                max="2030"
                value={formData.purchaseYear}
                onChange={(e) => setFormData(prev => ({ ...prev, purchaseYear: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🔢 Số lượng *
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ⚡ Trạng thái *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as Device['status'] }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="good">✅ Tốt</option>
              <option value="maintenance">⚠️ Cần bảo trì</option>
              <option value="broken">❌ Hỏng</option>
              <option value="repairing">🔧 Đang sửa chữa</option>
            </select>
          </div>

          {/* Warranty & Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                🛡️ Bảo hành đến
              </label>
              <input
                type="date"
                value={formData.warrantyUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, warrantyUntil: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                📍 Phòng/Vị trí
              </label>
              <select
                value={formData.roomId}
                onChange={(e) => setFormData(prev => ({ ...prev, roomId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>
                    {room.code} - {room.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              📷 Ảnh thiết bị
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            
            {imagePreview && (
              <div className="mt-2">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              </div>
            )}
          </div>

          {/* Debug Info */}
          <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-sm">
            <strong>🔍 Debug:</strong> Code="{formData.code}", Name="{formData.name}"
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {device ? '✅ Cập nhật' : '➕ Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
