import api from './axios'

export async function createCheckoutSessionRequest() {
	const response = await api.post('/payments/checkout-session')
	const checkoutSession = response.data.data ?? response.data

	if (!checkoutSession?.url) {
		throw new Error('Stripe no devolvió una URL de pago')
	}

	return checkoutSession
}
