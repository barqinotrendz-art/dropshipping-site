import { QueryClient } from '@tanstack/react-query'

/**
 * Centralized React Query configuration for optimal caching
 * 
 * CACHING STRATEGY:
 * - Products: 5 min stale time, 30 min cache (frequently viewed, moderate changes)
 * - Categories: 10 min stale time, 1 hour cache (rarely change)
 * - Banners: 5 min stale time, 30 min cache (rarely change)
 * - User data: 5 min stale time, 15 min cache (can change frequently)
 * - Orders: 2 min stale time, 10 min cache (can update frequently)
 * 
 * BENEFITS:
 * ✅ Reduced Firebase reads (saves costs)
 * ✅ Faster page loads (data served from cache)
 * ✅ Better UX (no loading spinners on cached data)
 * ✅ Offline-first approach (data available even when offline)
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Global defaults - can be overridden per query
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes - keep unused data in cache for 30 minutes
      refetchOnWindowFocus: false, // Don't refetch when user switches tabs
      refetchOnReconnect: false, // Don't refetch on network reconnect
      refetchOnMount: false, // Don't refetch if data is already cached
      retry: 2, // Retry failed requests twice
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      // Mutations should invalidate related queries
      retry: 1,
      retryDelay: 1000,
    },
  },
})

/**
 * Cache invalidation helpers
 * Use these after mutations to ensure data stays fresh
 */
export const cacheInvalidation = {
  // Invalidate all product-related queries
  invalidateProducts: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] })
    queryClient.invalidateQueries({ queryKey: ['admin-products'] })
  },
  
  // Invalidate all category-related queries
  invalidateCategories: () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] })
    queryClient.invalidateQueries({ queryKey: ['admin-categories'] })
  },
  
  // Invalidate all banner-related queries
  invalidateBanners: () => {
    queryClient.invalidateQueries({ queryKey: ['banners'] })
    queryClient.invalidateQueries({ queryKey: ['admin-banners'] })
  },
  
  // Invalidate all user-related queries
  invalidateUser: () => {
    queryClient.invalidateQueries({ queryKey: ['user-profile'] })
    queryClient.invalidateQueries({ queryKey: ['auth-state'] })
    queryClient.invalidateQueries({ queryKey: ['user-orders'] })
    queryClient.invalidateQueries({ queryKey: ['user-addresses'] })
  },
  
  // Invalidate all order-related queries
  invalidateOrders: () => {
    queryClient.invalidateQueries({ queryKey: ['orders'] })
    queryClient.invalidateQueries({ queryKey: ['user-orders'] })
    queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
  },
  
  // Clear all cache (use sparingly, e.g., on logout)
  clearAll: () => {
    queryClient.clear()
  },
}

/**
 * Prefetch helpers for better UX
 * Use these to load data before user navigates to a page
 */
export const prefetchHelpers = {
  // Prefetch product details when user hovers over product card
  prefetchProduct: (productId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['product', productId],
      staleTime: 10 * 60 * 1000, // 10 minutes
    })
  },
  
  // Prefetch category products when user hovers over category
  prefetchCategoryProducts: (categoryId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['products', categoryId],
      staleTime: 5 * 60 * 1000, // 5 minutes
    })
  },
}
