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
import { addCartItemThunk } from '../../store/slices/cartSlice'
import NotFoundPage from '../NotFoundPage/NotFoundPage'
import styles from './ProductDetailPage.module.css'

function ProductDetailPage() {
	const { productId } = useParams()
	const dispatch = useDispatch()
	const [createdReviews, setCreatedReviews] = useState([])
	const [isAddingToCart, setIsAddingToCart] = useState(false)
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

		setIsAddingToCart(true)
		try {
			await dispatch(addCartItemThunk({ productId: product.id, quantity: 1 })).unwrap()
		} finally {
			setIsAddingToCart(false)
		}
	}

	if (loading) {
		return <Spinner label="Cargando detalle del producto..." />
	}

	if (error) {
		return <p>Error al cargar el producto: {error}</p>
	}

	if (!product) {
		return <NotFoundPage />
	}

	return (
		<section className={styles.productDetailPage} aria-labelledby="product-title">
			<Link to="/products" className={`app-action-link ${styles.back}`}>
				← Volver al catálogo
			</Link>
			<p className={styles.label}>Ficha del producto</p>
			<h1 id="product-title" className={styles.title}>{product.name}</h1>
			<p className={styles.intro}>
				Figura original de coleccion con acabados detallados y estilo
				inspirado en el universo {product.category}.
			</p>
			<img
				className={styles.image}
				src={product.imageUrl}
				alt={product.name}
			/>
			<p className={styles.description}>{product.description}</p>
			<p className={styles.meta}>Categoría: {product.category}</p>
			<p className={styles.meta}>
				Precio oficial: {product.price.toFixed(2)} EUR
			</p>
			<p className={styles.meta}>
				Disponibilidad: {product.stock} unidades en stock
			</p>
			<p className={styles.actions}>
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
				</Button>{' '}
				<WishlistButton
					productId={product.id}
					className={styles.addButton}
					activeClassName={styles.isActive}
				/>{' '}
				<Link to="/cart" className="app-action-link">Ir al carrito</Link>
			</p>

			<section>
				<h2>Reviews</h2>
				<ReviewForm productId={productId} onReviewCreated={handleReviewCreated} />
				{reviewsLoading ? <Spinner label="Cargando reseñas..." /> : null}
				{reviewsError ? <p>Error al cargar reviews: {reviewsError}</p> : null}
				{!reviewsLoading && !reviewsError ? <ReviewList reviews={allReviews} /> : null}
			</section>
		</section>
	)
}

export default ProductDetailPage
