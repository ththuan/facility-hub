import React from 'react'

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large'
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  className = '' 
}) => {
  const sizeClasses = {
    small: 'h-6 w-6',
    medium: 'h-12 w-12', 
    large: 'h-16 w-16'
  }

  return (
    <div className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]} ${className}`}></div>
  )
}

export const PageLoading = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
    <div className="text-center">
      <LoadingSpinner size="large" className="mx-auto mb-4" />
      <p className="text-gray-600 dark:text-gray-400">Đang tải...</p>
    </div>
  </div>
)

export const ComponentLoading = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center p-8 ${className}`}>
    <LoadingSpinner />
  </div>
)

export default LoadingSpinner
