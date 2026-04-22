import React, { useState, useEffect, useRef, useMemo } from 'react'
import logo from '../assets/logo.jpeg'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useCart } from '../hooks/useCart'
import { useWishlist } from '../hooks/useWishlist'
import { useProducts } from '../hooks/useProducts'
import { getCloudinaryUrl } from '../lib/cloudinary'
import { ADMIN_BASE_PATH } from '../constants/routes'
import {
  Home,
  // ShoppingCart,
  Heart,
  User,
  Settings,
  ClipboardList,
  Ticket,
  Star,
  Image,
  BarChart2,
  ChevronDown,
  LogOut,
  Search,
  X,
  Menu,
  Package,
  Handbag
} from 'lucide-react'

interface NavItem {
  path: string
  label?: string
  icon: React.ElementType
  badge?: number
}

/* ---------------- Reusable NavLink ---------------- */
const NavLinkItem: React.FC<{
  item: NavItem
  active: boolean
  onClick?: () => void
  mobile?: boolean
}> = ({ item, active, onClick }) => (
  <Link
    to={item.path}
    onClick={onClick}
    className={` relative flex items-center justify-start p-2 rounded-full text-black
               border-2 border-gray-200 hover:border-black hover:bg-black hover:text-white 
               transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105
      ${active
        ? 'bg-black text-white shadow-lg '
        : 'bg-white text-black hover:bg-black hover:text-white hover:shadow-md'}
    `}
  >
    <item.icon className="w-6 h-6" />
    {item.label && <span className="whitespace-nowrap">{item.label}</span>}
    {item.badge && item.badge > 0 && (
      <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-lg animate-pulse ring-2 ring-white">
        {item.badge > 99 ? '99+' : item.badge}
      </span>
    )}
  </Link>
)

