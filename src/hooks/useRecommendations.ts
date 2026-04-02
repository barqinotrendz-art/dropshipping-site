import { useQuery } from '@tanstack/react-query'
import { collection, getDocs, query, where, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'

export type RecommendedProduct = {
  id: string
  title: string
  slug: string
  price: number
  discountPrice?: number
  imagePublicIds?: string[]
  rating?: number
  reviewCount?: number
  brand?: string
  categoryId: string
}

async function fetchRecommendations(
  productId: string,
  categoryId: string,
  brand?: string
): Promise<RecommendedProduct[]> {
  try {
    let recommendations: RecommendedProduct[] = []

    // Strategy 1: Get products from same category (if categoryId exists)
    if (categoryId) {
      const categoryQuery = query(
        collection(db, 'products'),
        where('categoryId', '==', categoryId),
        limit(20)
      )
      
      const categorySnap = await getDocs(categoryQuery)
      recommendations = categorySnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as RecommendedProduct))
        .filter(product => product.id !== productId && product.imagePublicIds && product.imagePublicIds.length > 0)
        
      // Sort by rating in memory
      recommendations.sort((a, b) => (b.rating || 0) - (a.rating || 0))
    }

    // Strategy 2: If we have brand, prioritize same brand products
    if (brand && recommendations.length > 0) {
      const sameBrand = recommendations.filter(p => p.brand === brand)
      const otherBrands = recommendations.filter(p => p.brand !== brand)
      recommendations = [...sameBrand, ...otherBrands]
    }

    // Strategy 3: If not enough recommendations, get any active products
    if (recommendations.length < 4) {
      const allProductsQuery = query(
        collection(db, 'products'),
        limit(20)
      )
      
      const allSnap = await getDocs(allProductsQuery)
      const allProducts = allSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as RecommendedProduct))
        .filter(product => 
          product.id !== productId && 
          product.imagePublicIds && 
          product.imagePublicIds.length > 0 &&
          !recommendations.some(r => r.id === product.id)
        )
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      
      recommendations = [...recommendations, ...allProducts]
    }

    // Return top 4 recommendations
    return recommendations.slice(0, 4)
  } catch (error) {
    return []
  }
}

export function useRecommendations(productId: string, categoryId: string, brand?: string) {
  return useQuery({
    queryKey: ['recommendations', productId, categoryId, brand],
    queryFn: () => fetchRecommendations(productId, categoryId, brand),
    enabled: !!productId, // Only require productId, categoryId is optional
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}
