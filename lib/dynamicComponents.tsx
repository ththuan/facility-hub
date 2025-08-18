import LoadingSpinner from '@/components/LoadingSpinner'

// Simple loading component for dynamic imports
const Loading = () => (
  <div className="flex items-center justify-center min-h-96">
    <LoadingSpinner />
  </div>
)

export { Loading }
