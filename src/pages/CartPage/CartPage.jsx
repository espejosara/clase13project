import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Button from '../../components/Button/Button'
import Spinner from '../../components/Spinner/Spinner'
import CartSummary from '../../components/CartSummary/CartSummary'
import CheckoutSteps from '../../components/CheckoutSteps/CheckoutSteps'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import {
	addCartItemThunk,
	fetchCartThunk,
	removeCartItemThunk,
	updateCartItemQuantityThunk,
} from '../../store/slices/cartSlice'
import styles from './CartPage.module.css'

const FALLBACK_IMAGE =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="56" height="56"><rect width="56" height="56" fill="%23fff7ed"/><text x="50%25" y="54%25" text-anchor="middle" font-size="10" fill="%23c2410c" font-family="Arial">IMG</text></svg>'

function getItemId(item) {
	return item.id ?? item.itemId ?? item.productId
}

function getBackendItemId(item) {
	return item.itemId ?? item.id ?? item.productId
}

function getProductId(item) {
	return item.productId ?? item.product?.id ?? item.id
}

function getItemName(item) {
	return item.product?.name || item.name || `Producto ${item.productId ?? item.id}`
}

function getItemPrice(item) {
	return Number(item.product?.price ?? item.price ?? 0)
}

function getItemImage(item) {
	return item.product?.imageUrl || item.imageUrl || FALLBACK_IMAGE
}

function CartPage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { items, loading, isCheckingOut, error } = useSelector((state) => state.cart)

	useEffect(() => {
		dispatch(fetchCartThunk())
	}, [dispatch])

	const handleRemoveLine = (item) => {
		const itemId = getBackendItemId(item)
		if (itemId != null) {
			dispatch(removeCartItemThunk({ itemId }))
		}
	}

	const handleIncrease = (item) => {
		const productId = getProductId(item)
		if (productId != null) {
			dispatch(addCartItemThunk({ productId, quantity: 1 }))
		}
	}

	const handleDecrease = (item) => {
		const itemId = getBackendItemId(item)
		if (itemId == null) return

		const quantity = Number(item.quantity ?? 1)

		if (Number.isInteger(quantity) && quantity > 1) {
			dispatch(updateCartItemQuantityThunk({ itemId, quantity: quantity - 1 }))
			return
		}

		dispatch(removeCartItemThunk({ itemId }))
	}

	const handleGoToCheckout = () => {
		navigate('/checkout')
	}

	const handleRetry = () => {
		dispatch(fetchCartThunk())
	}

	if (loading && !items.length) {
		return <Spinner label="Cargando carrito..." />
	}

	if (error && !items.length) {
		return (
			<StatusMessage
				title="Error"
				description={error}
				variant="warning"
			/>
		)
	}

	return (
		<section className={styles.page} aria-labelledby="cart-title">
			<section className={styles.hero}>
				<h1 id="cart-title" className={styles.title}>Tu carrito de compra</h1>
			</section>
			<CheckoutSteps currentStep="cart" />

			{error ? (
				<div className={styles.messageRow}>
					<StatusMessage
						title="Aviso"
						description={error}
						variant="warning"
					/>
					<Button
						type="button"
						variant="primary"
						onClick={handleRetry}
						disabled={loading || isCheckingOut}
					>
						Reintentar
					</Button>
				</div>
			) : null}

			<section className={styles.layout}>
				{!items.length ? (
					<StatusMessage
						title="Carrito vacío"
						description="Añade productos antes de comprar."
					/>
				) : (
					<ul className={styles.list} aria-label="Productos en el carrito">
						{items.map((item, index) => (
							<li key={`${getItemId(item)}-${index}`} className={styles.item}>
								<div className={styles.itemMain}>
									<img
										src={getItemImage(item)}
										alt={getItemName(item)}
										className={styles.thumb}
									/>
									<div className={styles.itemInfo}>
										<p className={styles.name}>{getItemName(item)}</p>
										<p className={styles.price}>{getItemPrice(item).toFixed(2)} EUR</p>
									</div>
								</div>
								<div className={styles.itemActions}>
									<div className={styles.quantityControls} role="group" aria-label={`Cantidad de ${getItemName(item)}`}>
										<button
											type="button"
											className={styles.quantityButton}
											onClick={() => handleDecrease(item)}
											disabled={loading || isCheckingOut}
											aria-label={`Quitar una unidad de ${getItemName(item)}`}
										>
											-
										</button>
										<span className={styles.quantityValue} aria-hidden="true">{item.quantity ?? 1}</span>
										<span className="visually-hidden" aria-live="polite" aria-atomic="true">
											Cantidad de {getItemName(item)}: {item.quantity ?? 1}
										</span>
										<button
											type="button"
											className={styles.quantityButton}
											onClick={() => handleIncrease(item)}
											disabled={loading || isCheckingOut}
											aria-label={`Añadir una unidad de ${getItemName(item)}`}
										>
											+
										</button>
									</div>
									<button
										type="button"
										className={styles.removeButton}
										onClick={() => handleRemoveLine(item)}
										disabled={loading || isCheckingOut}
										aria-label={`Eliminar ${getItemName(item)} del carrito`}
									>
										🗑️
									</button>
								</div>
							</li>
						))}
					</ul>
				)}

				<div className={styles.summaryColumn}>
					<CartSummary
						items={items}
						onCheckout={handleGoToCheckout}
						loading={loading || isCheckingOut}
						checkoutLabel="Revisar pedido"
					/>
				</div>
			</section>
		</section>
	)
}

export default CartPage
