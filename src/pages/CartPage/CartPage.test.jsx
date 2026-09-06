import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import {
	addCartItemThunk,
	fetchCartThunk,
	removeCartItemThunk,
	updateCartItemQuantityThunk,
} from '../../store/slices/cartSlice'
import CartPage from './CartPage'

vi.mock('../../store/slices/cartSlice', () => ({
	addCartItemThunk: vi.fn(() => () => ({ unwrap: () => Promise.resolve() })),
	fetchCartThunk: vi.fn(() => ({ type: 'cart/fetch' })),
	removeCartItemThunk: vi.fn(() => () => ({ unwrap: () => Promise.resolve() })),
	updateCartItemQuantityThunk: vi.fn(() => ({ type: 'cart/updateQuantity' })),
}))

function renderCart(cartState) {
	const store = configureStore({
		reducer: {
			cart: () => cartState,
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter>
				<CartPage />
			</MemoryRouter>
		</Provider>,
	)
}

describe('CartPage', () => {
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
		expect(await screen.findByRole('status', { name: 'Producto eliminado' }))
			.toHaveTextContent('Figura del carrito se ha eliminado del carrito.')

		await user.click(screen.getByRole('button', { name: 'Deshacer' }))
		expect(addCartItemThunk).toHaveBeenLastCalledWith({ productId: 7, quantity: 2 })
		await waitFor(() => {
			expect(screen.queryByRole('status', { name: 'Producto eliminado' })).not.toBeInTheDocument()
		})
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
})
