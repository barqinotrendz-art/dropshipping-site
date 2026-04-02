import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          firebase: ['firebase/app', 'firebase/firestore', 'firebase/auth', 'firebase/storage'],
          admin: [
            'src/pages/admin/index.tsx',
            'src/pages/admin/Orders.tsx',
            'src/pages/admin/Products.tsx',
            'src/pages/admin/Categories.tsx',
            'src/pages/admin/Banners.tsx',
            'src/pages/admin/Reviews.tsx',
            'src/pages/admin/Coupons.tsx',
            'src/pages/admin/Inventory.tsx',
            'src/pages/admin/Reports.tsx',
            'src/pages/admin/SocialSettings.tsx',
            'src/pages/admin/ShippingRates.tsx',
            'src/pages/admin/PaymentSettings.tsx'
          ],
        },
      },
    },
  },
})
