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
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%23eff6ff"/><text x="50%25" y="52%25" text-anchor="middle" font-size="18" fill="%2364748b" font-family="Arial">Sin imagen</text></svg>'

function formatPrice(value) {
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: 'EUR',
	}).format(Number(value ?? 0))
}

function getWishlistDescription(count) {
	if (count === 1) return 'Tienes 1 producto guardado para más adelante.'
	if (count > 1) return `Tienes ${count} productos guardados para más adelante.`
	return 'Guarda aquí los productos que quieras consultar más adelante.'
}

function getCountLabel(count, singular, plural) {
	return `${count} ${count === 1 ? singular : plural}`
}

function WishlistPage() {
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [actionError, setActionError] = useState('')
	const [actionMessage, setActionMessage] = useState('')
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
					setError('No pudimos cargar tus favoritos.')
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

	const handleToggleWishlist = async (productId) => {
		if (togglingWishlist === productId) return
		const previousWishlistIds = [...wishlistIds]

		try {
			setActionError('')
			setActionMessage('')
			setTogglingWishlist(productId)
			dispatch(toggleLocalWishlist(productId))

			const syncedWishlist = await toggleWishlistRequest(productId)
			if (syncedWishlist) {
				dispatch(setLocalWishlist(syncedWishlist))
			}
		} catch (toggleError) {
			dispatch(setLocalWishlist(previousWishlistIds))
			setActionError('No pudimos quitar el producto de favoritos. Inténtalo de nuevo.')
			console.error('No se pudo sincronizar la wishlist con el back', toggleError)
		} finally {
			setTogglingWishlist(null)
		}
	}

	const isLoading = loading || productsLoading
	const hasFetchError = Boolean(error || productsError)

	const handleRetry = async () => {
		setLoading(true)
		setActionError('')
		setActionMessage('')
		refetchProducts()

		try {
			const data = await fetchWishlistRequest()
			dispatch(setLocalWishlist(data))
			setError('')
		} catch {
			setError('No pudimos cargar tus favoritos.')
		} finally {
			setLoading(false)
		}
	}

	const handleAddToCart = async (product) => {
		if (addingToCart === product.id || togglingWishlist === product.id) return

		try {
			setActionError('')
			setActionMessage('')
			setAddingToCart(product.id)
			await dispatch(addCartItemThunk({ productId: product.id, quantity: 1 })).unwrap()
			setActionMessage(`${product.name} se ha añadido al carrito.`)
		} catch (addError) {
			setActionError('No pudimos añadir el producto al carrito. Inténtalo de nuevo.')
			console.error('No se pudo añadir al carrito desde favoritos', addError)
		} finally {
			setAddingToCart(null)
		}
	}

	return (
		<section className={styles.page} aria-labelledby="wishlist-title">
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<p className={styles.eyebrow}>Tu selección</p>
					<h1 id="wishlist-title" className={styles.title}>Mis favoritos</h1>
					<p className={styles.subtitle}>{getWishlistDescription(wishlistIds.length)}</p>
				</div>
				<div
					className={styles.heroBadge}
					aria-label={getCountLabel(wishlistIds.length, 'producto favorito', 'productos favoritos')}
				>
					<span aria-hidden="true">♥</span>
					<strong>{wishlistIds.length}</strong>
					<span>{wishlistIds.length === 1 ? 'favorito' : 'favoritos'}</span>
				</div>
			</header>

			{isLoading ? <Spinner label="Cargando favoritos..." /> : null}

			{hasFetchError ? (
				<div className={styles.messageRow}>
					<StatusMessage
						title="No pudimos cargar tus favoritos"
						description={error || productsError}
						variant="warning"
					/>
					<Button type="button" variant="primary" onClick={handleRetry} disabled={isLoading}>
						Reintentar
					</Button>
				</div>
			) : null}

			{actionMessage ? (
				<StatusMessage title="Añadido al carrito" description={actionMessage} variant="success" />
			) : null}

			{actionError ? (
				<StatusMessage title="No pudimos completar la acción" description={actionError} variant="error" />
			) : null}

			{!isLoading && !hasFetchError && !wishlistIds.length ? (
				<section className={styles.emptyState} aria-labelledby="empty-wishlist-title">
					<span className={styles.emptyIcon} aria-hidden="true">♡</span>
					<h2 id="empty-wishlist-title">Todavía no tienes favoritos</h2>
					<p>Guarda los productos que te interesen para encontrarlos fácilmente más adelante.</p>
					<Link to="/products" className={styles.catalogButton}>Explorar catálogo</Link>
				</section>
			) : null}

			{wishlistProducts.length ? (
				<ul className={styles.grid} aria-label="Productos favoritos">
					{wishlistProducts.map((product) => {
						const isAdding = addingToCart === product.id
						const isRemoving = togglingWishlist === product.id
						const hasStockData = product.stock !== null && product.stock !== undefined
						const isOutOfStock = hasStockData && Number(product.stock) <= 0

						return (
							<li key={product.id} className={styles.item}>
								<article className={styles.productCard}>
									<div className={styles.media}>
										<Link to={`/products/${product.id}`} className={styles.imageLink}>
											<img
												src={product.imageUrl || FALLBACK_IMAGE}
												alt={product.name}
												className={styles.image}
											/>
										</Link>
										<button
											type="button"
											className={styles.favoriteButton}
											onClick={() => handleToggleWishlist(product.id)}
											disabled={isRemoving || isAdding}
											aria-label={`Quitar ${product.name} de favoritos`}
										>
											<span aria-hidden="true">{isRemoving ? '…' : '♥'}</span>
										</button>
									</div>

									<div className={styles.content}>
										<p className={styles.category}>{product.category}</p>
										<h2 className={styles.name}>
											<Link to={`/products/${product.id}`}>{product.name}</Link>
										</h2>
										{product.description ? (
											<p className={styles.description}>{product.description}</p>
										) : null}
										<div className={styles.productMeta}>
											<p className={styles.price}>{formatPrice(product.price)}</p>
											{hasStockData ? (
												<span className={isOutOfStock ? styles.outOfStock : styles.stock}>
													{isOutOfStock ? 'Sin stock' : `${product.stock} disponibles`}
												</span>
											) : null}
										</div>
									</div>

									<div className={styles.actions}>
										<Button
											type="button"
											variant="primary"
											onClick={() => handleAddToCart(product)}
											disabled={isAdding || isRemoving || isOutOfStock}
											className={styles.cartButton}
										>
											{isAdding ? 'Añadiendo…' : isOutOfStock ? 'No disponible' : 'Añadir al carrito'}
										</Button>
									</div>
								</article>
							</li>
						)
					})}
				</ul>
			) : null}
		</section>
	)
}

export default WishlistPage
