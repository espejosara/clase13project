import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import CartSummary from '../../components/CartSummary/CartSummary'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import Button from '../../components/Button/Button'
import { checkoutThunk, fetchCartThunk } from '../../store/slices/cartSlice'
import styles from './CheckoutPage.module.css'

const FALLBACK_IMAGE =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="%23fff7ed"/><text x="50%25" y="54%25" text-anchor="middle" font-size="10" fill="%23c2410c" font-family="Arial">IMG</text></svg>'

function getItemId(item) {
	return item.id ?? item.itemId ?? item.productId
}

function getItemName(item) {
	return item.product?.name || item.name || `Producto ${item.productId ?? item.id}`
}

function getItemImage(item) {
	return item.product?.imageUrl || item.imageUrl || FALLBACK_IMAGE
}

function CheckoutPage() {
	const dispatch = useDispatch()
	const { items, loading, isCheckingOut, error } = useSelector((state) => state.cart)

	useEffect(() => {
		if (!items.length) {
			dispatch(fetchCartThunk())
		}
	}, [dispatch, items.length])

	const handleRetry = () => {
		dispatch(fetchCartThunk())
	}

	const handleConfirmCheckout = async () => {
		if (!items.length || isCheckingOut) return

		try {
			const checkoutSession = await dispatch(checkoutThunk()).unwrap()
			window.location.assign(checkoutSession.url)
		} catch {
			// El mensaje de error ya queda reflejado en el slice.
		}
	}

	if (loading && !items.length) {
		return <Spinner label="Cargando resumen de compra..." />
	}

	if (error && !items.length) {
		return <StatusMessage title="Error" description={error} variant="warning" />
	}

	return (
		<section className={styles.page} aria-labelledby="checkout-title">
			<section className={styles.hero}>
				<p className={styles.eyebrow}>Checkout</p>
				<h1 id="checkout-title" className={styles.title}>Resumen de tu pedido</h1>
				<p className={styles.subtitle}>Verifica tus productos y continúa al pago seguro de Stripe.</p>
			</section>

			{error ? (
				<div className={styles.messageRow}>
					<StatusMessage title="Aviso" description={error} variant="warning" />
					<Button className="app-action-button" onClick={handleRetry}>
						Reintentar
					</Button>
				</div>
			) : null}

			{!items.length ? (
				<StatusMessage
					title="Carrito vacío"
					description="Tu carrito está vacío. Vuelve al catálogo para añadir productos."
				/>
			) : (
				<section className={styles.layout}>
					<ul className={styles.list}>
						{items.map((item) => (
							<li key={getItemId(item)} className={styles.item}>
								<div className={styles.itemTop}>
									<img
										src={getItemImage(item)}
										alt={getItemName(item)}
										className={styles.thumb}
									/>
									<div>
										<p className={styles.name}>{getItemName(item)}</p>
										<p className={styles.meta}>Cantidad: {item.quantity ?? 1}</p>
									</div>
								</div>
							</li>
						))}
					</ul>

					<div className={styles.side}>
						<CartSummary
							items={items}
							onCheckout={handleConfirmCheckout}
							loading={loading || isCheckingOut}
							checkoutLabel="Pagar con Stripe"
						/>
						<Link to="/cart" className={`app-action-link ${styles.backLink}`}>Volver al carrito</Link>
					</div>
				</section>
			)}
		</section>
	)
}

export default CheckoutPage
