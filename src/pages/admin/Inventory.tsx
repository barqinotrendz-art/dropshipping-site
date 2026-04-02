import React from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_BASE_PATH } from '../../constants/routes'
import { useInventoryAlerts } from '../../hooks/useInventoryAlerts'
import { cld } from '../../lib/cloudinary'
import { AdvancedImage } from '@cloudinary/react'
import { fill } from '@cloudinary/url-gen/actions/resize'
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity'
import { AlertTriangle, Package, TrendingDown, Edit, RefreshCw } from 'lucide-react'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const InventoryAdminPage: React.FC = () => {
  const [lowStockThreshold, setLowStockThreshold] = React.useState(10)
  const { lowStockProducts, outOfStockProducts, totalAlerts, isLoading } = useInventoryAlerts(lowStockThreshold)

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text="Loading inventory alerts..." />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Monitor and manage your product stock levels</p>
        </div>
        <div className="flex items-center gap-3 bg-white border rounded-lg px-3 sm:px-4 py-2 shadow-sm">
          <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          <div className="border-l pl-3">
            <label className="text-xs font-medium text-gray-500 block">Low Stock Alert</label>
            <select
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Number(e.target.value))}
              className="text-sm font-semibold text-gray-900 border-none focus:outline-none bg-transparent cursor-pointer"
            >
              <option value={5}>5 units</option>
              <option value={10}>10 units</option>
              <option value={15}>15 units</option>
              <option value={20}>20 units</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-red-500 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-red-900">Out of Stock</p>
              </div>
              <p className="text-4xl font-bold text-red-600">{outOfStockProducts.length}</p>
              <p className="text-xs text-red-700 mt-1">Requires immediate action</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-yellow-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-yellow-900">Low Stock</p>
              </div>
              <p className="text-4xl font-bold text-yellow-600">{lowStockProducts.length}</p>
              <p className="text-xs text-yellow-700 mt-1">≤ {lowStockThreshold} units remaining</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <p className="text-sm font-semibold text-blue-900">Total Alerts</p>
              </div>
              <p className="text-4xl font-bold text-blue-600">{totalAlerts}</p>
              <p className="text-xs text-blue-700 mt-1">Products need attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Out of Stock Products */}
      {outOfStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-red-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b-2 border-red-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-red-900">
                  Out of Stock Products
                </h2>
                <p className="text-sm text-red-700">{outOfStockProducts.length} products need immediate restocking</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {outOfStockProducts.map((product) => (
                <ProductCard key={product.id} product={product} alertType="out-of-stock" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Low Stock Products */}
      {lowStockProducts.length > 0 && (
        <div className="bg-white rounded-xl border-2 border-yellow-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-yellow-50 to-yellow-100 border-b-2 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500 rounded-lg">
                <TrendingDown className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-yellow-900">
                  Low Stock Products
                </h2>
                <p className="text-sm text-yellow-700">
                  {lowStockProducts.length} products with {lowStockThreshold} or fewer units remaining
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {lowStockProducts.map((product) => (
                <ProductCard key={product.id} product={product} alertType="low-stock" />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No Alerts */}
      {totalAlerts === 0 && (
        <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-xl p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-green-900 mb-2">All Stocked Up!</h3>
          <p className="text-green-700 text-lg">No inventory alerts at this time. All products are well-stocked.</p>
        </div>
      )}
    </div>
  )
}

const ProductCard: React.FC<{
  product: any
  alertType: 'out-of-stock' | 'low-stock'
}> = ({ product, alertType }) => {
  const mainImage = product.imagePublicIds?.[0] || 'cld-sample-5'
  const img = cld.image(mainImage)
    .format('auto').quality('auto')
    .resize(fill().width(300).height(300).gravity(autoGravity()))

  const isOutOfStock = alertType === 'out-of-stock'

  return (
    <div className={`group relative border-2 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg ${
      isOutOfStock 
        ? 'bg-white border-red-300 hover:border-red-400' 
        : 'bg-white border-yellow-300 hover:border-yellow-400'
    }`}>
      {/* Stock Badge */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
          isOutOfStock 
            ? 'bg-red-500 text-white' 
            : 'bg-yellow-500 text-white'
        }`}>
          {product.stock === 0 ? 'OUT OF STOCK' : `${product.stock} LEFT`}
        </span>
      </div>

      {/* Product Image */}
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <AdvancedImage cldImg={img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[3rem]">{product.title}</h3>
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-gray-900">Rs {product.price.toFixed(2)}</span>
          <span className="text-sm text-gray-500">ID: {product.id.slice(-6)}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            to={`${ADMIN_BASE_PATH}/products`}
            className="flex-1"
          >
            <Button size="sm" variant="outline" className="w-full">
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
          </Link>
          <Button size="sm" variant={isOutOfStock ? "danger" : "warning"} className="flex-1">
            <RefreshCw className="w-4 h-4 mr-1" />
            Restock
          </Button>
        </div>
      </div>
    </div>
  )
}

export default InventoryAdminPage
