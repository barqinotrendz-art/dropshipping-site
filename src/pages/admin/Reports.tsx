import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { Printer, Download } from 'lucide-react'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

type ReportData = {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  topProducts: Array<{
    productId: string
    title: string
    totalSold: number
    revenue: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
    orders: number
  }>
  ordersByStatus: Record<string, number>
  customerStats: {
    totalCustomers: number
    returningCustomers: number
    newCustomers: number
  }
}

async function fetchReportsData(dateRange: { start: Date; end: Date }): Promise<ReportData> {
  const [ordersSnap, usersSnap] = await Promise.all([
    getDocs(query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(dateRange.start)),
      where('createdAt', '<=', Timestamp.fromDate(dateRange.end)),
      orderBy('createdAt', 'desc')
    )),
    getDocs(collection(db, 'users'))
  ])

  const orders = ordersSnap.docs.map(d => ({ id: d.id, ...d.data() }))
  const users = usersSnap.docs.map(d => ({ id: d.id, ...d.data() }))

  // Calculate basic metrics (exclude cancelled orders from revenue)
  const validOrders = orders.filter((order: any) => order.status?.toLowerCase() !== 'cancelled')
  const totalRevenue = validOrders.reduce((sum: number, order: any) => sum + (order.totals?.grandTotal || 0), 0)
  const totalOrders = orders.length
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Top products (exclude cancelled orders)
  const productSales: Record<string, { title: string; totalSold: number; revenue: number }> = {}
  validOrders.forEach((order: any) => {
    order.items?.forEach((item: any) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          title: item.title,
          totalSold: 0,
          revenue: 0
        }
      }
      productSales[item.productId].totalSold += item.qty
      productSales[item.productId].revenue += item.price * item.qty
    })
  })

  const topProducts = Object.entries(productSales)
    .map(([productId, data]) => ({ productId, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10)

  // Revenue by month (exclude cancelled orders)
  const monthlyData: Record<string, { revenue: number; orders: number }> = {}
  validOrders.forEach((order: any) => {
    const date = order.createdAt?.toDate?.() || new Date()
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { revenue: 0, orders: 0 }
    }
    monthlyData[monthKey].revenue += order.totals?.grandTotal || 0
    monthlyData[monthKey].orders += 1
  })

  const revenueByMonth = Object.entries(monthlyData)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month))

  // Orders by status
  const ordersByStatus: Record<string, number> = {}
  orders.forEach((order: any) => {
    const status = order.status || 'pending'
    ordersByStatus[status] = (ordersByStatus[status] || 0) + 1
  })

  // Customer stats
  const customerStats = {
    totalCustomers: users.filter((u: any) => u.role === 'customer').length,
    returningCustomers: 0, // Would need order history analysis
    newCustomers: 0 // Would need date-based analysis
  }

  return {
    totalRevenue,
    totalOrders,
    averageOrderValue,
    topProducts,
    revenueByMonth,
    ordersByStatus,
    customerStats
  }
}

