import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { slugify } from '../../utils/slugify'
import Button from '../../components/ui/Button'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ImageUpload from '../../components/ui/ImageUpload'
import toast from 'react-hot-toast'


type CategoryAttribute = {
  key: string              // volume, ram, strapMaterial
  label: string            // "Volume (ml)"
  type: 'text' | 'number' | 'select' | 'boolean'
  required?: boolean
  options?: string[]       // only for select
}

type CategoryTemplate = {
  name: string
  attributes: CategoryAttribute[]
}

const CATEGORY_TEMPLATES: CategoryTemplate[] = [
  {
    name: 'Electronics',
    attributes: [
      { key: 'brand', label: 'Brand', type: 'text', required: true },
      { key: 'model', label: 'Model', type: 'text', required: false },
      { key: 'warranty', label: 'Warranty (months)', type: 'number', required: false },
      { key: 'power', label: 'Power Consumption', type: 'text', required: false },
      { key: 'connectivity', label: 'Connectivity', type: 'select', required: false, options: ['WiFi', 'Bluetooth', 'USB', 'Wired', 'Wireless'] },
      { key: 'screenSize', label: 'Screen Size', type: 'text', required: false },
      { key: 'storage', label: 'Storage', type: 'select', required: false, options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] }
    ]
  },
  {
    name: 'Clothing',
    attributes: [
      { key: 'size', label: 'Size', type: 'select', required: true, options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'] },
      { key: 'material', label: 'Material', type: 'select', required: true, options: ['Cotton', 'Polyester', 'Wool', 'Silk', 'Linen', 'Denim', 'Mixed'] },
      { key: 'gender', label: 'Gender', type: 'select', required: true, options: ['Men', 'Women', 'Unisex', 'Kids'] },
      { key: 'season', label: 'Season', type: 'select', required: false, options: ['Spring', 'Summer', 'Autumn', 'Winter', 'All Season'] },
      { key: 'care', label: 'Care Instructions', type: 'text', required: false },
      { key: 'fit', label: 'Fit', type: 'select', required: false, options: ['Slim', 'Regular', 'Loose', 'Oversized'] }
    ]
  },
  {
    name: 'Watches',
    attributes: [
      { key: 'caseMaterial', label: 'Case Material', type: 'select', required: true, options: ['Stainless Steel', 'Gold', 'Silver', 'Plastic', 'Leather', 'Ceramic'] },
      { key: 'strapMaterial', label: 'Strap Material', type: 'select', required: true, options: ['Leather', 'Metal', 'Silicone', 'Fabric', 'Rubber'] },
      { key: 'waterResistance', label: 'Water Resistance', type: 'select', required: false, options: ['30m', '50m', '100m', '200m', '300m', 'Not Water Resistant'] },
      { key: 'movement', label: 'Movement Type', type: 'select', required: true, options: ['Quartz', 'Mechanical', 'Automatic', 'Digital'] },
      { key: 'dialSize', label: 'Dial Size (mm)', type: 'number', required: false },
      { key: 'gender', label: 'Gender', type: 'select', required: true, options: ['Men', 'Women', 'Unisex'] }
    ]
  },
  {
    name: 'Footwear',
    attributes: [
      { key: 'size', label: 'Size', type: 'select', required: true, options: ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'] },
      { key: 'material', label: 'Material', type: 'select', required: true, options: ['Leather', 'Canvas', 'Synthetic', 'Mesh', 'Suede'] },
      { key: 'gender', label: 'Gender', type: 'select', required: true, options: ['Men', 'Women', 'Unisex', 'Kids'] },
      { key: 'type', label: 'Type', type: 'select', required: true, options: ['Sneakers', 'Formal', 'Casual', 'Sports', 'Sandals', 'Boots'] },
      { key: 'sole', label: 'Sole Material', type: 'select', required: false, options: ['Rubber', 'Leather', 'EVA', 'TPU', 'PVC'] },
      { key: 'heelHeight', label: 'Heel Height (cm)', type: 'number', required: false }
    ]
  },
  {
    name: 'Beauty & Cosmetics',
    attributes: [
      { key: 'skinType', label: 'Suitable for Skin Type', type: 'select', required: false, options: ['Oily', 'Dry', 'Combination', 'Sensitive', 'All Types'] },
      { key: 'volume', label: 'Volume/Weight', type: 'text', required: true },
      { key: 'spf', label: 'SPF Rating', type: 'select', required: false, options: ['SPF 15', 'SPF 30', 'SPF 50', 'No SPF'] },
      { key: 'ingredients', label: 'Key Ingredients', type: 'text', required: false },
      { key: 'shade', label: 'Shade/Color', type: 'text', required: false },
      { key: 'finish', label: 'Finish', type: 'select', required: false, options: ['Matte', 'Glossy', 'Satin', 'Shimmer', 'Natural'] }
    ]
  },
  {
    name: 'Home & Garden',
    attributes: [
      { key: 'material', label: 'Material', type: 'select', required: true, options: ['Wood', 'Metal', 'Plastic', 'Glass', 'Ceramic', 'Fabric'] },
      { key: 'dimensions', label: 'Dimensions (L×W×H)', type: 'text', required: false },
      { key: 'weight', label: 'Weight (kg)', type: 'number', required: false },
      { key: 'roomType', label: 'Room Type', type: 'select', required: false, options: ['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Garden', 'Office'] },
      { key: 'assembly', label: 'Assembly Required', type: 'boolean', required: false },
      { key: 'maintenance', label: 'Maintenance Instructions', type: 'text', required: false }
    ]
  }
]

 type CategoryForm = {
  name: string
  slug?: string
  parentId?: string | null
  sort?: number
  active?: boolean
  imagePublicId?: string

  attributes?: CategoryAttribute[]
}


async function fetchCategories() {
  const q = query(collection(db, 'categories'), orderBy('sort', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))
}

const CategoriesAdminPage: React.FC = () => {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: fetchCategories })
  const { register, handleSubmit, reset, watch, setValue } = useForm<CategoryForm>({
    defaultValues: { active: true, sort: (data?.length || 0) + 1 }
  })
  const name = watch('name')
  const computedSlug = slugify(name || '')
  const [categoryImage, setCategoryImage] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [attributes, setAttributes] = useState<CategoryAttribute[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')

  const onSubmit = async (values: CategoryForm) => {
    setIsSubmitting(true)
    toast.loading('Adding category...', { id: 'add-category' })
    
    try {
      const payload = {
        name: values.name,
        slug: values.slug && values.slug.length > 0 ? values.slug : slugify(values.name),
        parentId: values.parentId || null,
        sort: Number(values.sort || 0),
        active: values.active !== false,
        imagePublicId: categoryImage[0] || null,
        attributes: attributes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }
      await addDoc(collection(db, 'categories'), payload)
      toast.success(`Category "${values.name}" added successfully!`, { id: 'add-category' })
      reset({ name: '', slug: '', parentId: undefined, active: true, sort: (data?.length || 0) + 1 })
      setCategoryImage([])
      setAttributes([])
      setSelectedTemplate('')
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('Failed to add category. Please try again.', { id: 'add-category' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, categoryName: string) => {
    if (!confirm(`Are you sure you want to delete "${categoryName}"? This action cannot be undone.`)) {
      return
    }
    
    setDeletingId(id)
    toast.loading('Deleting category...', { id: `delete-${id}` })
    
    try {
      await deleteDoc(doc(db, 'categories', id))
      toast.success(`Category "${categoryName}" deleted successfully!`, { id: `delete-${id}` })
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Failed to delete category. Please try again.', { id: `delete-${id}` })
    } finally {
      setDeletingId(null)
    }
  }

  const toggleActive = async (id: string, currentActive: boolean | undefined, categoryName: string) => {
    setTogglingId(id)
    // Treat undefined or true as active, only false as inactive
    const isCurrentlyActive = currentActive !== false
    const newStatus = !isCurrentlyActive
    toast.loading(`${newStatus ? 'Activating' : 'Deactivating'} category...`, { id: `toggle-${id}` })
    
    try {
      await updateDoc(doc(db, 'categories', id), { active: newStatus, updatedAt: serverTimestamp() })
      toast.success(`Category "${categoryName}" ${newStatus ? 'activated' : 'deactivated'} successfully!`, { id: `toggle-${id}` })
      qc.invalidateQueries({ queryKey: ['admin-categories'] })
      qc.invalidateQueries({ queryKey: ['categories'] })
    } catch (error) {
      console.error('Error toggling category:', error)
      toast.error('Failed to update category status. Please try again.', { id: `toggle-${id}` })
    } finally {
      setTogglingId(null)
    }
  }

  const addAttribute = () => {
    setAttributes(prev => [...prev, { 
      key: '', 
      label: '', 
      type: 'text', 
      required: false 
    }])
  }

  const updateAttribute = (index: number, field: keyof CategoryAttribute, value: any) => {
    setAttributes(prev => prev.map((attr, i) => 
      i === index ? { ...attr, [field]: value } : attr
    ))
  }

  const removeAttribute = (index: number) => {
    setAttributes(prev => prev.filter((_, i) => i !== index))
  }

  const applyTemplate = (templateName: string) => {
    const template = CATEGORY_TEMPLATES.find(t => t.name === templateName)
    if (template) {
      setAttributes([...template.attributes])
      setSelectedTemplate(templateName)
      toast.success(`Template "${templateName}" applied! You can customize or add more attributes.`)
    }
  }

  const clearTemplate = () => {
    setAttributes([])
    setSelectedTemplate('')
    toast.success('Template cleared. You can now add custom attributes.')
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full border overflow-x-hidden">
      <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold">Admin • Categories</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6 max-w-full sm:max-w-2xl bg-white p-4 sm:p-6 rounded-lg border">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Category Name *</label>
          <input className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-black focus:outline-none" placeholder="e.g., Electronics, Clothing" {...register('name', { required: true })} />
          {name && <p className="text-xs text-gray-500 mt-1">Slug preview: {computedSlug}</p>}
        </div>
        
        <ImageUpload
          images={categoryImage}
          onImagesChange={(images) => {
            setCategoryImage(images)
            setValue('imagePublicId', images[0] || '')
          }}
          maxImages={1}
          label="Category Image"
          showImageNames={false}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Slug (optional)</label>
            <input className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-black focus:outline-none" placeholder={computedSlug} {...register('slug')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
            <input type="number" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-black focus:outline-none" {...register('sort', { valueAsNumber: true })} />
          </div>
          <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-black transition-colors cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" {...register('active')} />
            <div>
              <span className="text-sm font-semibold text-gray-900 block">Active</span>
              <span className="text-xs text-gray-500">Visible on store</span>
            </div>
          </label>
        </div>

        {/* Category Attributes Definition */}
        <div className="space-y-6 border-t pt-6">
          <div>
            <h3 className="text-base font-medium text-gray-900 mb-4">Product Fields for This Category</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add extra fields that customers will fill when adding products to this category.
              <br />Example: For "Electronics" add Brand, Model, Warranty fields
            </p>
          </div>
          
          {/* Template Selector */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-3">Quick Start: Choose a Ready Template</h4>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <select
                  value={selectedTemplate}
                  onChange={(e) => e.target.value ? applyTemplate(e.target.value) : null}
                  className="w-full border border-blue-300 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none bg-white"
                >
                  <option value="">Pick a category type to get started quickly...</option>
                  {CATEGORY_TEMPLATES.map((template) => (
                    <option key={template.name} value={template.name}>
                      {template.name} - {template.attributes.length} ready fields
                    </option>
                  ))}
                </select>
              </div>
              {selectedTemplate && (
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={clearTemplate}
                  className="bg-white border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  Clear
                </Button>
              )}
            </div>
            {selectedTemplate ? (
              <p className="text-xs text-blue-700 mt-2">
                Great! Applied "{selectedTemplate}" template with ready fields. You can edit them or add more below.
              </p>
            ) : (
              <p className="text-xs text-blue-600 mt-2">
                Choose Electronics, Clothing, Watches, etc. to instantly get common fields for that category type
              </p>
            )}
          </div>
          
          {/* Custom Attributes Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-900">
                {selectedTemplate ? 'Your Category Fields (Template + Custom)' : 'Create Custom Fields'}
              </h4>
              <Button type="button" variant="outline" size="sm" onClick={addAttribute}>
                Add New Field
              </Button>
            </div>
            
            {attributes.length === 0 && (
              <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">No extra fields yet</p>
                <p className="text-xs text-gray-400">
                  Products will only have basic info (name, price, description)
                  <br />Add fields like Size, Color, Brand to collect more details
                </p>
              </div>
            )}
            
            {attributes.length > 0 && (
              <div className="space-y-4">
                {attributes.map((attr, index) => (
                  <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3 bg-white">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        Field #{index + 1}
                      </span>
                      <Button 
                        type="button" 
                        variant="danger" 
                        size="sm" 
                        onClick={() => removeAttribute(index)}
                      >
                        Remove
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Name (Internal) *
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-black focus:outline-none"
                          placeholder="size, color, brand (no spaces)"
                          value={attr.key}
                          onChange={(e) => updateAttribute(index, 'key', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          System name (lowercase, no spaces)
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label (What Users See) *
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-black focus:outline-none"
                          placeholder="Size, Color, Brand Name"
                          value={attr.label}
                          onChange={(e) => updateAttribute(index, 'label', e.target.value)}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Friendly name shown on forms
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Input Type</label>
                        <select
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-black focus:outline-none"
                          value={attr.type}
                          onChange={(e) => updateAttribute(index, 'type', e.target.value as CategoryAttribute['type'])}
                        >
                          <option value="text">Text Box (for words)</option>
                          <option value="number">Number Input (for quantities)</option>
                          <option value="select">Dropdown Menu (multiple choices)</option>
                          <option value="boolean">Checkbox (yes/no)</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={attr.required || false}
                            onChange={(e) => updateAttribute(index, 'required', e.target.checked)}
                          />
                          Must Fill (Required)
                        </label>
                      </div>
                    </div>
                    
                    {attr.type === 'select' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dropdown Choices *
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-black focus:outline-none"
                          placeholder="Small, Medium, Large (separate with commas)"
                          value={attr.options?.join(', ') || ''}
                          onChange={(e) => updateAttribute(index, 'options', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Type each choice, separate with commas
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {attributes.length > 0 && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <span className="font-medium">{attributes.length} extra field{attributes.length !== 1 ? 's' : ''} ready!</span>
                  <br />
                  These will show up when someone adds products to this category
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" loading={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Category'}
          </Button>
        </div>
      </form>

      <div>
        <h2 className="text-lg sm:text-xl font-semibold mb-2">Existing Categories</h2>
        {isLoading && <LoadingSpinner size="md" text="Loading categories..." />}
        {!isLoading && (!data || data.length === 0) && <p className="text-gray-500 text-sm sm:text-base">No categories yet.</p>}
        <ul className="space-y-3 sm:space-y-2">
          {data?.map((c: any) => (
            <li key={c.id} className="border rounded p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-sm sm:text-base">{c.name} <span className="text-xs opacity-70">({c.slug})</span></div>
                <div className="text-xs sm:text-sm opacity-70">
                  sort: {c.sort ?? '-'} • 
                  <span className={c.active !== false ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                    {c.active !== false ? 'Active' : 'Inactive'}
                  </span>
                  {c.attributes && c.attributes.length > 0 && (
                    <span> • {c.attributes.length} custom attribute{c.attributes.length !== 1 ? 's' : ''}</span>
                  )}
                </div>
                {c.attributes && c.attributes.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {c.attributes.slice(0, 3).map((attr: any, i: number) => (
                      <span 
                        key={i}
                        className="inline-flex px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700"
                      >
                        {attr.label || attr.key}
                      </span>
                    ))}
                    {c.attributes.length > 3 && (
                      <span className="inline-flex px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                        +{c.attributes.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => toggleActive(c.id, c.active, c.name)}
                  loading={togglingId === c.id}
                  disabled={togglingId === c.id || deletingId === c.id}
                  className="flex-1 sm:flex-none"
                >
                  {c.active !== false ? 'Deactivate' : 'Activate'}
                </Button>
                <Button 
                  size="sm" 
                  variant="danger" 
                  onClick={() => handleDelete(c.id, c.name)}
                  loading={deletingId === c.id}
                  disabled={deletingId === c.id || togglingId === c.id}
                  className="flex-1 sm:flex-none"
                >
                  Delete
                </Button>
                
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default CategoriesAdminPage
