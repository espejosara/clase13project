import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	addCartItemThunk,
	fetchCartThunk,
	removeCartItemThunk,
	updateCartItemQuantityThunk,
} from '../../store/slices/cartSlice'
import CartPage from './CartPage'
import ActionToast from '../../components/ActionToast/ActionToast'
import notificationReducer from '../../store/slices/notificationSlice'

vi.mock('../../store/slices/cartSlice', () => ({
	addCartItemThunk: Object.assign(vi.fn(() => () => ({ unwrap: () => Promise.resolve() })), {
		fulfilled: 'cart/addItem/fulfilled',
	}),
	fetchCartThunk: vi.fn(() => ({ type: 'cart/fetch' })),
	removeCartItemThunk: vi.fn(() => () => ({ unwrap: () => Promise.resolve() })),
	updateCartItemQuantityThunk: vi.fn(() => ({ type: 'cart/updateQuantity' })),
}))

function renderCart(cartState) {
	const store = configureStore({
		reducer: {
			cart: () => cartState,
			notification: notificationReducer,
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter>
				<CartPage />
				<ActionToast />
			</MemoryRouter>
		</Provider>,
	)
}

describe('CartPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('muestra enlaces, precio unitario, subtotal y controles claros', async () => {
		const user = userEvent.setup()
		renderCart({
			items: [{
				id: 44,
				productId: 7,
				name: 'Figura del carrito',
				price: 24.99,
				quantity: 2,
				imageUrl: 'https://example.com/figura.jpg',
			}],
			loading: false,
			isCheckingOut: false,
			error: null,
		})

		expect(screen.getByText('Tienes 2 artículos preparados para revisar.')).toBeInTheDocument()
		expect(screen.getByRole('heading', { name: 'Figura del carrito' }).querySelector('a'))
			.toHaveAttribute('href', '/products/7')
		expect(screen.getByText(/24,99.*por unidad/)).toBeInTheDocument()
		expect(screen.getAllByText(/49,98/).length).toBeGreaterThanOrEqual(2)

		await user.click(screen.getByRole('button', { name: 'Quitar una unidad de Figura del carrito' }))
		expect(updateCartItemQuantityThunk).toHaveBeenCalledWith({ itemId: 44, quantity: 1 })

		await user.click(screen.getByRole('button', { name: 'Añadir una unidad de Figura del carrito' }))
		expect(addCartItemThunk).toHaveBeenCalledWith({ productId: 7, quantity: 1 })

		await user.click(screen.getByRole('button', { name: 'Eliminar Figura del carrito del carrito' }))
		expect(removeCartItemThunk).toHaveBeenCalledWith({ itemId: 44 })
		expect(await screen.findByRole('status'))
			.toHaveTextContent('Figura del carrito se ha eliminado del carrito.')

		await user.click(screen.getByRole('button', { name: 'Deshacer' }))
		expect(addCartItemThunk).toHaveBeenLastCalledWith({ productId: 7, quantity: 2 })
		expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
		expect(addCartItemThunk).toHaveBeenCalledTimes(2)
		expect(fetchCartThunk).toHaveBeenCalled()
	})

	it('ofrece volver al catálogo cuando el carrito está vacío', () => {
		renderCart({
			items: [],
			loading: false,
			isCheckingOut: false,
			error: null,
		})

		expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Explorar catálogo' })).toHaveAttribute('href', '/products')
	})

	it('bloquea el aumento al alcanzar todas las unidades disponibles', () => {
		renderCart({
			items: [{
				id: 44,
				productId: 7,
				name: 'Figura limitada',
				price: 24.99,
				quantity: 2,
				stock: 2,
			}],
			loading: false,
			isCheckingOut: false,
			error: null,
		})

		expect(screen.getByRole('button', { name: 'Añadir una unidad de Figura limitada' })).toBeDisabled()
		expect(screen.getByRole('status')).toHaveTextContent('Has añadido todas las unidades disponibles.')
		expect(screen.getByRole('button', { name: 'Revisar pedido' })).toBeEnabled()
	})

	it('impide continuar si un producto del carrito se ha agotado', () => {
		renderCart({
			items: [{
				id: 44,
				product: {
					id: 7,
					name: 'Figura agotada',
					price: 24.99,
					stock: 0,
				},
				quantity: 1,
			}],
			loading: false,
			isCheckingOut: false,
			error: null,
		})

		expect(screen.getByText('Producto agotado. Elimínalo para continuar.')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Revisar pedido' })).toBeDisabled()
		expect(screen.getByText('Corrige los productos sin stock antes de continuar.')).toBeInTheDocument()
	})
})
