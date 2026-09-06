import { act, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCheckoutOrderRequest } from '../../api/payments'
import CheckoutSuccessPage from './CheckoutSuccessPage'

vi.mock('../../api/payments', () => ({
	getCheckoutOrderRequest: vi.fn(),
}))

function renderSuccessPage(route) {
	return render(
		<MemoryRouter initialEntries={[route]}>
			<CheckoutSuccessPage />
		</MemoryRouter>,
	)
}

describe('CheckoutSuccessPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useRealTimers()
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
	})
})
