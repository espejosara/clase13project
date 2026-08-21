import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import CartSummary from '../../components/CartSummary/CartSummary'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import {
	fetchCartThunk,
	removeCartItemThunk,
} from '../../store/slices/cartSlice'
import styles from './CartPage.module.css'

function getItemId(item) {
	return item.id ?? item.itemId ?? item.productId
}

function getItemName(item) {
	return item.product?.name || item.name || `Producto ${item.productId ?? item.id}`
}

function getItemPrice(item) {
	return Number(item.product?.price ?? item.price ?? 0)
}

function CartPage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { items, loading, isCheckingOut, error } = useSelector((state) => state.cart)

	useEffect(() => {
		dispatch(fetchCartThunk())
	}, [dispatch])

	const handleRemove = (item) => {
		const itemId = getItemId(item)
		if (itemId != null) {
			dispatch(removeCartItemThunk(itemId))
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
				<h1 className={styles.title}>Cierre del flujo de compra</h1>
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
						{items.map((item) => (
							<article key={getItemId(item)} className={styles.item}>
								<p className={styles.name}>{getItemName(item)}</p>
								<p className={styles.quantity}>Cantidad: {item.quantity ?? 1}</p>
								<p className={styles.price}>Precio: {getItemPrice(item).toFixed(2)} EUR</p>
								<button
									type="button"
									onClick={() => handleRemove(item)}
									disabled={loading || isCheckingOut}
								>
									Eliminar
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