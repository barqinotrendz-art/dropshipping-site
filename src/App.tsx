import './App.css'
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home.tsx'
import Products from './pages/Products.tsx'
import About from './pages/About.tsx'
import ProductDetail from './pages/ProductDetail.tsx'
import Categories from './pages/Categories.tsx'
import Cart from './pages/Cart.tsx'
import Checkout from './pages/Checkout.tsx'
import Orders from './pages/Orders.tsx'
import Wishlist from './pages/Wishlist.tsx'
import Profile from './pages/Profile.tsx'
import PasswordlessLogin from './pages/auth/PasswordlessLogin.tsx'
import NotFound from './pages/NotFound.tsx'
import Contact from './pages/Contact.tsx'
import PrivacyPolicy from './pages/PrivacyPolicy.tsx'
import TermsOfService from './pages/TermsOfService.tsx'
import CookiePolicy from './pages/CookiePolicy.tsx'
import Shipping from './pages/Shipping.tsx'
import Returns from './pages/Returns.tsx'
import FAQ from './pages/FAQ.tsx'
import NavBar from './components/NavBar.tsx'
import Footer from './components/Footer.tsx'
import WhatsAppChat from './components/WhatsAppChat.tsx'
import WishlistSync from './components/WishlistSync.tsx'
import AdminDashboard from './pages/admin/index.tsx'
import AdminBanners from './pages/admin/Banners.tsx'
import AdminProducts from './pages/admin/Products.tsx'
import AdminCategories from './pages/admin/Categories.tsx'
import AdminCoupons from './pages/admin/Coupons.tsx'
import AdminReviews from './pages/admin/Reviews.tsx'
import AdminOrders from './pages/admin/Orders.tsx'
import OrdersByStatus from './pages/admin/OrdersByStatus.tsx'
import AdminInventory from './pages/admin/Inventory.tsx'
import AdminReports from './pages/admin/Reports.tsx'
import AdminSocialSettings from './pages/admin/SocialSettings.tsx'
import AdminShippingRates from './pages/admin/ShippingRates.tsx'
import AdminPaymentSettings from './pages/admin/PaymentSettings.tsx'
import AdminRoute from './components/AdminRoute.tsx'
import AdminLayout from './components/AdminLayout.tsx'
import ScrollToTop from './components/ScrollToTop.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ADMIN_BASE_PATH } from './constants/routes'

function AppContent() {
  const location = useLocation()
  const isAdminPage = location.pathname.startsWith(ADMIN_BASE_PATH)

  return (
    <div className="min-h-screen bg-white flex flex-col w-full">
      <ScrollToTop />
      <WishlistSync />
      <NavBar />
      <main className="flex-1 w-full mobile-content min-h-0">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/about" element={<About />} />
          <Route path="/product/:slug" element={<div className="w-full bg-white"><div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12"><ProductDetail /></div></div>} />
          <Route path="/cart" element={<div className="w-full bg-gray-50"><div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"><Cart /></div></div>} />
          <Route path="/checkout" element={<div className="w-full bg-gray-50"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"><Checkout /></div></div>} />
          <Route path="/orders" element={<div className="w-full bg-gray-50"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"><Orders /></div></div>} />
          <Route path="/orders/:id" element={<div className="w-full bg-gray-50"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"><Orders /></div></div>} />
          <Route path="/wishlist" element={<div className="w-full bg-gray-50"><div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"><Wishlist /></div></div>} />
          <Route path="/profile" element={<div className="w-full bg-gray-50"><div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8"><Profile /></div></div>} />
          <Route path="/login" element={<PasswordlessLogin />} />
          <Route path="/register" element={<PasswordlessLogin />} />
          <Route path="/auth" element={<PasswordlessLogin />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/cookie-policy" element={<CookiePolicy />} />
          <Route path="/shipping" element={<Shipping />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="*" element={<NotFound />} />
          <Route path={`${ADMIN_BASE_PATH}`} element={<AdminRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/banners`} element={<AdminRoute><AdminLayout><AdminBanners /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/products`} element={<AdminRoute><AdminLayout><AdminProducts /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/categories`} element={<AdminRoute><AdminLayout><AdminCategories /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/coupons`} element={<AdminRoute><AdminLayout><AdminCoupons /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/reviews`} element={<AdminRoute><AdminLayout><AdminReviews /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/orders`} element={<AdminRoute><AdminLayout><AdminOrders /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/orders/:status`} element={<AdminRoute><AdminLayout><OrdersByStatus /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/inventory`} element={<AdminRoute><AdminLayout><AdminInventory /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/reports`} element={<AdminRoute><AdminLayout><AdminReports /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/social-settings`} element={<AdminRoute><AdminLayout><AdminSocialSettings /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/shipping-rates`} element={<AdminRoute><AdminLayout><AdminShippingRates /></AdminLayout></AdminRoute>} />
          <Route path={`${ADMIN_BASE_PATH}/payment-settings`} element={<AdminRoute><AdminLayout><AdminPaymentSettings /></AdminLayout></AdminRoute>} />
        </Routes>
      </main>
      {!isAdminPage && <Footer />}
      {!isAdminPage && <WhatsAppChat />}
    </div>
  )
}

function App() {
  // Disable automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  const enableReactQueryDevtools = import.meta.env.VITE_ENABLE_REACT_QUERY_DEVTOOLS === 'true'

  return (
   <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
      {enableReactQueryDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}

export default App
