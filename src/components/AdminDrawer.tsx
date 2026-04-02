import React from "react"
import { Link, useLocation } from 'react-router-dom'
import { ADMIN_BASE_PATH } from '../constants/routes'
import {
  Home,
  ShoppingBag,
  ClipboardList,
  Folder,
  MessageSquare,
  TicketPercent,
  BarChart2,
  Image,
  X,
  LogOut,
  Share2,
  Truck,
  CreditCard,
  ChevronDown
} from "lucide-react"
import { useAuth } from "../hooks/useAuth"

interface AdminDrawerProps {
  isOpen: boolean
  onToggle: () => void
}

const AdminDrawer: React.FC<AdminDrawerProps> = ({ isOpen, onToggle }) => {
  const location = useLocation()
  const { logout } = useAuth()
  const [expandedOrdersMenu, setExpandedOrdersMenu] = React.useState(false)

  const navigationItems = [
    { name: "Dashboard", href: `${ADMIN_BASE_PATH}`, icon: Home },
    { name: "Add Products", href: `${ADMIN_BASE_PATH}/products`, icon: ShoppingBag },
    { 
      name: "Orders", 
      href: `${ADMIN_BASE_PATH}/orders`, 
      icon: ClipboardList,
      hasSubmenu: true,
      submenu: [
        { name: "Pending", href: `${ADMIN_BASE_PATH}/orders/pending` },
        { name: "Confirmed", href: `${ADMIN_BASE_PATH}/orders/confirmed` },
        { name: "Shipped", href: `${ADMIN_BASE_PATH}/orders/shipped` },
        { name: "Delivered", href: `${ADMIN_BASE_PATH}/orders/delivered` },
        { name: "Cancelled", href: `${ADMIN_BASE_PATH}/orders/cancelled` },
        { name: "Refunded", href: `${ADMIN_BASE_PATH}/orders/refunded` },
      ]
    },
    { name: "Categories", href: `${ADMIN_BASE_PATH}/categories`, icon: Folder },
    { name: "Reviews", href: `${ADMIN_BASE_PATH}/reviews`, icon: MessageSquare },
    { name: "Coupons", href: `${ADMIN_BASE_PATH}/coupons`, icon: TicketPercent },
    { name: "Shipping Rates", href: `${ADMIN_BASE_PATH}/shipping-rates`, icon: Truck },
    { name: "Payment Settings", href: `${ADMIN_BASE_PATH}/payment-settings`, icon: CreditCard },
    { name: "Inventory", href: `${ADMIN_BASE_PATH}/inventory`, icon: BarChart2 },
    { name: "Banners", href: `${ADMIN_BASE_PATH}/banners`, icon: Image },
    { name: "Reports", href: `${ADMIN_BASE_PATH}/reports`, icon: BarChart2 },
    { name: "Social Settings", href: `${ADMIN_BASE_PATH}/social-settings`, icon: Share2 },
  ]

  const isActiveRoute = (href: string) => {
    if (href === `${ADMIN_BASE_PATH}`) return location.pathname === ADMIN_BASE_PATH
    return location.pathname.startsWith(href)
  }

  // Auto-expand orders menu if we're on an orders page
  React.useEffect(() => {
    if (location.pathname.startsWith(`${ADMIN_BASE_PATH}/orders`)) {
      setExpandedOrdersMenu(true)
    }
  }, [location.pathname])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Drawer */}
      <div
        className={`
        fixed top-0 left-0 h-full bg-white shadow-lg z-40 transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        w-64 border-r border-gray-200
      `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-gray-900">Admin Panel</span>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const isActive = isActiveRoute(item.href)

            return (
              <div key={item.name}>
                {item.hasSubmenu ? (
                  <>
                    <button
                      onClick={() => setExpandedOrdersMenu(!expandedOrdersMenu)}
                      className={`
                        flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          isActive
                            ? "bg-black text-white"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${
                          expandedOrdersMenu ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>
                    {expandedOrdersMenu && (
                      <div className="ml-6 mt-1 space-y-1">
                        {item.submenu?.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            onClick={() => {
                              if (window.innerWidth < 1024) onToggle()
                            }}
                            className={`
                              flex items-center px-3 py-2 rounded-md text-sm transition-colors
                              ${
                                location.pathname === subItem.href
                                  ? "bg-gray-800 text-white"
                                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                              }
                            `}
                          >
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onToggle()
                    }}
                    className={`
                      flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                      ${
                        isActive
                          ? "bg-black text-white"
                          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 transform group text-gray-700 hover:bg-red-50 hover:text-red-700 hover:scale-105 active:scale-95"
          >
            <LogOut className="w-5 h-5 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default AdminDrawer
