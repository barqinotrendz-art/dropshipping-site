/**
 * WishlistSync component is no longer needed.
 * Wishlist now syncs automatically via onAuthStateChanged in useWishlist hook.
 * This component is kept for backward compatibility but does nothing.
 */
const WishlistSync: React.FC = () => {
  return null
}

export default WishlistSync
