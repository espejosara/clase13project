import { useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import { useProducts } from '../../hooks/useProducts'
import { idsAreEqual } from '../../utils/id'
import {
	fetchWishlistThunk,
	removeWishlistThunk,
} from '../../store/slices/wishlistSlice'

function WishlistPage() {
	const dispatch = useDispatch()
	const { productIds, loading, error } = useSelector((state) => state.wishlist)
	const { data: products, loading: productsLoading, error: productsError } = useProducts()

	useEffect(() => {
		dispatch(fetchWishlistThunk())
	}, [dispatch])

	const productsById = useMemo(() => {
		return products.reduce((lookup, product) => {
			lookup.set(String(product.id), product)
			return lookup
		}, new Map())
	}, [products])

	const wishlistProducts = useMemo(() => {
		return productIds
			.map((productId) => productsById.get(String(productId)))
			.filter(Boolean)
	}, [productIds, productsById])

	const handleRemove = (productId) => {
		dispatch(removeWishlistThunk(productId))
	}

	const isLoading = loading || productsLoading

	return (
		<section>
			<h1>Favoritos</h1>
			{isLoading ? <Spinner label="Cargando favoritos..." /> : null}
			{productsError ? <p>No se pudo cargar el catálogo para mostrar los favoritos.</p> : null}
			{error ? <p>Error: {error}</p> : null}

			{!isLoading && !productIds.length ? <p>No tienes productos guardados en favoritos.</p> : null}

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
							<button type="button" onClick={() => handleRemove(product.id)} disabled={loading}>
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