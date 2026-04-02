import React, { useState } from 'react'
import { useShippingRates, useAddShippingRate, useUpdateShippingRate, useDeleteShippingRate, type ShippingRate } from '../../hooks/useShippingRates'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { Truck, Plus, Edit2, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

const ShippingRatesAdmin: React.FC = () => {
  const { data: rates, isLoading } = useShippingRates()
  const addRate = useAddShippingRate()
  const updateRate = useUpdateShippingRate()
  const deleteRate = useDeleteShippingRate()

  const [showForm, setShowForm] = useState(false)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)
  const [formData, setFormData] = useState({
    city: '',
    rate: 0,
    province: '',
    active: true
  })

  const provinces = ['Sindh', 'Punjab', 'KPK', 'Balochistan', 'Islamabad', 'Gilgit-Baltistan']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.city.trim()) {
      toast.error('Please enter a city name')
      return
    }
    
    if (formData.rate <= 0) {
      toast.error('Please enter a valid rate')
      return
    }

    try {
      // Normalize city name: capitalize first letter of each word
      const normalizedCity = formData.city
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
      
      // Check for duplicate city (case-insensitive)
      const isDuplicate = rates?.some(r => 
        r.city.toLowerCase() === normalizedCity.toLowerCase() && 
        (!editingRate || r.id !== editingRate.id)
      )
      
      if (isDuplicate) {
        toast.error(`Shipping rate for ${normalizedCity} already exists!`)
        return
      }
      
      const dataToSave = {
        ...formData,
        city: normalizedCity
      }
      
      if (editingRate) {
        await updateRate.mutateAsync({
          id: editingRate.id,
          ...dataToSave
        })
        toast.success('Shipping rate updated successfully!')
      } else {
        await addRate.mutateAsync(dataToSave)
        toast.success('Shipping rate added successfully!')
      }
      
      setShowForm(false)
      setEditingRate(null)
      setFormData({ city: '', rate: 0, province: '', active: true })
    } catch (error) {
      toast.error('Failed to save shipping rate')
      console.error(error)
    }
  }

  const handleEdit = (rate: ShippingRate) => {
    setEditingRate(rate)
    setFormData({
      city: rate.city,
      rate: rate.rate,
      province: rate.province || '',
      active: rate.active !== false
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string, city: string) => {
    if (!confirm(`Are you sure you want to delete shipping rate for ${city}?`)) return
    
    try {
      await deleteRate.mutateAsync(id)
      toast.success('Shipping rate deleted successfully!')
    } catch (error) {
      toast.error('Failed to delete shipping rate')
      console.error(error)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingRate(null)
    setFormData({ city: '', rate: 0, province: '', active: true })
  }

  const toggleActive = async (rate: ShippingRate) => {
    try {
      await updateRate.mutateAsync({
        id: rate.id,
        active: !rate.active
      })
      toast.success(`Shipping rate ${!rate.active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update status')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Truck className="w-6 h-6 sm:w-8 sm:h-8" />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Shipping Rates</h1>
        </div>
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
            className="flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Add Shipping Rate
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6 shadow-sm">
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            {editingRate ? 'Edit Shipping Rate' : 'Add New Shipping Rate'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  City Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g., Karachi"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Shipping Rate (Rs) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formData.rate}
                  onChange={(e) => setFormData({ ...formData, rate: Number(e.target.value) })}
                  placeholder="e.g., 150"
                  min="0"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Province</label>
                <select
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="">Select Province</option>
                  {provinces.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="rounded"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                variant="primary"
                loading={addRate.isPending || updateRate.isPending}
                className="w-full sm:w-auto"
              >
                {editingRate ? 'Update Rate' : 'Add Rate'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Rates List */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-3 sm:p-4 border-b">
          <h2 className="text-base sm:text-lg font-semibold">All Shipping Rates</h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Total: {rates?.length || 0} cities configured
          </p>
        </div>

        {!rates || rates.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <Truck className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm sm:text-base">No shipping rates configured yet.</p>
            <p className="text-xs sm:text-sm">Add your first shipping rate to get started.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">City</th>
                    <th className="text-left p-3 text-sm font-medium">Province</th>
                    <th className="text-left p-3 text-sm font-medium">Rate (Rs)</th>
                    <th className="text-left p-3 text-sm font-medium">Status</th>
                    <th className="text-left p-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b hover:bg-gray-50">
                      <td className="p-3 font-medium">{rate.city}</td>
                      <td className="p-3 text-gray-600">{rate.province || '-'}</td>
                      <td className="p-3 font-semibold text-green-600">Rs {rate.rate}</td>
                      <td className="p-3">
                        <button
                          onClick={() => toggleActive(rate)}
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            rate.active !== false
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rate.active !== false ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(rate)}
                            className="flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(rate.id, rate.city)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards */}
            <div className="lg:hidden space-y-3 p-3 sm:p-4">
              {rates.map((rate) => (
                <div key={rate.id} className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-sm sm:text-base">{rate.city}</div>
                      <div className="text-xs sm:text-sm text-gray-600">{rate.province || 'No province'}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600 text-sm sm:text-base">Rs {rate.rate}</div>
                      <button
                        onClick={() => toggleActive(rate)}
                        className={`px-2 py-1 rounded text-xs font-medium mt-1 ${
                          rate.active !== false
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {rate.active !== false ? 'Active' : 'Inactive'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(rate)}
                      className="flex items-center gap-1 flex-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span className="text-xs sm:text-sm">Edit</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(rate.id, rate.city)}
                      className="flex items-center gap-1 flex-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="text-xs sm:text-sm">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Default Rate Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
        <h3 className="font-semibold text-blue-900 mb-2 text-sm sm:text-base">ℹ️ Default Shipping Rate</h3>
        <p className="text-xs sm:text-sm text-blue-800">
          For cities not listed above, a default shipping rate of <strong>Rs 300</strong> will be applied automatically.
        </p>
      </div>
    </div>
  )
}

export default ShippingRatesAdmin
