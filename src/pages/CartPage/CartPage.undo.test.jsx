import { configureStore } from '@reduxjs/toolkit'
import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { addCartItemRequest, fetchCartRequest, removeCartItemRequest } from '../../api/cart'
import cartReducer from '../../store/slices/cartSlice'
import CartPage from './CartPage'

vi.mock('../../api/cart', () => ({
	addCartItemRequest: vi.fn(),
	fetchCartRequest: vi.fn(),
	removeCartItemRequest: vi.fn(),
	updateCartItemQuantity: vi.fn(),
}))

const item = {
	id: 44,
	productId: 7,
	product: { id: 7, name: 'Figura', price: 25, stock: 10 },
	quantity: 3,
}

function renderCart(items = [item]) {
	fetchCartRequest.mockResolvedValue({ items })
	const store = configureStore({ reducer: { cart: cartReducer } })
	render(
		<Provider store={store}>
			<MemoryRouter>
				<CartPage />
			</MemoryRouter>
		</Provider>,
	)
	return store
}

describe('Deshacer eliminaciones del carrito', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		removeCartItemRequest.mockResolvedValue({})
		addCartItemRequest.mockResolvedValue({ ...item, id: 55 })
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('restaura el último producto con su cantidad y el identificador nuevo del servidor', async () => {
		const user = userEvent.setup()
		const store = renderCart()
		await user.click(await screen.findByRole('button', { name: 'Eliminar Figura del carrito' }))

		expect(screen.getByRole('heading', { name: 'Tu carrito está vacío' })).toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Deshacer' }))

		expect(addCartItemRequest).toHaveBeenCalledWith({ productId: 7, quantity: 3 })
		expect(store.getState().cart.items).toEqual([{ ...item, id: 55 }])
		expect(screen.getByText('Tienes 3 artículos preparados para revisar.')).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
	})

	it('permite deshacer al quitar la última unidad con el botón de cantidad', async () => {
		const user = userEvent.setup()
		addCartItemRequest.mockResolvedValue({ ...item, id: 55, quantity: 1 })
		renderCart([{ ...item, quantity: 1 }])
		await user.click(await screen.findByRole('button', { name: 'Quitar una unidad de Figura' }))
		expect(removeCartItemRequest).toHaveBeenCalledWith(44)

		await user.click(screen.getByRole('button', { name: 'Deshacer' }))
		expect(addCartItemRequest).toHaveBeenCalledWith({ productId: 7, quantity: 1 })
		expect(screen.getByRole('heading', { name: 'Figura' })).toBeInTheDocument()
	})

	it('no ofrece deshacer cuando falla la eliminación', async () => {
		const user = userEvent.setup()
		removeCartItemRequest.mockRejectedValue(new Error('Error de red'))
		const store = renderCart()
		await user.click(await screen.findByRole('button', { name: 'Eliminar Figura del carrito' }))

		expect(store.getState().cart.items).toEqual([item])
		expect(screen.getByText('No pudimos actualizar el carrito')).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
	})

	it('muestra el error de restauración y permite volver a intentarlo', async () => {
		const user = userEvent.setup()
		addCartItemRequest.mockRejectedValueOnce({ response: { data: { error: 'Stock insuficiente' } } })
		const store = renderCart()
		await user.click(await screen.findByRole('button', { name: 'Eliminar Figura del carrito' }))
		await user.click(screen.getByRole('button', { name: 'Deshacer' }))

		expect(screen.getByText('Stock insuficiente')).toBeInTheDocument()
		expect(store.getState().cart.items).toEqual([])
		await user.click(screen.getByRole('button', { name: 'Deshacer' }))
		expect(store.getState().cart.items).toEqual([{ ...item, id: 55 }])
	})

	it('cierra el aviso a los seis segundos sin restaurar el producto', async () => {
		renderCart()
		const removeButton = await screen.findByRole('button', { name: 'Eliminar Figura del carrito' })
		vi.useFakeTimers()
		await act(async () => fireEvent.click(removeButton))
		expect(screen.getByRole('button', { name: 'Deshacer' })).toBeInTheDocument()

		act(() => vi.advanceTimersByTime(6000))
		expect(screen.queryByRole('button', { name: 'Deshacer' })).not.toBeInTheDocument()
		expect(addCartItemRequest).not.toHaveBeenCalled()
	})
})
