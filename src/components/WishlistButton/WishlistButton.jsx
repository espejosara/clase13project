import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlistRequest } from '../../api/wishlist'
import Button from '../Button/Button'
import {
	setLocalWishlist,
	toggleLocalWishlist,
} from '../../store/slices/wishlistSlice'
import { idsAreEqual } from '../../utils/id'

function WishlistButton({ productId, className = '', activeClassName = '' }) {
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

			if (syncedWishlist) {
				dispatch(setLocalWishlist(syncedWishlist))
			}
		} catch (toggleError) {
			console.log('No se pudo sincronizar la wishlist con el back', toggleError)
		} finally {
			setLoading(false)
		}
	}

	const composedClassName = [className, isInWishlist ? activeClassName : ''].filter(Boolean).join(' ')

	return (
		<Button
			type="button"
			variant={isInWishlist ? 'primary' : 'outline'}
			className={composedClassName}
			onClick={handleToggleWishlist}
			disabled={loading}
			aria-pressed={isInWishlist}
			aria-label={isInWishlist ? 'Quitar de favoritos' : 'Añadir a favoritos'}
		>
			{isInWishlist ? 'Quitar favoritos' : 'Añadir favoritos'}
		</Button>
	)
}

export default WishlistButton
