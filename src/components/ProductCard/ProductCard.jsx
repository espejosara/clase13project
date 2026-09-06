import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import useRequireAuthentication from '../../hooks/useRequireAuthentication'
import WishlistButton from '../WishlistButton/WishlistButton'
import Button from '../Button/Button'
import styles from './ProductCard.module.css'

const priceFormatter = new Intl.NumberFormat('es-ES', {
	style: 'currency',
	currency: 'EUR',
})

function ProductCard({ product, onAddToCart }) {
	const dispatch = useDispatch()
	const location = useLocation()
	const requireAuthentication = useRequireAuthentication()
	const [isAddingToCart, setIsAddingToCart] = useState(false)
	const [cartError, setCartError] = useState('')
	const stock = Number(product.stock)
	const hasStockData = product.stock !== null
		&& product.stock !== undefined
		&& Number.isFinite(stock)
	const isOutOfStock = hasStockData && stock <= 0
	const stockLabel = !hasStockData
		? 'Stock por confirmar'
		: isOutOfStock
			? 'Agotado'
			: `${stock} ${stock === 1 ? 'unidad disponible' : 'unidades disponibles'}`

	const handleAddToCart = async () => {
		if (isAddingToCart || isOutOfStock) return
		if (!requireAuthentication('cart')) return

		setCartError('')
		setIsAddingToCart(true)
		try {
			if (onAddToCart) {
				await onAddToCart(product.id)
			} else {
				await dispatch(addCartItemThunk({ productId: product.id, quantity: 1 })).unwrap()
			}
		} catch {
			setCartError('No se pudo añadir el producto al carrito. Inténtalo de nuevo.')
		} finally {
			setIsAddingToCart(false)
		}
	}

	return (
		<article className={styles.productCard}>
			<Link
				to={`/products/${product.id}`}
				state={{ catalogSearch: location.pathname === '/products' ? location.search : '' }}
				className={styles.link}
			>
				<img
					className={styles.image}
					src={product.imageUrl}
					alt={product.name}
					loading="lazy"
					decoding="async"
				/>
				<div className={styles.content}>
					<p className={styles.category}>{product.category}</p>
					<h2 className={styles.title}>{product.name}</h2>
					<p className={styles.description}>{product.description}</p>
					<div className={styles.meta}>
						<span className={styles.price}>
							{priceFormatter.format(product.price)}
						</span>
						<span className={`${styles.stock} ${isOutOfStock ? styles.outOfStock : ''}`}>
							{stockLabel}
						</span>
					</div>
				</div>
			</Link>
			<div className={styles.actions}>
				<Button
					variant="primary"
					className={`${styles.actionButton} ${isAddingToCart ? styles.isLoading : ''}`}
					onClick={handleAddToCart}
					disabled={isAddingToCart || isOutOfStock}
					aria-busy={isAddingToCart}
				>
					{isOutOfStock ? (
						'No disponible'
					) : isAddingToCart ? (
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
				{cartError ? <p className={styles.actionError} role="alert">{cartError}</p> : null}
			</div>
		</article>
	)
}

export default ProductCard
