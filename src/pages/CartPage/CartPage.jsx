import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
	checkoutThunk,
	fetchCartThunk,
	removeCartItemThunk,
} from '../../store/slices/cartSlice'

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
	const { items, loading, error } = useSelector((state) => state.cart)

	useEffect(() => {
		dispatch(fetchCartThunk())
	}, [dispatch])

	const total = useMemo(() => {
		return items.reduce((sum, item) => {
			const quantity = Number(item.quantity ?? 1)
			return sum + getItemPrice(item) * quantity
		}, 0)
	}, [items])

	const handleRemove = (item) => {
		const itemId = getItemId(item)
		if (itemId != null) {
			dispatch(removeCartItemThunk(itemId))
		}
	}

	const handleCheckout = async () => {
		try {
			await dispatch(checkoutThunk()).unwrap()
			navigate('/checkout/success')
		} catch {
			// El mensaje de error ya queda reflejado en el slice.
		}
	}

	return (
		<section>
			<h1>Carrito</h1>
			{loading ? <p>Cargando carrito...</p> : null}
			{error ? <p>Error: {error}</p> : null}

			{!loading && !items.length ? <p>Tu carrito está vacío.</p> : null}

			{items.length ? (
				<>
					<ul>
						{items.map((item) => (
							<li key={getItemId(item)}>
								<span>
									{getItemName(item)} x {item.quantity ?? 1} - {getItemPrice(item).toFixed(2)} EUR
								</span>{' '}
								<button type="button" onClick={() => handleRemove(item)} disabled={loading}>
									Eliminar
								</button>
							</li>
						))}
					</ul>

					<p>Total: {total.toFixed(2)} EUR</p>
					<button type="button" onClick={handleCheckout} disabled={loading || !items.length}>
						Finalizar compra
					</button>
				</>
			) : null}
		</section>
	)
}

export default CartPage