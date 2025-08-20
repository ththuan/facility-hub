'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { assetService, InventorySession } from '@/lib/assetService'

export default function AssetInventoryPage() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<InventorySession[]>([])
  const [currentSession, setCurrentSession] = useState<InventorySession | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [scanInput, setScanInput] = useState('')
  const [newSessionForm, setNewSessionForm] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const sessionsData = await assetService.getInventorySessions()
      setSessions(sessionsData)
    } catch (error) {
      console.error('Error loading sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSessionForm.name.trim()) {
      alert('Vui lòng nhập tên phiên kiểm kê')
      return
    }

    try {
      const sessionId = await assetService.createInventorySession(
        newSessionForm.name, 
        newSessionForm.description
      )
      console.log('✅ Created inventory session:', sessionId)
      
      // Reset form và reload
      setNewSessionForm({ name: '', description: '' })
      setShowCreateForm(false)
      await loadSessions()
      
      alert('Tạo phiên kiểm kê thành công!')
    } catch (error) {
      console.error('❌ Error creating session:', error)
      alert('Lỗi khi tạo phiên kiểm kê: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  const handleStartSession = (session: InventorySession) => {
    setCurrentSession(session)
  }

  const handleScanDevice = async (deviceCode: string) => {
    if (!currentSession) return

    try {
      // Cập nhật item như đã được tìm thấy
      await assetService.updateInventoryItem(currentSession.id, deviceCode, {
        inventoryStatus: 'found',
        actualLocation: 'Vị trí hiện tại', // TODO: Allow user to specify
        lastChecked: new Date().toISOString(),
        checkedBy: user?.email || 'Unknown'
      })
      
      // Reload session data
      const updatedSession = await assetService.getInventorySession(currentSession.id)
      if (updatedSession) {
        setCurrentSession(updatedSession)
      }
      
      setScanInput('')
      console.log('✅ Scanned device:', deviceCode)
    } catch (error) {
      console.error('❌ Error scanning device:', error)
      alert('Lỗi khi quét thiết bị')
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">📋 Kiểm kê tài sản</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Tạo phiên kiểm kê
        </button>
      </div>

      {/* Current Session */}
      {currentSession && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {currentSession.name}
            </h2>
            <button
              onClick={() => setCurrentSession(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Đóng
            </button>
          </div>
          
          <div className="mb-4">
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Tiến độ: {currentSession.checkedItems}/{currentSession.totalItems} thiết bị
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${currentSession.totalItems > 0 ? (currentSession.checkedItems / currentSession.totalItems) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quét mã thiết bị
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && scanInput.trim()) {
                    handleScanDevice(scanInput.trim())
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Quét hoặc nhập mã thiết bị..."
              />
              <button
                onClick={() => scanInput.trim() && handleScanDevice(scanInput.trim())}
                disabled={!scanInput.trim()}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                📱 Quét
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Danh sách thiết bị</h3>
            <div className="max-h-96 overflow-y-auto">
              {currentSession.items.map((item) => (
                <div 
                  key={item.id} 
                  className={`p-3 border rounded-lg ${
                    item.lastChecked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.deviceName}</p>
                      <p className="text-sm text-gray-600">
                        {item.deviceCode} • {item.expectedLocation}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.lastChecked ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.lastChecked ? 'Đã kiểm' : 'Chưa kiểm'}
                      </span>
                      {item.lastChecked && (
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(item.lastChecked).toLocaleString('vi-VN')}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {!currentSession && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Danh sách phiên kiểm kê
            </h2>
            
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Chưa có phiên kiểm kê nào
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Tạo phiên kiểm kê để bắt đầu quét mã QR và cập nhật vị trí tài sản
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  + Tạo phiên kiểm kê đầu tiên
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {session.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.description}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Bắt đầu: {new Date(session.startDate).toLocaleString('vi-VN')}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tiến độ: {session.checkedItems}/{session.totalItems} thiết bị
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          session.status === 'completed' ? 'bg-green-100 text-green-800' :
                          session.status === 'active' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {session.status === 'completed' ? 'Hoàn thành' :
                           session.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
                        </span>
                        {session.status === 'active' && (
                          <button
                            onClick={() => handleStartSession(session)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Tiếp tục
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Tạo phiên kiểm kê mới
              </h3>
              <button
                onClick={() => {
                  setShowCreateForm(false)
                  setNewSessionForm({ name: '', description: '' })
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên phiên kiểm kê *
                </label>
                <input
                  type="text"
                  required
                  value={newSessionForm.name}
                  onChange={(e) => setNewSessionForm({...newSessionForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="VD: Kiểm kê quý 1/2024"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mô tả
                </label>
                <textarea
                  rows={3}
                  value={newSessionForm.description}
                  onChange={(e) => setNewSessionForm({...newSessionForm, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Mô tả về phiên kiểm kê..."
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewSessionForm({ name: '', description: '' })
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Tạo phiên kiểm kê
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}