import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useProduct } from '../../hooks/useProduct'
import { useReviews } from '../../hooks/useReviews'
import Button from '../../components/Button/Button'
import ReviewList from '../../components/ReviewList/ReviewList'
import ReviewForm from '../../components/ReviewForm/ReviewForm'
import Spinner from '../../components/Spinner/Spinner'
import WishlistButton from '../../components/WishlistButton/WishlistButton'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import NotFoundPage from '../NotFoundPage/NotFoundPage'
import styles from './ProductDetailPage.module.css'

function ProductDetailPage() {
	const { productId } = useParams()
	const dispatch = useDispatch()
	const [createdReviews, setCreatedReviews] = useState([])
	const [isAddingToCart, setIsAddingToCart] = useState(false)
	const [cartError, setCartError] = useState('')
	const { data: product, loading, error } = useProduct(productId)
	const {
		data: reviews,
		loading: reviewsLoading,
		error: reviewsError,
	} = useReviews(productId)

	const allReviews = useMemo(() => {
		return [...createdReviews, ...reviews]
	}, [createdReviews, reviews])

	const handleReviewCreated = (review) => {
		setCreatedReviews((prev) => [review, ...prev])
	}

	const handleAddToCart = async () => {
		if (!product || isAddingToCart) return

		setCartError('')
		setIsAddingToCart(true)
		try {
			await dispatch(addCartItemThunk({ productId: product.id, quantity: 1 })).unwrap()
		} catch {
			setCartError('No se pudo añadir el producto al carrito. Inténtalo de nuevo.')
		} finally {
			setIsAddingToCart(false)
		}
	}

	if (loading) {
		return <Spinner label="Cargando detalle del producto..." />
	}

	if (error) {
		return <StatusMessage title="No se pudo cargar el producto" description={error} variant="error" />
	}

	if (!product) {
		return <NotFoundPage />
	}

	return (
		<section className={styles.productDetailPage} aria-labelledby="product-title">
			<Link to="/products" className={`app-action-link ${styles.back}`}>
				← Volver al catálogo
			</Link>

			<div className={styles.productLayout}>
				<div className={styles.mediaPanel}>
					<img
						className={styles.image}
						src={product.imageUrl}
						alt={product.name}
					/>
				</div>

				<div className={styles.detailsPanel}>
					<p className={styles.label}>Ficha del producto</p>
					<h1 id="product-title" className={styles.title}>{product.name}</h1>
					<p className={styles.intro}>
						Figura original de colección con acabados detallados y estilo
						inspirado en el universo {product.category}.
					</p>
					<p className={styles.description}>{product.description}</p>

					<dl className={styles.metaList}>
						<div className={styles.metaItem}>
							<dt className={styles.metaLabel}>Categoría</dt>
							<dd className={styles.metaValue}>{product.category}</dd>
						</div>
						<div className={styles.metaItem}>
							<dt className={styles.metaLabel}>Precio oficial</dt>
							<dd className={`${styles.metaValue} ${styles.price}`}>
								{product.price.toFixed(2)} EUR
							</dd>
						</div>
						<div className={styles.metaItem}>
							<dt className={styles.metaLabel}>Disponibilidad</dt>
							<dd className={styles.metaValue}>{product.stock} unidades</dd>
						</div>
					</dl>

					<div className={styles.actions}>
						<Button
							type="button"
							variant="primary"
							onClick={handleAddToCart}
							disabled={isAddingToCart}
							aria-busy={isAddingToCart}
							className={`${styles.addButton} ${isAddingToCart ? styles.isLoading : ''}`}
						>
							{isAddingToCart ? (
								<>
									<span className={styles.buttonDot} aria-hidden="true" /> Añadiendo...
								</>
							) : (
								'Añadir al carrito'
							)}
						</Button>
						<WishlistButton
							productId={product.id}
							className={styles.addButton}
							activeClassName={styles.isActive}
						/>
						<Link to="/cart" className="app-action-link">Ir al carrito</Link>
						{cartError ? <p className={styles.actionError} role="alert">{cartError}</p> : null}
					</div>
				</div>
			</div>

			<section className={styles.reviewsSection} aria-labelledby="reviews-title">
				<div className={styles.reviewsHeader}>
					<p className={styles.label}>Comunidad</p>
					<h2 id="reviews-title" className={styles.reviewsTitle}>Opiniones del producto</h2>
				</div>
				<div className={styles.reviewsLayout}>
					<ReviewForm productId={productId} onReviewCreated={handleReviewCreated} />
					<div className={styles.reviewsResults}>
						{reviewsLoading ? <Spinner label="Cargando reseñas..." /> : null}
						{reviewsError ? <StatusMessage title="No se pudieron cargar las reseñas" description={reviewsError} variant="error" /> : null}
						{!reviewsLoading && !reviewsError ? <ReviewList reviews={allReviews} /> : null}
					</div>
				</div>
			</section>
		</section>
	)
}

export default ProductDetailPage
