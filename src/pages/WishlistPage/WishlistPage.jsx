import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../components/Button/Button'
import Spinner from '../../components/Spinner/Spinner'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { fetchWishlistRequest, toggleWishlistRequest } from '../../api/wishlist'
import { useProducts } from '../../hooks/useProducts'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import {
	setLocalWishlist,
	toggleLocalWishlist,
} from '../../store/slices/wishlistSlice'
import styles from './WishlistPage.module.css'

const FALLBACK_IMAGE =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="%23fff7ed"/><text x="50%25" y="54%25" text-anchor="middle" font-size="10" fill="%23c2410c" font-family="Arial">IMG</text></svg>'

function WishlistPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [togglingWishlist, setTogglingWishlist] = useState(null)
	const [addingToCart, setAddingToCart] = useState(null)
	const dispatch = useDispatch()
	const wishlistIds = useSelector((state) => state.wishlist.ids)
	const {
		data: products,
		loading: productsLoading,
		error: productsError,
		refetch: refetchProducts,
	} = useProducts()

	useEffect(() => {
		// Carga inicial de favoritos desde backend y sincronización con Redux.
		let isMounted = true

		const fetchInitialWishlist = async () => {
			try {
				const data = await fetchWishlistRequest()
				if (isMounted) {
					dispatch(setLocalWishlist(data))
					setError('')
				}
			} catch {
				if (isMounted) {
					setError('No se pudo cargar la wishlist.')
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		fetchInitialWishlist()

		return () => {
			isMounted = false
		}
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
	const hasFetchError = Boolean(error || productsError)

	const handleRetry = async () => {
		setLoading(true)
		refetchProducts()

		try {
			const data = await fetchWishlistRequest()
			dispatch(setLocalWishlist(data))
			setError('')
		} catch {
			setError('No se pudo cargar la wishlist.')
		} finally {
			setLoading(false)
		}
	}

	const handleAddToCart = async (productId) => {
		if (addingToCart === productId) return

		try {
			setAddingToCart(productId)
			await dispatch(addCartItemThunk({ productId, quantity: 1 })).unwrap()
		} catch (addError) {
			console.log('No se pudo añadir al carrito desde favoritos', addError)
		} finally {
			setAddingToCart(null)
		}
	}

	return (
		<main className={styles.page}>
			<section className={styles.hero}>
				<h1 className={styles.title}>Tus productos favoritos</h1>
			</section>

			{isLoading ? <Spinner label="Cargando favoritos..." /> : null}
			{hasFetchError ? (
				<div className={styles.messageRow}>
					<StatusMessage
						title="Error"
						description={error || productsError}
						variant="warning"
					/>
					<Button
						type="button"
						variant="primary"
						onClick={handleRetry}
						disabled={isLoading}
					>
						Reintentar
					</Button>
				</div>
			) : null}

			{!isLoading && !wishlistIds.length ? (
				<StatusMessage
					title="Lista vacia"
					description="No tienes productos guardados en favoritos."
				/>
			) : null}

			{wishlistProducts.length ? (
				<ul className={styles.list}>
					{wishlistProducts.map((product) => (
						<li key={product.id} className={styles.item}>
							<Link to={`/products/${product.id}`} className={styles.itemLink}>
								<img
									src={product.imageUrl || FALLBACK_IMAGE}
									alt={product.name}
									className={styles.thumb}
								/>
								<div className={styles.content}>
									<h2 className={styles.name}>{product.name}</h2>
									<p className={styles.meta}>{product.category}</p>
									<p className={styles.price}>{product.price.toFixed(2)} EUR</p>
								</div>
							</Link>

							<div className={styles.actions}>
								<Button
									type="button"
									variant="primary"
									onClick={() => handleAddToCart(product.id)}
									disabled={addingToCart === product.id}
									className={styles.cartButton}
								>
									{addingToCart === product.id ? 'Añadiendo...' : '🛒 + Añadir'}
								</Button>

								<button
									type="button"
									className={styles.removeButton}
									onClick={() => handleToggleWishlist(product.id)}
									disabled={togglingWishlist === product.id}
									aria-label={`Quitar ${product.name} de favoritos`}
								>
									{togglingWishlist === product.id ? '…' : '✕'}
								</button>
							</div>
						</li>
					))}
				</ul>
			) : null}
		</main>
	)
}

export default WishlistPage