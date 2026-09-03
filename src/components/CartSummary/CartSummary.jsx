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

function formatPrice(value) {
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: 'EUR',
	}).format(value)
}

function CartSummary({
	items = [],
	onCheckout,
	loading = false,
	checkoutLabel = 'Ir a checkout',
	loadingLabel = 'Procesando...',
	showCheckoutTotal = false,
	note = 'Revisa el pedido antes de continuar al pago.',
	explorePath = '/products',
}) {
	const totalItems = useMemo(() => {
		return items.reduce((acc, item) => acc + getItemQuantity(item), 0)
	}, [items])

	const totalPrice = useMemo(() => {
		return items.reduce((acc, item) => acc + getItemQuantity(item) * getItemPrice(item), 0)
	}, [items])

	const isEmpty = totalItems === 0
	const formattedTotal = formatPrice(totalPrice)
	const finalCheckoutLabel = showCheckoutTotal
		? `${checkoutLabel} · ${formattedTotal}`
		: checkoutLabel

	return (
		<aside className={styles.box}>
			<h2 className={styles.title}>Resumen del pedido</h2>
			<dl className={styles.breakdown}>
				<div className={styles.line}>
					<dt>Artículos</dt>
					<dd>{totalItems}</dd>
				</div>
				<div className={`${styles.line} ${styles.totalLine}`}>
					<dt>Total</dt>
					<dd>{formattedTotal}</dd>
				</div>
			</dl>
			<p className={styles.note}>{note}</p>
			{onCheckout ? (
				<Button
					type="button"
					variant="primary"
					onClick={onCheckout}
					disabled={loading || isEmpty}
					className={styles.checkoutButton}
				>
					{loading ? loadingLabel : finalCheckoutLabel}
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
