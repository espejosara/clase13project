import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import CartSummary from '../../components/CartSummary/CartSummary'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import {
	addCartItemThunk,
	fetchCartThunk,
	removeCartItemThunk,
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
			dispatch(
				removeCartItemThunk({
					itemId,
					productId: getProductId(item),
					removeAll: true,
				}),
			)
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
		if (itemId != null) {
			dispatch(
				removeCartItemThunk({
					itemId,
					productId: getProductId(item),
				}),
			)
		}
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
		<main className={styles.page}>
			<section className={styles.hero}>
				<p className={styles.eyebrow}>Carrito</p>
				<h1 className={styles.title}>Tu carrito de compra</h1>
			</section>

			{error ? (
				<div className={styles.messageRow}>
					<StatusMessage
						title="Aviso"
						description={error}
						variant="warning"
					/>
					<button
						type="button"
						className="app-action-button"
						onClick={handleRetry}
						disabled={loading || isCheckingOut}
					>
						Reintentar
					</button>
				</div>
			) : null}

			{!items.length ? (
				<StatusMessage
					title="Carrito vacio"
					description="Anade productos antes de comprar."
				/>
			) : (
				<section className={styles.layout}>
					<div className={styles.list}>
						{items.map((item, index) => (
							<article key={`${getItemId(item)}-${index}`} className={styles.item}>
								<div className={styles.itemTop}>
									<img
										src={getItemImage(item)}
										alt={getItemName(item)}
										className={styles.thumb}
									/>
									<p className={styles.name}>{getItemName(item)}</p>
								</div>
								<div className={styles.quantityRow}>
									<p className={styles.quantity}>Cantidad:</p>
									<div className={styles.quantityControls}>
										<button
											type="button"
											className="app-action-button"
											onClick={() => handleDecrease(item)}
											disabled={loading || isCheckingOut}
											aria-label={`Quitar una unidad de ${getItemName(item)}`}
										>
											-
										</button>
										<span className={styles.quantityValue}>{item.quantity ?? 1}</span>
										<button
											type="button"
											className="app-action-button"
											onClick={() => handleIncrease(item)}
											disabled={loading || isCheckingOut}
											aria-label={`Anadir una unidad de ${getItemName(item)}`}
										>
											+
										</button>
									</div>
								</div>
								<p className={styles.price}>Precio: {getItemPrice(item).toFixed(2)} EUR</p>
								<button
									type="button"
									className="app-action-button app-action-button--danger"
									onClick={() => handleRemoveLine(item)}
									disabled={loading || isCheckingOut}
								>
									Eliminar producto
								</button>
							</article>
						))}
					</div>

					<CartSummary
						items={items}
						onCheckout={handleGoToCheckout}
						loading={loading || isCheckingOut}
						checkoutLabel="Ir a checkout"
					/>
				</section>
			)}
		</main>
	)
}

export default CartPage