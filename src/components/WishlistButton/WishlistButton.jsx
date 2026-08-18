import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlistRequest } from '../../api/wishlist'
import {
	setLocalWishlist,
	toggleLocalWishlist,
} from '../../store/slices/wishlistSlice'
import { idsAreEqual } from '../../utils/id'

function WishlistButton({ productId }) {
	const [loading, setLoading] = useState(false)
	const dispatch = useDispatch()
	const { productIds } = useSelector((state) => state.wishlist)
	const isInWishlist = productIds.some((id) => idsAreEqual(id, productId))

	const handleToggle = async () => {
		if (loading) return

		try {
			setLoading(true)
			dispatch(toggleLocalWishlist(productId))

			const syncedWishlist = await toggleWishlistRequest(productId)

			if (Array.isArray(syncedWishlist)) {
				dispatch(setLocalWishlist(syncedWishlist))
			}
		} catch (toggleError) {
			console.log('No se pudo sincronizar la wishlist con el back', toggleError)
		} finally {
			setLoading(false)
		}
	}

	return (
		<button
			type="button"
			className={isInWishlist ? 'product-card__action-button is-active' : 'product-card__action-button'}
			onClick={handleToggle}
			disabled={loading}
		>
			{isInWishlist ? 'Quitar de wishlist' : 'Añadir a wishlist'}
		</button>
	)
}

export default WishlistButton