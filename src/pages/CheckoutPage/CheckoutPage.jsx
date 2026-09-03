import { useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import CartSummary from '../../components/CartSummary/CartSummary'
import CheckoutSteps from '../../components/CheckoutSteps/CheckoutSteps'
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

function CheckoutPage() {
	const dispatch = useDispatch()
	const [searchParams] = useSearchParams()
	const { items, loading, isCheckingOut, error } = useSelector((state) => state.cart)
	const wasCanceled = searchParams.get('canceled') === 'true'

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
				<p className={styles.eyebrow}>Finaliza tu compra</p>
				<h1 id="checkout-title" className={styles.title}>Revisa y confirma tu pedido</h1>
				<p className={styles.subtitle}>
					Comprueba los artículos y el total. Al continuar, te llevaremos al pago seguro.
				</p>
			</section>
			<CheckoutSteps currentStep="review" />

			{wasCanceled ? (
				<div className={styles.returnMessage}>
					<StatusMessage
						title="Pago cancelado"
						description="No se ha realizado ningún cargo. Tu carrito sigue guardado y puedes intentarlo de nuevo cuando quieras."
						variant="warning"
					/>
				</div>
			) : null}

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
						{items.map((item) => {
							const quantity = getItemQuantity(item)
							const unitPrice = getItemPrice(item)
							const subtotal = quantity * unitPrice

							return (
								<li key={getItemId(item)} className={styles.item}>
									<div className={styles.itemTop}>
										<img
											src={getItemImage(item)}
											alt={getItemName(item)}
											className={styles.thumb}
										/>
										<div className={styles.itemInfo}>
											<p className={styles.name}>{getItemName(item)}</p>
											<div className={styles.itemBreakdown}>
												<span>{quantity} × {formatPrice(unitPrice)}</span>
												<strong>Subtotal: {formatPrice(subtotal)}</strong>
											</div>
										</div>
									</div>
								</li>
							)
						})}
					</ul>

					<div className={styles.side}>
						<CartSummary
							items={items}
							onCheckout={handleConfirmCheckout}
							loading={loading || isCheckingOut}
							checkoutLabel="Ir al pago seguro"
							loadingLabel="Preparando el pago..."
							showCheckoutTotal
							note="El pago se completa en Stripe. Los datos de tu tarjeta no pasan por esta tienda."
						/>
						<Link to="/cart" className={`app-action-link ${styles.backLink}`}>Modificar carrito</Link>
					</div>
				</section>
			)}
		</section>
	)
}

export default CheckoutPage