const ReportsAdminPage: React.FC = () => {
  const [dateRange, setDateRange] = React.useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth() - 2, 1), // Last 3 months
    end: new Date()
  })

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['admin-reports', dateRange],
    queryFn: () => fetchReportsData(dateRange)
  })

  const formatCurrency = (amount: number) => `Rs ${amount.toFixed(2)}`
  const formatDate = (date: Date) => date.toISOString().split('T')[0]

  const handlePrint = () => {
    window.print()
  }

  const handleExportCSV = () => {
    if (!reportData) return

    // Create CSV content
    let csvContent = 'Sales Report\n\n'
    csvContent += `Report Period: ${formatDate(dateRange.start)} to ${formatDate(dateRange.end)}\n\n`
    
    // Key Metrics
    csvContent += 'KEY METRICS\n'
    csvContent += `Total Revenue,${reportData.totalRevenue}\n`
    csvContent += `Total Orders,${reportData.totalOrders}\n`
    csvContent += `Average Order Value,${reportData.averageOrderValue}\n`
    csvContent += `Total Customers,${reportData.customerStats.totalCustomers}\n\n`
    
    // Top Products
    csvContent += 'TOP SELLING PRODUCTS\n'
    csvContent += 'Rank,Product,Units Sold,Revenue\n'
    reportData.topProducts.forEach((product, index) => {
      csvContent += `${index + 1},"${product.title}",${product.totalSold},${product.revenue}\n`
    })
    csvContent += '\n'
    
    // Orders by Status
    csvContent += 'ORDERS BY STATUS\n'
    csvContent += 'Status,Count\n'
    Object.entries(reportData.ordersByStatus).forEach(([status, count]) => {
      csvContent += `${status},${count}\n`
    })
    csvContent += '\n'
    
    // Monthly Revenue
    csvContent += 'MONTHLY REVENUE\n'
    csvContent += 'Month,Orders,Revenue\n'
    reportData.revenueByMonth.forEach((monthData) => {
      csvContent += `${monthData.month},${monthData.orders},${monthData.revenue}\n`
    })
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `sales-report-${formatDate(new Date())}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text="Loading reports..." />
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header with Print/Export Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Track your business performance and insights</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button onClick={handlePrint} variant="outline" size="sm" icon={<Printer className="w-4 h-4" />} className="w-full sm:w-auto">
            Print Report
          </Button>
          <Button onClick={handleExportCSV} variant="primary" size="sm" icon={<Download className="w-4 h-4" />} className="w-full sm:w-auto">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white border rounded-lg p-4 shadow-sm print:hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={formatDate(dateRange.start)}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: new Date(e.target.value) }))}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-auto"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={formatDate(dateRange.end)}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: new Date(e.target.value) }))}
              className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-auto"
            />
          </div>
        </div>
      </div>

      {/* Print Header (only visible when printing) */}
      <div className="hidden print:block mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sales Report</h1>
        <p className="text-gray-600">Report Period: {formatDate(dateRange.start)} to {formatDate(dateRange.end)}</p>
        <p className="text-gray-600">Generated on: {new Date().toLocaleDateString()}</p>
        <hr className="my-4" />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
        <div className="bg-white p-6 rounded-lg border print:border-2 print:break-inside-avoid">
          <div className="text-sm text-gray-600 font-medium">Total Revenue</div>
          <div className="text-2xl font-bold text-green-600 print:text-black">
            {formatCurrency(reportData?.totalRevenue || 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border print:border-2 print:break-inside-avoid">
          <div className="text-sm text-gray-600 font-medium">Total Orders</div>
          <div className="text-2xl font-bold text-blue-600 print:text-black">
            {reportData?.totalOrders || 0}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border print:border-2 print:break-inside-avoid">
          <div className="text-sm text-gray-600 font-medium">Average Order Value</div>
          <div className="text-2xl font-bold text-purple-600 print:text-black">
            {formatCurrency(reportData?.averageOrderValue || 0)}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg border print:border-2 print:break-inside-avoid">
          <div className="text-sm text-gray-600 font-medium">Total Customers</div>
          <div className="text-2xl font-bold text-orange-600 print:text-black">
            {reportData?.customerStats.totalCustomers || 0}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 print:grid-cols-2">
        {/* Top Products */}
        <div className="bg-white rounded-lg border print:break-inside-avoid">
          <div className="p-4 border-b print:bg-gray-100">
            <h2 className="text-lg font-semibold">Top Selling Products</h2>
          </div>
          <div className="p-4">
            {reportData?.topProducts && reportData.topProducts.length > 0 ? (
              <div className="space-y-3">
                {reportData.topProducts.slice(0, 5).map((product, index) => (
                  <div key={product.productId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-medium text-sm">{product.title}</div>
                        <div className="text-xs text-gray-600">{product.totalSold} units sold</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No sales data available</p>
            )}
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-lg border print:break-inside-avoid">
          <div className="p-4 border-b print:bg-gray-100">
            <h2 className="text-lg font-semibold">Orders by Status</h2>
          </div>
          <div className="p-4">
            {reportData?.ordersByStatus && Object.keys(reportData.ordersByStatus).length > 0 ? (
              <div className="space-y-3">
                {Object.entries(reportData.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        status === 'delivered' ? 'bg-green-100 text-green-700' :
                        status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {status}
                      </span>
                    </div>
                    <div className="font-medium">{count}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No order data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-lg border print:break-inside-avoid">
        <div className="p-4 border-b print:bg-gray-100">
          <h2 className="text-lg font-semibold">Monthly Revenue Trend</h2>
        </div>
        <div className="p-4">
          {reportData?.revenueByMonth && reportData.revenueByMonth.length > 0 ? (
            <div className="space-y-4">
              {reportData.revenueByMonth.map((monthData) => (
                <div key={monthData.month} className="flex items-center justify-between">
                  <div className="font-medium">{monthData.month}</div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">{monthData.orders} orders</div>
                    <div className="font-medium">{formatCurrency(monthData.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No revenue data available</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportsAdminPage
