import type { Timestamp } from 'firebase/firestore'

export type PriceTier = {
  label: string
  price: number
  discountPrice?: number
}

export interface User {
  uid: string
  email: string
  displayName?: string
  role?: 'admin' | 'customer'
}

export interface Address {
  fullName: string
  phone: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface CartItem {
  id: string
  name: string
  productId?: string   // original product id
  price: number
  qty: number
  image?: string
  maxQty?: number
  pricing?: PriceTier[]  // ✅ ADD THIS LINE
  tierLabel?: string   // optional but useful
  color?: string

}

export interface ColorVariant {
  name: string
  value: string // hex color code
  images: string[] // array of Cloudinary public IDs
  stock: number
}

export interface Product {
  pricing: any
  id: string
  title: string // Changed from 'name' to 'title' to match Firestore
  slug?: string
  description?: string
  price: number
  discountPrice?: number
  categoryId?: string
  brand?: string
  sku?: string
  tags?: string[]
  imagePublicIds?: string[] // Cloudinary public IDs
  stock: number
  active?: boolean
  featured?: boolean
  topSelling?: boolean // Show in Top Selling section
  colorVariants?: ColorVariant[]
  rating?: number
  reviewCount?: number
  sort?: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  imagePublicId?: string // Cloudinary public ID for category image
  parentId?: string
  isActive: boolean
  active?: boolean // Alias for isActive
  sort?: number
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

export interface Order {
  id: string
  orderNumber?: string
  userId: string
  customerEmail?: string
  userEmail?: string // Legacy field for backward compatibility
  items: Array<{
    productId: string
    name: string
    price: number
    qty: number
  }>
  totals: {
    subtotal: number
    shipping: number
    discount?: number
    grandTotal: number
  }
  coupon?: {
    id: string
    code: string
    discount: number
  } | null
  currency: string
  payment: {
    method: string
    status: string
  }
  shipping: Address
  status: string
  timeline: Array<{
    status: string
    at: Timestamp
    note?: string
  }>
  createdAt: Timestamp
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount?: number
  isActive: boolean
  expiresAt?: Timestamp
  createdAt?: Timestamp
}

export interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  rating: number
  comment: string
  isApproved: boolean
  createdAt: Timestamp
}

export interface Banner {
  id: string
  title: string
  subtitle?: string
  image: string
  link?: string
  isActive: boolean
  order: number
  createdAt?: Timestamp
}

export const generateCartId = (
  productId: string,
  color?: string
) => {
  return `${productId}-${(color || 'default').toLowerCase().trim()}`
}