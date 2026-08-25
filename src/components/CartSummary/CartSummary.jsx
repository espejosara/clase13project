import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Button from '../Button/Button'
import styles from './CartSummary.module.css'

function getItemQuantity(item) {
	const quantity = Number(item?.quantity ?? 1)
	return Number.isFinite(quantity) && quantity > 0 ? quantity : 1
}

function getItemPrice(item) {
	return Number(item?.product?.price ?? item?.price ?? 0)
}

function CartSummary({
	items = [],
	onCheckout,
	loading = false,
	checkoutLabel = 'Ir a checkout',
	explorePath = '/products',
}) {
	const totalItems = useMemo(() => {
		return items.reduce((acc, item) => acc + getItemQuantity(item), 0)
	}, [items])

	const totalPrice = useMemo(() => {
		return items.reduce((acc, item) => acc + getItemQuantity(item) * getItemPrice(item), 0)
	}, [items])

	const isEmpty = totalItems === 0

	return (
		<aside className={styles.box}>
			<p className={styles.label}>Resumen</p>
			<p className={styles.line}>Items: {totalItems}</p>
			<p className={styles.line}>Total: {totalPrice.toFixed(2)} EUR</p>
			<p className={styles.note}>Impuestos incluidos. Envío calculado en checkout.</p>
			{onCheckout ? (
				<Button
					type="button"
					variant="primary"
					onClick={onCheckout}
					disabled={loading || isEmpty}
					className={styles.checkoutButton}
				>
					{loading ? 'Procesando...' : checkoutLabel}
				</Button>
			) : null}
			{isEmpty ? (
				<Link to={explorePath} className={styles.exploreButton}>
					Explorar catálogo
				</Link>
			) : null}
		</aside>
	)
}

export default CartSummary
