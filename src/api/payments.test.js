import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './axios'
import { createCheckoutSessionRequest, getCheckoutOrderRequest } from './payments'

vi.mock('./axios', () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
	},
}))

describe('API de pagos', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('solicita una Checkout Session sin enviar precios desde el frontend', async () => {
		const checkoutSession = {
			sessionId: 'cs_test_123',
			url: 'https://checkout.stripe.com/c/pay/cs_test_123',
		}
		api.post.mockResolvedValue({ data: { data: checkoutSession } })

		const result = await createCheckoutSessionRequest()

		expect(api.post).toHaveBeenCalledWith('/payments/checkout-session')
		expect(result).toEqual(checkoutSession)
	})

	it('rechaza una respuesta que no contiene la URL de Stripe', async () => {
		api.post.mockResolvedValue({ data: { data: { sessionId: 'cs_test_123' } } })

		await expect(createCheckoutSessionRequest()).rejects.toThrow(
			'Stripe no devolvió una URL de pago',
		)
	})

	it('consulta el pedido asociado a la sesión de Stripe', async () => {
		const confirmation = {
			confirmed: true,
			order: { id: 41, total: 39.98 },
		}
		api.get.mockResolvedValue({ data: { data: confirmation } })

		const result = await getCheckoutOrderRequest('cs_test_123')

		expect(api.get).toHaveBeenCalledWith('/payments/checkout-session/cs_test_123/order')
		expect(result).toEqual(confirmation)
	})

	it('normaliza como pendiente una sesión que todavía no tiene pedido', async () => {
		api.get.mockResolvedValue({
			data: { data: { confirmed: false, order: null } },
		})

		await expect(getCheckoutOrderRequest('cs_test_pending')).resolves.toEqual({
			confirmed: false,
			order: null,
		})
	})
})
