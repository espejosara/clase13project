import { useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useProduct } from '../../hooks/useProduct'
import { useReviews } from '../../hooks/useReviews'
import ReviewList from '../../components/ReviewList/ReviewList'
import ReviewForm from '../../components/ReviewForm/ReviewForm'
import Spinner from '../../components/Spinner/Spinner'
import WishlistButton from '../../components/WishlistButton/WishlistButton'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import NotFoundPage from '../NotFoundPage/NotFoundPage'
import './ProductDetailPage.css'

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
		<main className="product-detail-page">
			<Link to="/products" className="product-detail-page__back">
				← Volver al catálogo
			</Link>
			<p className="product-detail-page__label">Ficha del producto</p>
			<h1 className="product-detail-page__title">{product.name}</h1>
			<p className="product-detail-page__intro">
				Figura original de coleccion con acabados detallados y estilo
				inspirado en el universo {product.category}.
			</p>
			<img
				className="product-detail-page__image"
				src={product.imageUrl}
				alt={product.name}
			/>
			<p className="product-detail-page__description">{product.description}</p>
			<p className="product-detail-page__meta">Categoría: {product.category}</p>
			<p className="product-detail-page__meta">
				Precio oficial: {product.price.toFixed(2)} EUR
			</p>
			<p className="product-detail-page__meta">
				Disponibilidad: {product.stock} unidades en stock
			</p>
			<p>
				<button
					type="button"
					onClick={handleAddToCart}
					disabled={isAddingToCart}
					aria-busy={isAddingToCart}
					className={`product-detail-page__add-button ${isAddingToCart ? 'is-loading' : ''}`}
				>
					{isAddingToCart ? (
						<>
							<span className="product-detail-page__button-dot" aria-hidden="true" /> Añadiendo...
						</>
					) : (
						'Añadir al carrito'
					)}
				</button>{' '}
				<WishlistButton productId={product.id} />{' '}
				<Link to="/cart">Ir al carrito</Link>
			</p>

			<section>
				<h2>Reviews</h2>
				<ReviewForm productId={productId} onReviewCreated={handleReviewCreated} />
				{reviewsLoading ? <Spinner label="Cargando reseñas..." /> : null}
				{reviewsError ? <p>Error al cargar reviews: {reviewsError}</p> : null}
				{!reviewsLoading && !reviewsError ? <ReviewList reviews={allReviews} /> : null}
			</section>
		</main>
	)
}

export default ProductDetailPage