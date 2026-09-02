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
			await screen.findByRole('heading', { name: 'Pago confirmado' }),
		).toBeInTheDocument()
		expect(screen.getByText(/pedido #41/i)).toBeInTheDocument()
		expect(getCheckoutOrderRequest).toHaveBeenCalledWith('cs_test_123')
	})

	it('mantiene el pago pendiente mientras el webhook no ha registrado el pedido', async () => {
		vi.useFakeTimers()
		getCheckoutOrderRequest.mockResolvedValue({ confirmed: false, order: null })
		renderSuccessPage('/checkout/success?session_id=cs_test_pending')

		await act(async () => {
			await vi.runAllTimersAsync()
		})

		expect(
			screen.getByRole('heading', { name: 'El pedido aún se está procesando' }),
		).toBeInTheDocument()
		expect(screen.queryByRole('heading', { name: 'Pago confirmado' })).not.toBeInTheDocument()
		expect(getCheckoutOrderRequest).toHaveBeenCalledTimes(8)
	})

	it('no presenta el pago como confirmado si falta session_id', () => {
		renderSuccessPage('/checkout/success')

		expect(
			screen.getByRole('heading', { name: 'No podemos identificar la sesión de Stripe' }),
		).toBeInTheDocument()
		expect(screen.queryByRole('heading', { name: 'Pago confirmado' })).not.toBeInTheDocument()
		expect(getCheckoutOrderRequest).not.toHaveBeenCalled()
	})
})
