import { configureStore } from '@reduxjs/toolkit'
import { act, render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCheckoutOrderRequest } from '../../api/payments'
import { fetchCartRequest } from '../../api/cart'
import { fetchOrdersRequest } from '../../api/orders'
import cartReducer from '../../store/slices/cartSlice'
import ordersReducer from '../../store/slices/ordersSlice'
import CheckoutSuccessPage from './CheckoutSuccessPage'

vi.mock('../../api/payments', () => ({
	getCheckoutOrderRequest: vi.fn(),
	createCheckoutSessionRequest: vi.fn(),
}))

vi.mock('../../api/cart')
vi.mock('../../api/orders')

function renderSuccessPage(route, preloadedState) {
	const store = configureStore({
		reducer: { cart: cartReducer, orders: ordersReducer },
		preloadedState,
	})
	const view = render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[route]}>
				<CheckoutSuccessPage />
			</MemoryRouter>
		</Provider>,
	)
	return { ...view, store }
}

describe('CheckoutSuccessPage', () => {
	beforeEach(() => {
		vi.resetAllMocks()
		vi.useRealTimers()
		fetchCartRequest.mockResolvedValue([])
		fetchOrdersRequest.mockResolvedValue([])
	})

	it('muestra el pago como confirmado únicamente cuando el backend devuelve el pedido', async () => {
		getCheckoutOrderRequest.mockResolvedValue({
			confirmed: true,
			order: { id: 41, total: 39.98 },
		})
		renderSuccessPage('/checkout/success?session_id=cs_test_123')

		expect(
			await screen.findByRole('heading', { name: '¡Pago completado!' }),
		).toBeInTheDocument()
		expect(screen.getByText(/pedido #41/i)).toBeInTheDocument()
		expect(screen.getByText('Pago').closest('li')).toHaveAttribute('data-state', 'completed')
		expect(screen.getByRole('link', { name: 'Ver mi pedido' }))
			.toHaveAttribute('href', '/profile#historial-pedidos')
		expect(screen.getByRole('link', { name: 'Seguir comprando' })).toHaveAttribute('href', '/products')
		expect(screen.queryByRole('link', { name: 'Ver carrito' })).not.toBeInTheDocument()
		expect(getCheckoutOrderRequest).toHaveBeenCalledWith(
			'cs_test_123',
			{ signal: expect.any(AbortSignal) },
		)
	})

	it('mantiene el pago pendiente mientras el webhook no ha registrado el pedido', async () => {
		vi.useFakeTimers()
		getCheckoutOrderRequest.mockResolvedValue({ confirmed: false, order: null })
		renderSuccessPage('/checkout/success?session_id=cs_test_pending')

		await act(async () => {
			await vi.runAllTimersAsync()
		})

		expect(
			screen.getByRole('heading', { name: 'Tu pedido está casi listo' }),
		).toBeInTheDocument()
		expect(screen.queryByRole('heading', { name: '¡Pago completado!' })).not.toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Ver mis pedidos' }))
			.toHaveAttribute('href', '/profile#historial-pedidos')
		expect(screen.queryByRole('link', { name: 'Seguir comprando' })).not.toBeInTheDocument()
		expect(getCheckoutOrderRequest).toHaveBeenCalledTimes(8)
		expect(fetchCartRequest).not.toHaveBeenCalled()
		expect(fetchOrdersRequest).not.toHaveBeenCalled()
	})

	it('sincroniza Redux al llegar la confirmación tardía y conserva los artículos restantes', async () => {
		vi.useFakeTimers()
		const remainingItems = [{ id: 7, productId: 3, quantity: 1 }]
		const purchasedItem = { id: 8, productId: 4, quantity: 2 }
		const order = { id: 41, total: 39.98 }
		getCheckoutOrderRequest
			.mockResolvedValueOnce({ confirmed: false, order: null })
			.mockResolvedValueOnce({ confirmed: true, order })
		fetchCartRequest.mockResolvedValue({ items: remainingItems })
		fetchOrdersRequest.mockResolvedValue([order])
		const { store } = renderSuccessPage('/checkout/success?session_id=cs_test_delayed', {
			cart: { ...cartReducer(undefined, { type: 'init' }), items: [...remainingItems, purchasedItem] },
		})

		await act(async () => {})
		expect(store.getState().cart.items).toHaveLength(2)
		expect(fetchCartRequest).not.toHaveBeenCalled()
		expect(fetchOrdersRequest).not.toHaveBeenCalled()

		await act(async () => {
			await vi.advanceTimersByTimeAsync(1500)
		})

		expect(screen.getByRole('heading', { name: '¡Pago completado!' })).toBeInTheDocument()
		expect(store.getState().cart.items).toEqual(remainingItems)
		expect(store.getState().orders.items).toEqual([order])
	})

	it('mantiene la confirmación del pago y los datos previos si falla la sincronización', async () => {
		const previousItems = [{ id: 7, productId: 3, quantity: 1 }]
		getCheckoutOrderRequest.mockResolvedValue({ confirmed: true, order: { id: 41 } })
		fetchCartRequest.mockRejectedValue(new Error('Sin conexión'))
		fetchOrdersRequest.mockRejectedValue(new Error('Sin conexión'))
		const { store } = renderSuccessPage('/checkout/success?session_id=cs_test_sync_error', {
			cart: { ...cartReducer(undefined, { type: 'init' }), items: previousItems },
		})

		expect(await screen.findByRole('heading', { name: '¡Pago completado!' })).toBeInTheDocument()
		await waitFor(() => {
			expect(store.getState().cart.error).toBe('No se pudo cargar el carrito')
			expect(store.getState().orders.error).toBe('No se pudo cargar el historial de pedidos')
		})
		expect(store.getState().cart.items).toEqual(previousItems)
		expect(getCheckoutOrderRequest).toHaveBeenCalledTimes(1)
	})

	it('oculta los errores técnicos y orienta al usuario si falla la comprobación', async () => {
		vi.useFakeTimers()
		getCheckoutOrderRequest.mockRejectedValue({
			response: { data: { error: 'Ruta no encontrada' } },
		})
		renderSuccessPage('/checkout/success?session_id=cs_test_error')

		await act(async () => {
			await vi.runAllTimersAsync()
		})

		expect(
			screen.getByRole('heading', { name: 'Tu pedido todavía no aparece' }),
		).toBeInTheDocument()
		expect(screen.queryByText('Ruta no encontrada')).not.toBeInTheDocument()
		expect(screen.getByText(/no realices otro pago/i)).toBeInTheDocument()
		expect(getCheckoutOrderRequest).toHaveBeenCalledTimes(8)
	})

	it('reanuda inmediatamente la confirmación al volver a la página en móvil', async () => {
		getCheckoutOrderRequest
			.mockImplementationOnce(() => new Promise(() => {}))
			.mockResolvedValueOnce({
				confirmed: true,
				order: { id: 42, total: 29.99 },
			})
		renderSuccessPage('/checkout/success?session_id=cs_test_mobile')

		window.dispatchEvent(new Event('pageshow'))

		expect(
			await screen.findByRole('heading', { name: '¡Pago completado!' }),
		).toBeInTheDocument()
		expect(screen.getByText(/pedido #42/i)).toBeInTheDocument()
		expect(getCheckoutOrderRequest).toHaveBeenCalledTimes(2)
	})

	it('no presenta el pago como confirmado si falta session_id', () => {
		renderSuccessPage('/checkout/success')

		expect(
			screen.getByRole('heading', { name: 'No podemos mostrar la confirmación' }),
		).toBeInTheDocument()
		expect(screen.queryByRole('heading', { name: '¡Pago completado!' })).not.toBeInTheDocument()
		expect(getCheckoutOrderRequest).not.toHaveBeenCalled()
		expect(fetchCartRequest).not.toHaveBeenCalled()
		expect(fetchOrdersRequest).not.toHaveBeenCalled()
	})
})
