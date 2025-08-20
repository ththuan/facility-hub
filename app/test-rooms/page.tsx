'use client'

import { useState } from 'react'
import { supabaseService } from '@/lib/supabaseService'

export default function TestRooms() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const addSampleRooms = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const sampleRooms = [
        { name: 'Phòng IT', code: 'IT01', description: 'Phòng công nghệ thông tin' },
        { name: 'Phòng Kế toán', code: 'KT01', description: 'Phòng kế toán tài chính' },
        { name: 'Phòng Nhân sự', code: 'NS01', description: 'Phòng quản lý nhân sự' },
        { name: 'Phòng họp A', code: 'PH01', description: 'Phòng họp lớn' },
        { name: 'Phòng họp B', code: 'PH02', description: 'Phòng họp nhỏ' },
        { name: 'Văn phòng Giám đốc', code: 'GD01', description: 'Văn phòng ban giám đốc' }
      ]

      for (const roomData of sampleRooms) {
        await supabaseService.createRoom(roomData)
      }
      
      setMessage(`✅ Đã thêm ${sampleRooms.length} phòng mẫu`)
    } catch (error: any) {
      console.error('Error adding sample rooms:', error)
      setMessage('❌ Lỗi khi thêm phòng mẫu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const testGetRooms = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const rooms = await supabaseService.getRooms()
      setMessage(`📋 Tìm thấy ${rooms.length} phòng trong database:\n` + 
        rooms.map(room => `• ${room.code} - ${room.name}`).join('\n'))
    } catch (error: any) {
      console.error('Error getting rooms:', error)
      setMessage('❌ Lỗi khi lấy danh sách phòng: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">Test Rooms Database</h1>
      
      <div className="space-y-4">
        <button
          onClick={testGetRooms}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Đang kiểm tra...' : '🔍 Kiểm tra Rooms'}
        </button>
        
        <button
          onClick={addSampleRooms}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Đang thêm...' : '➕ Thêm Rooms mẫu'}
        </button>
      </div>
      
      {message && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <pre className="whitespace-pre-wrap">{message}</pre>
        </div>
      )}
    </div>
  )
}
