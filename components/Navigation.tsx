'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import UserMenu from './UserMenu'
import ThemeSwitcher from './ThemeSwitcher'
import { useState, useRef, useEffect } from 'react'

export default function Navigation() {
  const pathname = usePathname()
  const { user } = useAuth()
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setShowMoreMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) {
    return null
  }

  const isActive = (path: string) => pathname === path

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex items-center px-4 text-sm font-medium">
              <span className="font-bold text-xl text-blue-600 dark:text-blue-400">Facility Hub</span>
            </Link>
            
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/dashboard')
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                🏠 Dashboard
              </Link>
              
              <Link
                href="/devices"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/devices')
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                🖥️ Thiết bị
              </Link>
              
              <Link
                href="/rooms"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/rooms')
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                🏢 Phòng ban
              </Link>

              <Link
                href="/asset-transfer"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/asset-transfer')
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                🔄 Điều chuyển
              </Link>

              <Link
                href="/asset-inventory"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/asset-inventory')
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                📋 Kiểm kê
              </Link>

              <Link
                href="/procurement"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/procurement')
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                🛒 Mua sắm
              </Link>
              
              <Link
                href="/work-orders"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive('/work-orders')
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                }`}
              >
                🔧 Bảo trì
              </Link>

              {/* More Menu Dropdown */}
              <div className="relative" ref={moreMenuRef}>
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                    ['/calendar', '/tasks', '/analytics', '/qr-generator', '/admin', '/documents'].some(path => pathname.startsWith(path))
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300'
                  }`}
                >
                  ⚙️ Khác
                  <svg className="ml-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showMoreMenu && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-md border border-gray-200 dark:border-gray-700 z-50">
                    <div className="py-1">
                      <Link
                        href="/documents"
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isActive('/documents') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => setShowMoreMenu(false)}
                      >
                        📁 Tài liệu
                      </Link>
                      <Link
                        href="/calendar"
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isActive('/calendar') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => setShowMoreMenu(false)}
                      >
                        📅 Lịch làm việc
                      </Link>
                      <Link
                        href="/tasks"
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isActive('/tasks') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => setShowMoreMenu(false)}
                      >
                        ✅ Công việc
                      </Link>
                      <Link
                        href="/analytics"
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isActive('/analytics') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => setShowMoreMenu(false)}
                      >
                        📊 Báo cáo
                      </Link>
                      <Link
                        href="/qr-generator"
                        className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isActive('/qr-generator') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                        }`}
                        onClick={() => setShowMoreMenu(false)}
                      >
                        📱 Tạo mã QR
                      </Link>
                      <div className="border-t border-gray-200 dark:border-gray-600 mt-1 pt-1">
                        <Link
                          href="/admin/users"
                          className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            pathname.startsWith('/admin') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                          }`}
                          onClick={() => setShowMoreMenu(false)}
                        >
                          👥 Quản lý người dùng
                        </Link>
                        <Link
                          href="/admin/settings"
                          className={`block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                            pathname.startsWith('/admin') ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'text-gray-700 dark:text-gray-200'
                          }`}
                          onClick={() => setShowMoreMenu(false)}
                        >
                          ⚙️ Cài đặt hệ thống
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <ThemeSwitcher />
            <UserMenu />
          </div>
        </div>
      </div>
    </nav>
  )
}