/* ---------------- Mobile Bottom Navigation ---------------- */
const MobileBottomNav: React.FC<{
  user: any
  role: string | null
  cartItemCount: number
  wishlistItemCount: number
  isActivePath: (path: string) => boolean
}> = ({ user, role, cartItemCount, wishlistItemCount, isActivePath }) => {
  const bottomNavItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/cart', icon: Handbag, label: 'Cart', badge: cartItemCount > 0 ? cartItemCount : undefined },
    { path: '/wishlist', icon: Heart, label: 'Wishlist', badge: wishlistItemCount > 0 ? wishlistItemCount : undefined },
    ...(user ? [{ path: '/orders', icon: ClipboardList, label: 'Orders' }] : []),
    ...(role === 'admin' ? [{ path: ADMIN_BASE_PATH, icon: Settings, label: 'Admin' }] : []),
    ...(!user ? [{ path: '/login', icon: User, label: 'Sign In' }] : [])
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-2 py-2 z-50  md:hidden shadow-2xl">
      <div className="flex items-center justify-around max-w-sm mx-auto h-16">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          const isActive = isActivePath(item.path)

          return (
            <Link
              key={item.path}
              to={item.path}

              className={`relative flex flex-col items-center justify-center m-2 w-[56px] h-[60px] rounded-2xl transition-all duration-300 min-w-0 flex-1 transform 
                ${isActive
                ? 'text-white bg-black scale-110 shadow-lg'
                : 'text-gray-600 hover:text-white hover:bg-black hover:scale-105'
                }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon className={`w-6 h-6 mb-1 transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center z-10 ring-2 ring-white shadow-md">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium truncate w-full text-center transition-all duration-300 ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

/* ---------------- Main NavBar ---------------- */
const NavBar: React.FC = () => {
  const { user, userProfile, role, loading, logout } = useAuth()
  const { items } = useCart()
  const { items: wishlistItems } = useWishlist()
  const { data: products } = useProducts()
  const location = useLocation()

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const cartItemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items]
  )

  const wishlistItemCount = wishlistItems.length

  const handleSignOut = async () => {
    setIsUserMenuOpen(false)
    await logout()
  }

  const isActivePath = (path: string) => location.pathname === path
  const isAdminPage = location.pathname.startsWith(ADMIN_BASE_PATH)

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  /* Focus search input when opened */
  useEffect(() => {
    if (isSearchOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [isSearchOpen])

  /* Filter products based on search query */
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !products) return []
    
    const query = searchQuery.toLowerCase()
    return products
      .filter(p => 
        p.active !== false &&
        (p.title.toLowerCase().includes(query) ||
         p.description?.toLowerCase().includes(query) ||
         p.brand?.toLowerCase().includes(query) ||
         p.tags?.some(tag => tag.toLowerCase().includes(query)))
      )
      .slice(0, 5) // Show max 5 results
  }, [searchQuery, products])

  /* Handle search */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }
  
  /* Handle product click from search results */
  const handleProductClick = () => {
    setIsSearchOpen(false)
    setSearchQuery('')
  }

  const userNavItems: NavItem[] = [
    { path: '/cart', icon: Handbag, badge: cartItemCount > 0 ? cartItemCount : undefined },
    { path: '/wishlist', icon: Heart, badge: wishlistItemCount > 0 ? wishlistItemCount : undefined },
  ]

  const adminNavItems: NavItem[] = [
    { path: ADMIN_BASE_PATH, label: 'Dashboard', icon: BarChart2 },
    { path: `${ADMIN_BASE_PATH}/orders`, label: 'Orders', icon: ClipboardList },
    { path: `${ADMIN_BASE_PATH}/coupons`, label: 'Coupons', icon: Ticket },
    { path: `${ADMIN_BASE_PATH}/reviews`, label: 'Reviews', icon: Star },
    { path: `${ADMIN_BASE_PATH}/banners`, label: 'Banners', icon: Image },
  ]

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:block bg-white/95 sticky top-0 z-50 shadow-xl backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3 group ">
              <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center shadow-lg transform transition-all duration-300 group-hover:shadow-2xl group-hover:scale-110 ring-2 ring-gray-100 group-hover:ring-4 group-hover:ring-gray-200">
                <img src={logo} alt="logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="hidden sm:block text-4xl text-black tracking-tight transition-all duration-300 group-hover:tracking-wide">
                Barqino
              </span>
            </Link>

            {/* Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath('/') ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Home
              </Link>
              <Link
                to="/products"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath('/products') ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                All Products
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActivePath('/about') ? 'bg-black text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                About
              </Link>
            </nav>

            {/* Right Side */}
            <div className="flex items-center space-x-3">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center justify-center w-11 h-11 rounded-full
                 bg-white text-black border-2 border-gray-200 hover:border-black
                  hover:bg-black hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* User Navigation */}
           
              {!isAdminPage && (
                <div className="hidden md:flex items-center space-x-2 ">
                  {userNavItems.map((item) => (
                    <NavLinkItem key={item.path} item={item} active={isActivePath(item.path)} />
                  ))}
                </div>
              )}

              {/* User Menu */}
              <div className="relative" ref={dropdownRef}>
                {loading ? (
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse shadow-md"></div>
                ) : user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-semibold text-black bg-white hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-lg border border-gray-200"
                      aria-expanded={isUserMenuOpen}
                    >
                      <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md ring-2 ring-blue-100">
                        <span className="text-white text-sm font-bold">
                          {userProfile?.displayName?.split(" ")?.[0]?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? "rotate-180" : "rotate-0"
                          }`}
                      />
                    </button>

                    {/* Animated Dropdown */}
                    <div
                      className={`absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl py-3 z-50 border border-gray-100
                                  transform origin-top-right transition-all duration-300 ease-out ${isUserMenuOpen
                          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
                        }`}
                      style={{
                        maxHeight: "75vh", // limit dropdown height to 75% of viewport
                        overflowY: "auto", // enable vertical scrolling inside
                        scrollbarWidth: "thin", // modern browsers
                      }}
                      >

                      <div className="px-5 py-3 text-sm text-black border-b border-gray-100 bg-gray-50 rounded-t-2xl">
                        <p className="font-semibold truncate">{userProfile?.displayName || "User"}</p>
                        <p className="text-xs text-gray-600 truncate">{userProfile?.email || user.email}</p>
                        {role === "admin" && (
                          <span className="inline-block mt-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-blue-700 text-white text-xs font-bold rounded-full shadow-md">
                            Admin
                          </span>
                        )}
                      </div>

                      <div className="py-2 px-3 space-y-1">
                        <Link
                          to="/profile"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-black bg-white hover:bg-black hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                        >
                          <User className="w-5 h-5" />
                          <span className="font-medium">My Profile</span>
                        </Link>

                        <Link
                          to="/orders"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 text-sm text-black bg-white hover:bg-black hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-md"
                        >
                          <ClipboardList className="w-5 h-5" />
                          <span className="font-medium">My Orders</span>
                        </Link>
                      </div>

                      {role === "admin" && (
                        <div className="border-t border-gray-100 mt-2 pt-3">
                          <div className="px-5 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Admin Panel
                          </div>
                          <div className="px-3 space-y-1">
                            <Link
                              to={ADMIN_BASE_PATH}
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center space-x-3 px-4 py-3 text-sm text-black bg-white hover:bg-black hover:text-white transition-all duration-300 font-semibold rounded-xl transform hover:scale-105 hover:shadow-md"
                            >
                              <Settings className="w-5 h-5" />
                              <span>Manage Store</span>
                            </Link>

                            {adminNavItems.map((item) => (
                              <NavLinkItem
                                key={item.path}
                                item={item}
                                active={isActivePath(item.path)}
                                onClick={() => setIsUserMenuOpen(false)}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="border-t border-gray-100 mt-3 pt-3 px-3">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center space-x-3 w-full px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                        >
                          <LogOut className="w-5 h-5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </div>

                ) : (
                  <Link
                    to="/login"
                    className="flex items-center justify-center w-11 h-11 font-bold
                     bg-white text-black border-2 border-black rounded-full transition-all
                      duration-300 shadow-md hover:text-white hover:bg-black hover:scale-110 hover:shadow-lg"
                  >
                    <User className="w-7 h-7" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation - hide on admin pages */}
      {!isAdminPage && (
        <MobileBottomNav
          user={user}
          role={role}
          cartItemCount={cartItemCount}
          wishlistItemCount={wishlistItemCount}
          isActivePath={isActivePath}
        />
      )}

      {/* Mobile Header + Bottom Nav */}
      <header className="md:hidden bg-white/95 backdrop-blur-lg sticky top-0 z-40 shadow-lg border-b border-gray-100">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center shadow-lg">
              <img src={logo} alt="logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <span className="text-2xl font-mono text-black tracking-tight">
              Esfylo
            </span>
          </Link>

          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Search className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-fadeIn"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Drawer */}
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-white z-[70] md:hidden shadow-2xl transform transition-transform duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                  <img src={logo} alt="logo" className="w-full h-full object-cover rounded-full" />
                </div>
                <span className="text-xl font-mono text-black font-bold">Esfylo</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="overflow-y-auto h-[calc(100vh-73px)]">
              {/* Navigation Links */}
              <div className="p-4 space-y-2">
                <Link
                  to="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActivePath('/') ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Home className="w-5 h-5" />
                  <span className="font-medium">Home</span>
                </Link>

                <Link
                  to="/products"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActivePath('/products') ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Package className="w-5 h-5" />
                  <span className="font-medium">All Products</span>
                </Link>

                <Link
                  to="/about"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                    isActivePath('/about') ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  <span className="font-medium">About Us</span>
                </Link>
              </div>

              {/* User Section */}
              {user && (
                <div className="border-t border-gray-200 mt-4 pt-4 px-4">
                  <div className="flex items-center space-x-3 px-4 py-3 bg-gray-50 rounded-lg mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">
                        {userProfile?.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{userProfile?.displayName || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate">{userProfile?.email || user.email}</p>
                    </div>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">My Profile</span>
                  </Link>

                  <Link
                    to="/orders"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all"
                  >
                    <ClipboardList className="w-5 h-5" />
                    <span className="font-medium">My Orders</span>
                  </Link>

                  {role === 'admin' && (
                    <div className="border-t border-gray-200 my-3 pt-3">
                      <p className="px-4 text-xs font-bold text-gray-500 uppercase mb-2">Admin Panel</p>
                      <Link
                        to={ADMIN_BASE_PATH}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-all"
                      >
                        <BarChart2 className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                      </Link>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      handleSignOut()
                      setIsMobileMenuOpen(false)
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all mt-2"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}

              {/* Sign In Button (if not logged in) */}
              {!user && (
                <div className="border-t border-gray-200 mt-4 pt-4 px-4">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <MobileBottomNav
        user={user}
        role={role}
        cartItemCount={cartItemCount}
        wishlistItemCount={wishlistItemCount}
        isActivePath={isActivePath}
      />

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-start justify-center pt-20 px-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 animate-slideDown">
            {/* Search Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Search className="w-6 h-6 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900">Search Products</h3>
              </div>
              <button
                onClick={() => {
                  setIsSearchOpen(false)
                  setSearchQuery('')
                }}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="p-6">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for products..."
                  className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-black focus:outline-none transition-colors"
                />
                <button
                  type="submit"
                  disabled={!searchQuery.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Search
                </button>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Search Results:</p>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((product) => {
                      const mainImage = product.imagePublicIds?.[0] || 'cld-sample-5'
                      const currentPrice = product.discountPrice || product.price
                      const hasDiscount = product.discountPrice && product.discountPrice < product.price
                      
                      return (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug || product.id}`}
                          onClick={handleProductClick}
                          className="flex items-center gap-4 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                          {/* Product Image */}
                          <div className="w-16 h-16 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                            <img
                              src={getCloudinaryUrl(mainImage, 100, 100)}
                              alt={product.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                          
                          {/* Product Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 truncate group-hover:text-black">
                              {product.title}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-semibold text-gray-900">
                                Rs {currentPrice.toFixed(2)}
                              </span>
                              {hasDiscount && (
                                <span className="text-sm text-gray-500 line-through">
                                  Rs {product.price.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  
                  {/* View All Results */}
                  <button
                    type="submit"
                    className="w-full mt-3 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    View All Results ({searchResults.length})
                  </button>
                </div>
              )}

              {/* Popular Searches - Show when no search query */}
              {!searchQuery.trim() && (
                <div className="mt-6 space-y-2">
                  <p className="text-sm text-gray-500 font-medium">Popular Searches:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Shirts', 'Shoes', 'Accessories', 'Electronics'].map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setSearchQuery(term)
                          searchRef.current?.focus()
                        }}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {searchQuery.trim() && searchResults.length === 0 && (
                <div className="mt-6 text-center py-8">
                  <p className="text-gray-500">No products found for "{searchQuery}"</p>
                  <p className="text-sm text-gray-400 mt-2">Try searching with different keywords</p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default NavBar