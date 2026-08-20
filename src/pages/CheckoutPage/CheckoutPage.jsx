import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Spinner from '../../components/Spinner/Spinner'
import { checkoutThunk, fetchCartThunk } from '../../store/slices/cartSlice'

function getItemPrice(item) {
	return Number(item.product?.price ?? item.price ?? 0)
}

function CheckoutPage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { items, loading, isCheckingOut, error } = useSelector((state) => state.cart)

	useEffect(() => {
		if (!items.length) {
			dispatch(fetchCartThunk())
		}
	}, [dispatch, items.length])

	const total = useMemo(() => {
		return items.reduce((sum, item) => {
			const quantity = Number(item.quantity ?? 1)
			return sum + getItemPrice(item) * quantity
		}, 0)
	}, [items])

	const handleRetry = () => {
		dispatch(fetchCartThunk())
	}

	const handleConfirmCheckout = async () => {
		if (!items.length || isCheckingOut) return

		try {
			await dispatch(checkoutThunk()).unwrap()
			navigate('/checkout/success')
		} catch {
			// El mensaje de error ya queda reflejado en el slice.
		}
	}

	return (
		<section>
			<h1>Finalizar compra</h1>
			<p>Revisa los productos antes de confirmar el pedido.</p>

			{loading && !items.length ? <Spinner label="Cargando resumen de compra..." /> : null}
			{error ? <p>Error: {error}</p> : null}

			{error ? (
				<button type="button" onClick={handleRetry}>
					Reintentar
				</button>
			) : null}

			{!loading && !items.length ? (
				<p>
					Tu carrito está vacío. <Link to="/products">Volver al catálogo</Link>
				</p>
			) : null}

			{items.length ? (
				<>
					<ul>
						{items.map((item) => (
							<li key={item.id ?? item.itemId ?? item.productId}>
								<span>
									{item.product?.name || item.name || `Producto ${item.productId ?? item.id}`}
									{' x '}
									{item.quantity ?? 1}
								</span>
							</li>
						))}
					</ul>

					<p>Total a pagar: {total.toFixed(2)} EUR</p>

					<button
						type="button"
						onClick={handleConfirmCheckout}
						disabled={loading || isCheckingOut || !items.length}
					>
						{isCheckingOut ? 'Procesando...' : 'Confirmar compra'}
					</button>{' '}
					<Link to="/cart">Volver al carrito</Link>
				</>
			) : null}
		</section>
	)
}

export default CheckoutPage