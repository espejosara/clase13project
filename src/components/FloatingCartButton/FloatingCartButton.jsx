import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { Link, useLocation } from 'react-router-dom'
import styles from './FloatingCartButton.module.css'

function FloatingCartButton() {
	const location = useLocation()
	const authenticatedUser = useSelector((state) => state.auth.user)
	const cartItems = useSelector((state) => state.cart.items)
	const cartCount = useMemo(() => (
		cartItems.reduce((total, item) => {
			const quantity = Number(item?.quantity ?? 1)
			return total + (Number.isFinite(quantity) && quantity > 0 ? quantity : 1)
		}, 0)
	), [cartItems])

	if (!authenticatedUser || location.pathname === '/cart') return null

	return (
		<Link
			to="/cart"
			className={styles.floatingCart}
			aria-label={`Abrir carrito, ${cartCount} ${cartCount === 1 ? 'unidad' : 'unidades'}`}
		>
			<svg className={styles.icon} viewBox="0 0 24 24" aria-hidden="true">
				<path d="M3 3h1.5l1.8 10.1a2 2 0 0 0 2 1.65h8.85a2 2 0 0 0 1.95-1.55L20.5 7H5.2" />
				<circle cx="9" cy="19" r="1.25" />
				<circle cx="17" cy="19" r="1.25" />
			</svg>
			<span className={styles.badge} aria-hidden="true">{cartCount}</span>
		</Link>
	)
}

export default FloatingCartButton
