'use client'

import { useState, useEffect } from 'react'
import { getRoomService } from '@/lib/serviceFactory'

const roomService = getRoomService()

export default function DebugRooms() {
  const [rooms, setRooms] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const testGetRooms = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      console.log('🔍 Testing getRooms...')
      const roomsData = await roomService.getRooms()
      console.log('📋 Rooms data:', roomsData)
      
      setRooms(roomsData)
      setMessage(`📋 Tìm thấy ${roomsData.length} phòng:\n` + 
        JSON.stringify(roomsData, null, 2))
    } catch (error: any) {
      console.error('❌ Error getting rooms:', error)
      setMessage('❌ Lỗi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addSampleRooms = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const sampleRooms = [
        { name: 'Phòng IT', code: 'IT01', description: 'Phòng công nghệ thông tin' },
        { name: 'Phòng Kế toán', code: 'KT01', description: 'Phòng kế toán tài chính' },
        { name: 'Phòng Nhân sự', code: 'NS01', description: 'Phòng quản lý nhân sự' },
        { name: 'Phòng họp A', code: 'PH01', description: 'Phòng họp lớn' },
        { name: 'Phòng họp B', code: 'PH02', description: 'Phòng họp nhỏ' }
      ]

      let created = 0
      for (const roomData of sampleRooms) {
        try {
          const result = await roomService.createRoom(roomData)
          console.log('➕ Created room:', result)
          if (result) created++
        } catch (err: any) {
          console.log('⚠️ Error creating room:', roomData.name, err.message)
        }
      }
      
      setMessage(`✅ Đã thêm ${created}/${sampleRooms.length} phòng mẫu`)
      
      // Reload rooms after adding
      setTimeout(() => testGetRooms(), 1000)
    } catch (error: any) {
      console.error('Error adding sample rooms:', error)
      setMessage('❌ Lỗi: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    testGetRooms()
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔍 Debug Rooms Database</h1>
      
      <div className="space-y-4 mb-6">
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
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-4"
        >
          {loading ? 'Đang thêm...' : '➕ Thêm Rooms mẫu'}
        </button>
      </div>
      
      {message && (
        <div className="mt-6 p-4 bg-gray-100 rounded-lg">
          <pre className="whitespace-pre-wrap text-sm">{message}</pre>
        </div>
      )}

      {rooms.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">📋 Rooms hiện có:</h2>
          <div className="grid gap-2">
            {rooms.map((room: any) => (
              <div key={room.id} className="p-3 border rounded bg-white">
                <strong>{room.code}</strong> - {room.name}
                {room.description && <p className="text-sm text-gray-600">{room.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
