import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import WishlistButton from '../WishlistButton/WishlistButton'
import Button from '../Button/Button'
import styles from './ProductCard.module.css'

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
		<article className={styles.productCard}>
			<Link to={`/products/${product.id}`} className={styles.link}>
				<img
					className={styles.image}
					src={product.imageUrl}
					alt={product.name}
				/>
				<div className={styles.content}>
					<p className={styles.category}>{product.category}</p>
					<h2 className={styles.title}>{product.name}</h2>
					<p className={styles.description}>{product.description}</p>
					<div className={styles.meta}>
						<span className={styles.price}>
							{product.price.toFixed(2)} EUR
						</span>
						<span className={styles.stock}>Stock: {product.stock}</span>
					</div>
				</div>
			</Link>
			<div className={styles.actions}>
				<Button
					variant="outline"
					className={`${styles.actionButton} ${isAddingToCart ? styles.isLoading : ''}`}
					onClick={handleAddToCart}
					disabled={isAddingToCart}
					aria-busy={isAddingToCart}
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
					className={styles.actionButton}
					activeClassName={styles.isActive}
				/>
			</div>
		</article>
	)
}

export default ProductCard