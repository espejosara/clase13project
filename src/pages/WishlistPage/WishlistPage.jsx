import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import { fetchWishlistRequest, toggleWishlistRequest } from '../../api/wishlist'
import { useProducts } from '../../hooks/useProducts'
import {
	setLocalWishlist,
	toggleLocalWishlist,
} from '../../store/slices/wishlistSlice'

function WishlistPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [togglingWishlist, setTogglingWishlist] = useState(null)
	const dispatch = useDispatch()
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const { data: products, loading: productsLoading, error: productsError } = useProducts()

	useEffect(() => {
		// Carga inicial de favoritos desde backend y sincronización con Redux.
		async function loadWishlist() {
			try {
				const data = await fetchWishlistRequest()
				dispatch(setLocalWishlist(data))
			} catch {
				setError('No se pudo cargar la wishlist.')
			} finally {
				setLoading(false)
			}
		}

		loadWishlist()
	}, [dispatch])

	const productsById = useMemo(() => {
		return products.reduce((lookup, product) => {
			lookup.set(String(product.id), product)
			return lookup
		}, new Map())
	}, [products])

	const wishlistProducts = useMemo(() => {
		return wishlistIds
			.map((productId) => productsById.get(String(productId)))
			.filter(Boolean)
	}, [wishlistIds, productsById])

	// Alterna un favorito desde la página y mantiene el estado local sincronizado.
	const handleToggleWishlist = async (productId) => {
		if (togglingWishlist === productId) return

		try {
			setTogglingWishlist(productId)
			dispatch(toggleLocalWishlist(productId))

			const syncedWishlist = await toggleWishlistRequest(productId)

			if (Array.isArray(syncedWishlist)) {
				dispatch(setLocalWishlist(syncedWishlist))
			}
		} catch (toggleError) {
			console.log('No se pudo sincronizar la wishlist con el back', toggleError)
		} finally {
			setTogglingWishlist(null)
		}
	}

	const isLoading = loading || productsLoading

	return (
		<section>
			<h1>Favoritos</h1>
			{isLoading ? <Spinner label="Cargando favoritos..." /> : null}
			{productsError ? <p>No se pudo cargar el catálogo para mostrar los favoritos.</p> : null}
			{error ? <p>Error: {error}</p> : null}

			{!isLoading && !wishlistIds.length ? <p>No tienes productos guardados en favoritos.</p> : null}

			{wishlistProducts.length ? (
				<ul>
					{wishlistProducts.map((product) => (
						<li key={product.id}>
							<Link to={`/products/${product.id}`}>
								<img src={product.imageUrl} alt={product.name} width="120" />
								<h2>{product.name}</h2>
								<p>{product.category}</p>
								<p>{product.price.toFixed(2)} EUR</p>
							</Link>{' '}
							<button
								type="button"
								onClick={() => handleToggleWishlist(product.id)}
								disabled={togglingWishlist === product.id}
							>
								Quitar de favoritos
							</button>
						</li>
					))}
				</ul>
			) : null}
		</section>
	)
}

export default WishlistPage