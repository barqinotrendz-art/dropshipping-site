import React, { useState } from 'react'
import { HiMenu } from 'react-icons/hi'
import AdminDrawer from './AdminDrawer'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen)
  }

  return (
    // Prevent accidental horizontal page overflow on small devices; allow internal sections to scroll if needed
    <div className="min-h-screen bg-gray-50 flex overflow-x-hidden">
      {/* Drawer */}
      <AdminDrawer isOpen={isDrawerOpen} onToggle={toggleDrawer} />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Mobile header */}
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={toggleDrawer}
            className="p-2 rounded-md hover:bg-gray-100"
          >
            <HiMenu className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="w-full px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8 max-w-full">
            <div className="max-w-full overflow-x-hidden">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
