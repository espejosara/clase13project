import { useDispatch, useSelector } from 'react-redux'
import { toggleWishlistThunk } from '../../store/slices/wishlistSlice'
import { idsAreEqual } from '../../utils/id'

function WishlistButton({ productId }) {
	const dispatch = useDispatch()
	const { productIds, loading } = useSelector((state) => state.wishlist)
	const isInWishlist = productIds.some((id) => idsAreEqual(id, productId))

	const handleToggle = () => {
		dispatch(toggleWishlistThunk(productId))
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