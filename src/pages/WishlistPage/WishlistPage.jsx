import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../components/Button/Button'
import ProductListSkeleton from '../../components/ProductListSkeleton/ProductListSkeleton'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import SafeImage from '../../components/SafeImage/SafeImage'
import UndoToast from '../../components/UndoToast/UndoToast'
import { fetchWishlistRequest, toggleWishlistRequest } from '../../api/wishlist'
import { useProducts } from '../../hooks/useProducts'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import {
	setLocalWishlist,
	toggleLocalWishlist,
} from '../../store/slices/wishlistSlice'
import styles from './WishlistPage.module.css'

const UNDO_WINDOW_MS = 6000

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
	const [togglingWishlist, setTogglingWishlist] = useState(null)
	const [addingToCart, setAddingToCart] = useState(null)
	const [removedFavorite, setRemovedFavorite] = useState(null)
	const [isRestoring, setIsRestoring] = useState(false)
	const undoTimeoutRef = useRef(null)
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

	useEffect(() => () => window.clearTimeout(undoTimeoutRef.current), [])

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

	const openUndoWindow = (product) => {
		window.clearTimeout(undoTimeoutRef.current)
		setRemovedFavorite({ id: product.id, name: product.name })
		undoTimeoutRef.current = window.setTimeout(() => {
			setRemovedFavorite(null)
		}, UNDO_WINDOW_MS)
	}

	const handleToggleWishlist = async (product) => {
		const productId = product.id
		if (togglingWishlist === productId || isRestoring) return
		const previousWishlistIds = [...wishlistIds]

		try {
			setActionError('')
			setTogglingWishlist(productId)
			dispatch(toggleLocalWishlist(productId))

			const syncedWishlist = await toggleWishlistRequest(productId)
			if (syncedWishlist) {
				dispatch(setLocalWishlist(syncedWishlist))
			}
			openUndoWindow(product)
		} catch (toggleError) {
			dispatch(setLocalWishlist(previousWishlistIds))
			setActionError('No pudimos quitar el producto de favoritos. Inténtalo de nuevo.')
			console.error('No se pudo sincronizar la wishlist con el back', toggleError)
		} finally {
			setTogglingWishlist(null)
		}
	}

	const handleUndoRemoval = async () => {
		if (!removedFavorite || isRestoring) return

		window.clearTimeout(undoTimeoutRef.current)
		const previousWishlistIds = [...wishlistIds]
		setActionError('')
		setIsRestoring(true)
		dispatch(toggleLocalWishlist(removedFavorite.id))

		try {
			const syncedWishlist = await toggleWishlistRequest(removedFavorite.id)
			if (syncedWishlist) {
				dispatch(setLocalWishlist(syncedWishlist))
			}
			setRemovedFavorite(null)
		} catch (restoreError) {
			dispatch(setLocalWishlist(previousWishlistIds))
			setRemovedFavorite(null)
			setActionError('No pudimos restaurar el producto en favoritos. Inténtalo de nuevo.')
			console.error('No se pudo restaurar el favorito', restoreError)
		} finally {
			setIsRestoring(false)
		}
	}

	const isLoading = loading || productsLoading
	const hasFetchError = Boolean(error || productsError)

	const handleRetry = async () => {
		setLoading(true)
		setActionError('')
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
			setAddingToCart(product.id)
			await dispatch(addCartItemThunk({ productId: product.id, quantity: 1 })).unwrap()
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

			{isLoading ? <ProductListSkeleton count={4} label="Cargando favoritos..." /> : null}

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

			{actionError ? (
				<StatusMessage title="No pudimos completar la acción" description={actionError} variant="error" />
			) : null}

			{removedFavorite ? (
				<UndoToast label="Favorito eliminado" onUndo={handleUndoRemoval} isUndoing={isRestoring}>
					<strong>{removedFavorite.name}</strong> se ha quitado de favoritos.
				</UndoToast>
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
											<SafeImage
												src={product.imageUrl}
												alt={product.name}
												className={styles.image}
											/>
										</Link>
										<button
											type="button"
											className={styles.favoriteButton}
											onClick={() => handleToggleWishlist(product)}
											disabled={isRemoving || isAdding || isRestoring}
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
