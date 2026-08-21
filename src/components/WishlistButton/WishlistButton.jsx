import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlistRequest } from '../../api/wishlist'
import Button from '../Button/Button'
import {
	setLocalWishlist,
	toggleLocalWishlist,
} from '../../store/slices/wishlistSlice'
import { idsAreEqual } from '../../utils/id'

function WishlistButton({ productId }) {
	const [loading, setLoading] = useState(false)
	const dispatch = useDispatch()
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const isInWishlist = wishlistIds.some((id) => idsAreEqual(id, productId))

	// Toggle optimista: actualiza la UI primero y luego sincroniza con backend.
	const handleToggleWishlist = async () => {
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
		<Button
			type="button"
			variant={isInWishlist ? 'primary' : 'outline'}
			className={isInWishlist ? 'product-card__action-button is-active' : 'product-card__action-button'}
			onClick={handleToggleWishlist}
			disabled={loading}
		>
			{isInWishlist ? 'Quitar favoritos' : 'Añadir favoritos'}
		</Button>
	)
}

export default WishlistButton