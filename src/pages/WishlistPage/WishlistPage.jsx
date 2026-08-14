import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
	fetchWishlistThunk,
	toggleWishlistThunk,
} from '../../store/slices/wishlistSlice'

function WishlistPage() {
	const dispatch = useDispatch()
	const { productIds, loading, error } = useSelector((state) => state.wishlist)

	useEffect(() => {
		dispatch(fetchWishlistThunk())
	}, [dispatch])

	const handleRemove = (productId) => {
		dispatch(toggleWishlistThunk(productId))
	}

	return (
		<section>
			<h1>Wishlist</h1>
			{loading ? <p>Cargando wishlist...</p> : null}
			{error ? <p>Error: {error}</p> : null}

			{!loading && !productIds.length ? <p>No tienes productos guardados en favoritos.</p> : null}

			{productIds.length ? (
				<ul>
					{productIds.map((productId) => (
						<li key={productId}>
							<Link to={`/products/${productId}`}>Producto {productId}</Link>{' '}
							<button type="button" onClick={() => handleRemove(productId)} disabled={loading}>
								Quitar
							</button>
						</li>
					))}
				</ul>
			) : null}
		</section>
	)
}

export default WishlistPage