import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import WishlistButton from '../WishlistButton/WishlistButton'
import './ProductCard.css'

function ProductCard({ product }) {
	const dispatch = useDispatch()

	const handleAddToCart = () => {
		dispatch(addCartItemThunk({ productId: product.id, quantity: 1 }))
	}

	return (
		<article className="product-card">
			<Link to={`/products/${product.id}`} className="product-card__link">
				<img
					className="product-card__image"
					src={product.imageUrl}
					alt={product.name}
				/>
				<div className="product-card__content">
					<p className="product-card__category">{product.category}</p>
					<h2 className="product-card__title">{product.name}</h2>
					<p className="product-card__description">{product.description}</p>
					<div className="product-card__meta">
						<span className="product-card__price">
							{product.price.toFixed(2)} EUR
						</span>
						<span className="product-card__stock">Stock: {product.stock}</span>
					</div>
				</div>
			</Link>
			<div className="product-card__actions">
				<button
					type="button"
					className="product-card__action-button"
					onClick={handleAddToCart}
				>
					Añadir al carrito
				</button>
				<WishlistButton productId={product.id} />
			</div>
		</article>
	)
}

export default ProductCard