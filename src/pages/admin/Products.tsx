import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { slugify } from '../../utils/slugify'
import toast from 'react-hot-toast'
import { HiPlus, HiViewGrid, HiViewList, HiSearch } from 'react-icons/hi'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ProductCard from '../../components/admin/ProductCard'
import ImageUpload from '../../components/ui/ImageUpload'

type PriceTier = {
  label: string
  price: number
  discountPrice?: number
}

type ProductForm = {
  title: string
  slug?: string
  description?: string
  brand?: string
  price: number
  discountPrice?: number
  categoryId?: string | null
  stock: number
  sku?: string
  tags?: string
  active?: boolean
  featured?: boolean
  topSelling?: boolean
  imagePublicIds?: string
  attributes?: { [key: string]: any }
  pricing?: PriceTier[]
}

type ColorVariant = {
  name: string
  value: string
  images: string[]
  stock: number
}

async function fetchProducts() {
  const q = query(collection(db, 'products'), orderBy('title', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
}

async function fetchCategories() {
  const q = query(collection(db, 'categories'), orderBy('sort', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
}

const ProductsAdminPage: React.FC = () => {
  const qc = useQueryClient()
  const { data: products, isLoading } = useQuery({ queryKey: ['admin-products'], queryFn: fetchProducts })
  const { data: categories, isLoading: categoriesLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: fetchCategories })

  const { register, handleSubmit, reset, watch, setValue } = useForm<ProductForm>({
    defaultValues: { active: true, featured: false, topSelling: false, price: 0, discountPrice: 0, stock: 0 }
  })

  const title = watch('title')
  const selectedCategoryId = watch('categoryId')
  const computedSlug = slugify(title || '')

  // Filter active categories for dropdown
  const activeCategories = categories?.filter((c: any) => c.active !== false) || []

  // Get selected category for dynamic attributes
  const selectedCategory = categories?.find((c: any) => c.id === selectedCategoryId)
  const dynamicAttributes = selectedCategory?.attributes || []

  // UI State
  const [showAddForm, setShowAddForm] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [productImages, setProductImages] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pricing, setPricing] = useState<PriceTier[]>([])
  const [currentPrice, setCurrentPrice] = useState<PriceTier>({
    label: '',
    price: 0,
    discountPrice: 0
  })
  // Color variant management
  const [colorVariants, setColorVariants] = useState<ColorVariant[]>([])
  const [currentColor, setCurrentColor] = useState<Partial<ColorVariant>>({
    name: '',
    value: '#000000',
    images: [],
    stock: 0
  })

  const addColorVariant = () => {
    if (!currentColor.name?.trim()) {
      toast.error('Please enter a color name')
      return
    }

    if (!currentColor.images || currentColor.images.length === 0) {
      toast.error('Please upload at least one image for this color')
      return
    }

    if (currentColor.stock === undefined || currentColor.stock < 0) {
      toast.error('Please enter a valid stock quantity')
      return
    }

    const newVariant: ColorVariant = {
      name: currentColor.name.trim(),
      value: currentColor.value || '#000000',
      images: currentColor.images,
      stock: currentColor.stock || 0
    }

    setColorVariants(prev => [...prev, newVariant])
    setCurrentColor({ name: '', value: '#000000', images: [], stock: 0 })
    toast.success(`Color "${newVariant.name}" added successfully!`)
  }

  const removeColorVariant = (index: number) => {
    const variant = colorVariants[index]
    setColorVariants(prev => prev.filter((_, i) => i !== index))
    toast.success(`Color "${variant.name}" removed`)
  }

  const onSubmit = async (values: ProductForm) => {
    if (!values.title?.trim()) {
      toast.error('Please enter a product title')
      return
    }

    // if (!values.price || values.price <= 0) {
    //   toast.error('Please enter a valid price')
    //   return
    // }
    if ((!values.price || values.price <= 0) && pricing.length === 0) {
      toast.error('Please enter a valid price or add at least one price tier')
      return
    }

    if (values.discountPrice && values.discountPrice >= values.price) {
      toast.error('Discount price must be less than the regular price')
      return
    }

    const isEditing = !!editingProduct
    setIsSubmitting(true)
    toast.loading(isEditing ? 'Updating product...' : 'Adding product...', { id: 'save-product' })

    try {
      const payload = {
        title: values.title.trim(),
        slug: values.slug && values.slug.length > 0 ? values.slug : slugify(values.title),
        description: values.description || '',
        brand: values.brand || '',
        price: Number(values.price || 0),
        discountPrice: values.discountPrice ? Number(values.discountPrice) : null,
        categoryId: values.categoryId || null,
        imagePublicIds: productImages.filter(Boolean),
        stock: Number(values.stock || 0),
        sku: values.sku || '',
        tags: (values.tags || '')
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        active: values.active !== false,
        featured: values.featured || false,
        topSelling: values.topSelling || false,
        colorVariants: colorVariants.length > 0 ? colorVariants : null,
        attributes: values.attributes || null,
        updatedAt: serverTimestamp(),
        pricing: pricing,
      }

      if (isEditing) {
        await updateDoc(doc(db, 'products', editingProduct.id), payload)
        toast.success(`Product "${values.title}" updated successfully!`, { id: 'save-product' })
      } else {
        await addDoc(collection(db, 'products'), {
          ...payload,
          rating: 0,
          reviewCount: 0,
          createdAt: serverTimestamp(),
        })
        toast.success(`Product "${values.title}" added successfully!`, { id: 'save-product' })
      }

      resetForm()
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['admin-categories'] })

    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'add'} product. Please try again.`, { id: 'save-product' })
    } finally {
      setIsSubmitting(false)
    }
    console.log("FINAL pricing:", pricing)
  }

  const handleDelete = async (id: string, productTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${productTitle}"? This action cannot be undone.`)) {
      return
    }

    // Store original data for potential rollback
    const originalData = qc.getQueryData(['admin-products'])

    // Optimistic update - immediately remove from UI
    qc.setQueryData(['admin-products'], (oldData: any) => {
      if (!oldData) return oldData
      return oldData.filter((product: any) => product.id !== id)
    })

    toast.success(`Product "${productTitle}" deleted successfully!`)

    try {
      await deleteDoc(doc(db, 'products', id))
      // Refresh data to ensure consistency
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
    } catch (error) {
      toast.error('Failed to delete product. Reverting changes.')
      // Revert optimistic update on error
      qc.setQueryData(['admin-products'], originalData)
    }
  }

  const toggleActive = async (id: string, current: boolean, productTitle: string) => {
    // Optimistic update - immediately update the UI
    qc.setQueryData(['admin-products'], (oldData: any) => {
      if (!oldData) return oldData
      return oldData.map((product: any) =>
        product.id === id ? { ...product, active: !current } : product
      )
    })

    const status = !current ? 'activated' : 'deactivated'
    toast.success(`Product "${productTitle}" ${status} successfully!`)

    try {
      await updateDoc(doc(db, 'products', id), { active: !current, updatedAt: serverTimestamp() })
      // Refresh data to ensure consistency
      qc.invalidateQueries({ queryKey: ['admin-products'] })
      qc.invalidateQueries({ queryKey: ['products'] })
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
    } catch (error) {
      toast.error('Failed to update product status. Reverting changes.')
      // Revert optimistic update on error
      qc.setQueryData(['admin-products'], (oldData: any) => {
        if (!oldData) return oldData
        return oldData.map((product: any) =>
          product.id === id ? { ...product, active: current } : product
        )
      })
    }
  }

  const handleEdit = (productId: string) => {
    const product = products?.find(p => p.id === productId)
    if (product) {
      setEditingProduct(product)
      setShowAddForm(true)

      reset({
        title: product.title,
        slug: product.slug,
        description: product.description || '',
        brand: product.brand || '',
        price: product.price,
        discountPrice: product.discountPrice || 0,
        categoryId: product.categoryId || '',
        stock: product.stock,
        sku: product.sku || '',
        tags: product.tags?.join(', ') || '',
        active: product.active !== false,
        featured: product.featured || false,
        topSelling: product.topSelling || false,
        attributes: product.attributes || {},
      })
      setPricing(product.pricing || [])
      setProductImages(product.imagePublicIds || [])
      setColorVariants(product.colorVariants || [])
    }
  }

  const resetForm = () => {
    setEditingProduct(null)
    setShowAddForm(false)
    setProductImages([])
    setColorVariants([])
    setCurrentColor({ name: '', value: '#000000', images: [], stock: 0 })
    reset({
      title: '',
      slug: '',
      description: '',
      brand: '',
      price: 0,
      discountPrice: 0,
      stock: 0,
      sku: '',
      tags: '',
      categoryId: undefined,
      active: true,
      featured: false,
      topSelling: false,
      attributes: {}
    })
  }

  const filteredProducts = products?.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const addPriceTier = () => {
    if (!currentPrice.label.trim()) {
      toast.error('Enter label (e.g. Small, Large)')
      return
    }

    if (!currentPrice.price || currentPrice.price <= 0) {
      toast.error('Enter valid price')
      return
    }

    if (currentPrice.discountPrice && currentPrice.discountPrice >= currentPrice.price) {
      toast.error('Discount must be less than price')
      return
    }

    setPricing(prev => [...prev, currentPrice])
    setCurrentPrice({ label: '', price: 0, discountPrice: 0 })
  }

  console.log(products)


  return (
    <div>
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Products Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">Add, edit, and manage your store products</p>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <Button
            variant="primary"
            icon={<HiPlus className="w-4 h-4" />}
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-full sm:w-auto"
          >
            {showAddForm ? 'Cancel' : 'Add Product'}
          </Button>

          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-black text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <HiViewGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-black text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <HiViewList className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mt-4 sm:mt-0">
          <div className="relative w-full sm:w-auto">
            <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-black"
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {editingProduct ? 'Edit Product' : 'Add New Product'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Title *</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                  placeholder="Enter product title"
                  {...register('title', { required: true })}
                />
                {title && <p className="text-xs text-gray-500 mt-1">Slug preview: {computedSlug}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                  placeholder="e.g., Apple, Samsung, Nike"
                  {...register('brand')}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                rows={4}
                placeholder="Detailed product description..."
                {...register('description')}
              />
            </div>
            {/* New Pricing */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pricing (Multiple)</h3>

              {/* Add New Price */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">Add Price Tier</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

                  {/* Label */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                    <input
                      type="text"
                      placeholder="e.g. Small / 1KG"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={currentPrice.label}
                      onChange={(e) =>
                        setCurrentPrice(prev => ({ ...prev, label: e.target.value }))
                      }
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={currentPrice.price}
                      onChange={(e) =>
                        setCurrentPrice(prev => ({ ...prev, price: Number(e.target.value) }))
                      }
                    />
                  </div>

                  {/* Discount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Discount Price</label>
                    <input
                      type="number"
                      placeholder="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      value={currentPrice.discountPrice}
                      onChange={(e) =>
                        setCurrentPrice(prev => ({ ...prev, discountPrice: Number(e.target.value) }))
                      }
                    />
                  </div>

                  {/* Button */}
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={addPriceTier}
                      className="w-full"
                    >
                      Add Price
                    </Button>
                  </div>
                </div>
              </div>

              {/* Show Added Prices */}
              {pricing.length > 0 && (
                <div className="space-y-3">
                  {pricing.map((p, i) => (
                    <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{p.label}</span>
                        <span className="ml-3 line-through">AED {p.price}</span>
                        {p.discountPrice && (
                          <span className="ml-2 text-[#c03e35] font-semibold">
                            AED {p.discountPrice}
                          </span>
                        )}
                      </div>

                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          setPricing(prev => prev.filter((_, index) => index !== i))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Pricing & Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                  placeholder="0.00"
                  {...register('price', { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Discount Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                  placeholder="0.00"
                  {...register('discountPrice', { valueAsNumber: true })}
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                  placeholder="0"
                  {...register('stock', { valueAsNumber: true })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Unique id</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                  placeholder="PROD-001"
                  {...register('sku')}
                />
              </div>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                  {...register('categoryId')}
                  disabled={categoriesLoading}
                >
                  <option value="">
                    {categoriesLoading ? 'Loading categories...' : 'Select a category'}
                  </option>
                  {activeCategories.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.attributes?.length > 0 && `(${c.attributes.length} custom fields)`}
                    </option>
                  ))}
                </select>
                {categoriesLoading && (
                  <p className="text-xs text-gray-500 mt-1">Loading available categories...</p>
                )}
                {!categoriesLoading && activeCategories.length === 0 && (
                  <div className="mt-1">
                    <p className="text-xs text-yellow-600">No active categories found.</p>
                    <p className="text-xs text-gray-500">
                      {categories?.length
                        ? `Found ${categories.length} categories but none are active. Activate them in Categories page.`
                        : 'Create categories first in the Categories management page.'
                      }
                    </p>
                  </div>
                )}
                {selectedCategory && selectedCategory.attributes?.length > 0 && (
                  <p className="text-xs text-blue-600 mt-1">
                    ✨ This category has {selectedCategory.attributes.length} custom field{selectedCategory.attributes.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma separated)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-black focus:border-black focus:outline-none"
                  placeholder="luxury, premium, bestseller"
                  {...register('tags')}
                />
              </div>
            </div>

            {/* Dynamic Category Attributes */}
            {selectedCategory && dynamicAttributes.length > 0 && (
              <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-3">
                  📝 {selectedCategory.name} Category Fields
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dynamicAttributes.map((attr: any) => (
                    <div key={attr.key}>
                      <label className="block text-sm font-medium text-blue-800 mb-1">
                        {attr.label} {attr.required && <span className="text-red-500">*</span>}
                      </label>

                      {attr.type === 'text' && (
                        <input
                          type="text"
                          className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                          placeholder={`Enter ${attr.label.toLowerCase()}`}
                          {...register(`attributes.${attr.key}`, { required: attr.required })}
                        />
                      )}

                      {attr.type === 'number' && (
                        <input
                          type="number"
                          className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                          placeholder={`Enter ${attr.label.toLowerCase()}`}
                          {...register(`attributes.${attr.key}`, {
                            required: attr.required,
                            valueAsNumber: true
                          })}
                        />
                      )}

                      {attr.type === 'select' && (
                        <select
                          className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                          {...register(`attributes.${attr.key}`, { required: attr.required })}
                        >
                          <option value="">Select {attr.label.toLowerCase()}</option>
                          {attr.options?.map((option: string) => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}

                      {attr.type === 'boolean' && (
                        <label className="flex items-center gap-2 p-2 border border-blue-300 rounded-lg bg-white cursor-pointer">
                          <input
                            type="checkbox"
                            className="rounded border-blue-300"
                            {...register(`attributes.${attr.key}`)}
                          />
                          <span className="text-sm text-blue-800">{attr.label}</span>
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  💡 These fields are specific to the "{selectedCategory.name}" category and will be saved with this product.
                </p>
              </div>
            )}

            {/* Images */}
            <ImageUpload
              images={productImages}
              onImagesChange={(images) => {
                setProductImages(images)
                setValue('imagePublicIds', images.join(','))
              }}
              maxImages={3}
              label="Product Images"
              showImageNames={true}
            />

            {/* Color Variants */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Color Variants (Optional)</h3>

              {/* Add New Color */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-gray-800 mb-3">Add New Color</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:border-black focus:outline-none"
                      placeholder="e.g., Black, Orange"
                      value={currentColor.name || ''}
                      onChange={(e) => setCurrentColor(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Color Value</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                        value={currentColor.value || '#000000'}
                        onChange={(e) => setCurrentColor(prev => ({ ...prev, value: e.target.value }))}
                      />
                      <input
                        type="text"
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-black focus:border-black focus:outline-none"
                        placeholder="#000000"
                        value={currentColor.value || '#000000'}
                        onChange={(e) => setCurrentColor(prev => ({ ...prev, value: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock for this color</label>
                    <input
                      type="number"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-black focus:border-black focus:outline-none"
                      placeholder="0"
                      value={currentColor.stock || 0}
                      onChange={(e) => setCurrentColor(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={addColorVariant}
                      className="w-full"
                    >
                      Add Color
                    </Button>
                  </div>
                </div>

                {/* Color Images Upload */}
                <ImageUpload
                  images={currentColor.images || []}
                  onImagesChange={(images) => {
                    setCurrentColor(prev => ({ ...prev, images }))
                  }}
                  maxImages={5}
                  label="Images for this color"
                  showImageNames={true}
                  colorVariant={currentColor.name}
                />
              </div>

              {/* Existing Color Variants */}
              {colorVariants.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Added Colors ({colorVariants.length})</h4>
                  <div className="space-y-3">
                    {colorVariants.map((variant, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full border-2 border-gray-300"
                            style={{ backgroundColor: variant.value }}
                          ></div>
                          <div>
                            <span className="font-medium">{variant.name}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {variant.images.length} image{variant.images.length !== 1 ? 's' : ''} • Stock: {variant.stock}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="danger"
                          size="sm"
                          onClick={() => removeColorVariant(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer">
                  <input type="checkbox" className="mt-1 rounded border-gray-300" {...register('active')} />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Active</span>
                    <span className="text-xs text-gray-500">Visible to customers on the store</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer">
                  <input type="checkbox" className="mt-1 rounded border-gray-300" {...register('featured')} />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Featured</span>
                    <span className="text-xs text-gray-500">Show in "Featured Products" section</span>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer">
                  <input type="checkbox" className="mt-1 rounded border-gray-300" {...register('topSelling')} />
                  <div>
                    <span className="text-sm font-semibold text-gray-900 block">Top Selling</span>
                    <span className="text-xs text-gray-500">Show in "Top Selling" section</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 border-t">
              <Button
                variant="secondary"
                onClick={resetForm}
                type="button"
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                type="submit"
                loading={isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
                {editingProduct ? 'Update Product' : 'Add Product'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Products List */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Existing Products</h2>
              <p className="text-gray-600 text-sm mt-1">Manage your product inventory</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" text="Loading products..." />
            </div>
          ) : !products || products.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-6xl mb-4 block">📦</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products yet</h3>
              <p className="text-gray-600 mb-4">Start by adding your first product above</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl mb-4 block">🔍</span>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product: any) => {
                    // Find category name
                    const category = categories?.find((c: any) => c.id === product.categoryId)

                    // Transform color variants to match ProductCard interface
                    const transformedColors = product.colorVariants?.map((variant: any) => ({
                      name: variant.name,
                      images: variant.images || []
                    })) || []

                    return (
                      <ProductCard
                        key={product.id}
                        product={{
                          id: product.id,
                          name: product.title,
                          price: product.price,
                          images: product.imagePublicIds || [],
                          colors: transformedColors,
                          stock: product.stock || 0,
                          category: category?.name || 'Uncategorized',
                          isActive: product.active !== false,
                          pricing: product.pricing || []
                        }}
                        onEdit={handleEdit}
                        onDelete={async (id) => await handleDelete(id, product.title)}
                        onToggleActive={async (id, isActive) => await toggleActive(id, isActive, product.title)}
                      />
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((p: any) => {
                    // Find category name
                    const category = categories?.find((c: any) => c.id === p.categoryId)
                    console.log(p.pricing?.[0]?.discountPrice)

                    return (
                      <div key={p.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{p.title}</h3>
                              {p.pricing?.[0]?.discountPrice ? (
                                <>
                                  <span className="text-lg text-green-600 font-semibold">
                                    AED {p.pricing[0].discountPrice}
                                  </span>
                                  <span className="text-sm text-gray-500 line-through">
                                    AED {p.pricing[0].price}
                                  </span>
                                </>
                              ) : (
                                <span className="text-lg font-semibold text-gray-900">
                                  AED {p.pricing?.[0]?.price}
                                </span>
                              )}
                              {/* <span className="text-sm font-semibold text-gray-500 line-through">
                                AED {p.pricing?.[0]?.price}
                              </span> */}
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                              <span>SKU: {p.sku || 'N/A'}</span>
                              <span>Stock: {p.stock ?? 0}</span>
                              <span>Brand: {p.brand || 'N/A'}</span>
                              <span>Category: {category?.name || 'Uncategorized'}</span>
                              {p.attributes && Object.keys(p.attributes).length > 0 && (
                                <span className="text-blue-600">
                                  {Object.keys(p.attributes).length} custom field{Object.keys(p.attributes).length !== 1 ? 's' : ''}
                                </span>
                              )}
                              <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${p.active !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {p.active !== false ? 'Active' : 'Inactive'}
                              </span>
                              {p.featured && (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Featured
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleEdit(p.id)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant={p.active !== false ? "warning" : "success"}
                              size="sm"
                              onClick={() => toggleActive(p.id, p.active !== false, p.title)}
                            >
                              {p.active !== false ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(p.id, p.title)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductsAdminPage