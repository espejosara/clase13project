import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import WishlistButton from '../WishlistButton/WishlistButton'
import Button from '../Button/Button'
import './ProductCard.css'

function ProductCard({ product, onAddToCart }) {
	const dispatch = useDispatch()
	const [isAddingToCart, setIsAddingToCart] = useState(false)

	const handleAddToCart = async () => {
		if (isAddingToCart) return

		setIsAddingToCart(true)
		try {
			if (onAddToCart) {
				await onAddToCart(product.id)
			} else {
				await dispatch(addCartItemThunk({ productId: product.id, quantity: 1 })).unwrap()
			}
		} finally {
			setIsAddingToCart(false)
		}
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
				<Button
					variant="outline"
					className={`product-card__action-button ${isAddingToCart ? 'is-loading' : ''}`}
					onClick={handleAddToCart}
					disabled={isAddingToCart}
					aria-busy={isAddingToCart}
				>
					{isAddingToCart ? (
						<>
							<span className="product-card__button-dot" aria-hidden="true" /> Añadiendo...
						</>
					) : (
						'Añadir al carrito'
					)}
				</Button>
				<WishlistButton productId={product.id} />
			</div>
		</article>
	)
}

export default ProductCard