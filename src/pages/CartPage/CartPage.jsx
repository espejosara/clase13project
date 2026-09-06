import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="%23eff6ff"/><text x="50%25" y="52%25" text-anchor="middle" font-size="14" fill="%2364748b" font-family="Arial">Sin imagen</text></svg>'
const UNDO_WINDOW_MS = 6000

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

function getItemQuantity(item) {
	const quantity = Number(item?.quantity ?? 1)
	return Number.isInteger(quantity) && quantity > 0 ? quantity : 1
}

function formatPrice(value) {
	return new Intl.NumberFormat('es-ES', {
		style: 'currency',
		currency: 'EUR',
	}).format(Number(value ?? 0))
}

function getCartDescription(totalItems) {
	if (totalItems === 1) return 'Tienes 1 artículo preparado para revisar.'
	if (totalItems > 1) return `Tienes ${totalItems} artículos preparados para revisar.`
	return 'Tu selección aparecerá aquí antes de continuar con la compra.'
}

function CartIcon({ className = '' }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.8"
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M3 3h2l2.2 10.1a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 1.9-1.4L21 7H6" />
			<path d="M9.5 19.5h.01M17.5 19.5h.01" />
		</svg>
	)
}

function CartPage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { items, loading, isCheckingOut, error } = useSelector((state) => state.cart)
	const [removedItem, setRemovedItem] = useState(null)
	const [isRestoring, setIsRestoring] = useState(false)
	const undoTimeoutRef = useRef(null)

	useEffect(() => {
		dispatch(fetchCartThunk())
	}, [dispatch])

	useEffect(() => () => window.clearTimeout(undoTimeoutRef.current), [])

	const totalItems = useMemo(() => {
		return items.reduce((total, item) => total + getItemQuantity(item), 0)
	}, [items])

	const openUndoWindow = (item) => {
		window.clearTimeout(undoTimeoutRef.current)
		setRemovedItem({
			name: getItemName(item),
			productId: getProductId(item),
			quantity: getItemQuantity(item),
		})
		undoTimeoutRef.current = window.setTimeout(() => {
			setRemovedItem(null)
		}, UNDO_WINDOW_MS)
	}

	const handleRemoveLine = async (item) => {
		const itemId = getBackendItemId(item)
		if (itemId == null) return

		try {
			await dispatch(removeCartItemThunk({ itemId })).unwrap()
			openUndoWindow(item)
		} catch {
			// El error del backend ya queda reflejado en cart.error.
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

		const quantity = getItemQuantity(item)

		if (quantity > 1) {
			dispatch(updateCartItemQuantityThunk({ itemId, quantity: quantity - 1 }))
			return
		}

		handleRemoveLine(item)
	}

	const handleUndoRemoval = async () => {
		if (!removedItem || isRestoring) return

		window.clearTimeout(undoTimeoutRef.current)
		setIsRestoring(true)

		try {
			await dispatch(addCartItemThunk({
				productId: removedItem.productId,
				quantity: removedItem.quantity,
			})).unwrap()
			setRemovedItem(null)
		} catch {
			undoTimeoutRef.current = window.setTimeout(() => {
				setRemovedItem(null)
			}, UNDO_WINDOW_MS)
		} finally {
			setIsRestoring(false)
		}
	}

	const handleGoToCheckout = () => {
		navigate('/checkout')
	}

	const handleRetry = () => {
		dispatch(fetchCartThunk())
	}

	return (
		<section className={styles.page} aria-labelledby="cart-title">
			<header className={styles.hero}>
				<div className={styles.heroCopy}>
					<p className={styles.eyebrow}>Tu compra</p>
					<h1 id="cart-title" className={styles.title}>Mi carrito</h1>
					<p className={styles.subtitle}>{getCartDescription(totalItems)}</p>
				</div>
				<div className={styles.heroBadge} aria-label={`${totalItems} ${totalItems === 1 ? 'artículo' : 'artículos'}`}>
					<CartIcon className={styles.bagIcon} />
					<strong>{totalItems}</strong>
					<span>{totalItems === 1 ? 'artículo' : 'artículos'}</span>
				</div>
			</header>

			<CheckoutSteps currentStep="cart" />

			{error ? (
				<div className={styles.messageRow}>
					<StatusMessage
						title="No pudimos actualizar el carrito"
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

			{removedItem ? (
				<aside className={styles.undoBar} role="status" aria-label="Producto eliminado">
					<span className={styles.undoIcon} aria-hidden="true">✓</span>
					<p><strong>{removedItem.name}</strong> se ha eliminado del carrito.</p>
					<button
						type="button"
						className={styles.undoButton}
						onClick={handleUndoRemoval}
						disabled={isRestoring}
					>
						{isRestoring ? 'Restaurando…' : 'Deshacer'}
					</button>
				</aside>
			) : null}

			{loading && !items.length ? <Spinner label="Cargando carrito..." /> : null}

			{!loading && !error && !items.length ? (
				<section className={styles.emptyState} aria-labelledby="empty-cart-title">
					<span className={styles.emptyIcon} aria-hidden="true">
						<CartIcon />
					</span>
					<h2 id="empty-cart-title">Tu carrito está vacío</h2>
					<p>Explora el catálogo y añade los productos que quieras comprar.</p>
					<Link to="/products" className={styles.catalogButton}>Explorar catálogo</Link>
				</section>
			) : null}

			{items.length ? (
				<section className={styles.layout} aria-label="Contenido del carrito">
					<div className={styles.listColumn}>
						<div className={styles.listHeader}>
							<h2>Productos</h2>
							<Link to="/products" className={styles.continueLink}>Seguir comprando</Link>
						</div>

						<ul className={styles.list} aria-label="Productos en el carrito">
							{items.map((item, index) => {
								const itemId = getItemId(item)
								const productId = getProductId(item)
								const itemName = getItemName(item)
								const quantity = getItemQuantity(item)
								const unitPrice = getItemPrice(item)
								const subtotal = quantity * unitPrice
								const controlsDisabled = loading || isCheckingOut

								return (
									<li key={`${itemId}-${index}`} className={styles.item}>
										<Link to={`/products/${productId}`} className={styles.imageLink}>
											<img src={getItemImage(item)} alt={itemName} className={styles.thumb} />
										</Link>

										<div className={styles.itemInfo}>
											<h3 className={styles.name}>
												<Link to={`/products/${productId}`}>{itemName}</Link>
											</h3>
											<p className={styles.unitPrice}>{formatPrice(unitPrice)} por unidad</p>
											<div className={styles.subtotalRow}>
												<span>Subtotal</span>
												<strong>{formatPrice(subtotal)}</strong>
											</div>
										</div>

										<div className={styles.itemActions}>
											<span className={styles.quantityLabel}>Cantidad</span>
											<div className={styles.quantityControls} role="group" aria-label={`Cantidad de ${itemName}`}>
												<button
													type="button"
													className={styles.quantityButton}
													onClick={() => handleDecrease(item)}
													disabled={controlsDisabled}
													aria-label={`Quitar una unidad de ${itemName}`}
												>
													−
												</button>
												<span className={styles.quantityValue} aria-hidden="true">{quantity}</span>
												<span className="visually-hidden" aria-live="polite" aria-atomic="true">
													Cantidad de {itemName}: {quantity}
												</span>
												<button
													type="button"
													className={styles.quantityButton}
													onClick={() => handleIncrease(item)}
													disabled={controlsDisabled}
													aria-label={`Añadir una unidad de ${itemName}`}
												>
													+
												</button>
											</div>
											<button
												type="button"
												className={styles.removeButton}
												onClick={() => handleRemoveLine(item)}
												disabled={controlsDisabled}
												aria-label={`Eliminar ${itemName} del carrito`}
											>
												<span aria-hidden="true">×</span> Eliminar
											</button>
										</div>
									</li>
								)
							})}
						</ul>
					</div>

					<div className={styles.summaryColumn}>
						<CartSummary
							items={items}
							onCheckout={handleGoToCheckout}
							loading={loading || isCheckingOut}
							checkoutLabel="Revisar pedido"
							note="Comprueba los artículos y el total antes de continuar."
						/>
					</div>
				</section>
			) : null}
		</section>
	)
}

export default CartPage
