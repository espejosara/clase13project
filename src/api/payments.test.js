import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './axios'
import { createCheckoutSessionRequest } from './payments'

vi.mock('./axios', () => ({
	default: {
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
})
