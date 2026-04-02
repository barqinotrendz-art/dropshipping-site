import { collection, getDocs, updateDoc, doc, query, where, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

/**
 * Utility function to update rating and reviewCount for all products
 * Run this once to sync product stats with approved reviews
 */
export async function updateAllProductStats() {
  try {
    // Get all products
    const productsSnap = await getDocs(collection(db, 'products'))
    const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    // Get all approved reviews
    const reviewsQuery = query(
      collection(db, 'reviews'),
      where('status', '==', 'approved')
    )
    const reviewsSnap = await getDocs(reviewsQuery)
    const reviews = reviewsSnap.docs.map(d => d.data())

    // Group reviews by productId
    const reviewsByProduct = reviews.reduce((acc: any, review: any) => {
      if (!acc[review.productId]) {
        acc[review.productId] = []
      }
      acc[review.productId].push(review)
      return acc
    }, {})

    // Update each product
    let updatedCount = 0
    for (const product of products) {
      const productReviews = reviewsByProduct[product.id] || []
      const reviewCount = productReviews.length
      const rating = reviewCount > 0
        ? productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewCount
        : 0

      const roundedRating = Math.round(rating * 10) / 10

      // Update product document
      await updateDoc(doc(db, 'products', product.id), {
        rating: roundedRating,
        reviewCount,
        updatedAt: serverTimestamp()
      })

      updatedCount++
    }

    return { success: true, updatedCount }
  } catch (error) {
    throw error
  }
}
