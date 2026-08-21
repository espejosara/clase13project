import { useMemo } from 'react'
import styles from './CartSummary.module.css'

function getItemQuantity(item) {
	const quantity = Number(item?.quantity ?? 1)
	return Number.isFinite(quantity) && quantity > 0 ? quantity : 1
}

function getItemPrice(item) {
	return Number(item?.product?.price ?? item?.price ?? 0)
}

function CartSummary({ items = [], onCheckout, loading = false, checkoutLabel = 'Ir a checkout' }) {
	const totalItems = useMemo(() => {
		return items.reduce((acc, item) => acc + getItemQuantity(item), 0)
	}, [items])

	const totalPrice = useMemo(() => {
		return items.reduce((acc, item) => acc + getItemQuantity(item) * getItemPrice(item), 0)
	}, [items])

	return (
		<aside className={styles.box}>
			<p className={styles.label}>Resumen</p>
			<p className={styles.line}>Items: {totalItems}</p>
			<p className={styles.line}>Total: {totalPrice.toFixed(2)} EUR</p>
			<p className={styles.note}>Impuestos incluidos. Envio calculado en checkout.</p>
			{onCheckout ? (
				<button
					type="button"
					onClick={onCheckout}
					disabled={loading || !items.length}
					className={styles.checkoutButton}
				>
					{loading ? 'Procesando...' : checkoutLabel}
				</button>
			) : null}
		</aside>
	)
}

export default CartSummary
