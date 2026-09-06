import api from './axios'

const CONFIRMATION_REQUEST_TIMEOUT_MS = 8000

export async function createCheckoutSessionRequest() {
	const response = await api.post('/payments/checkout-session')
	const checkoutSession = response.data.data ?? response.data

	if (!checkoutSession?.url) {
		throw new Error('Stripe no devolvió una URL de pago')
	}

	return checkoutSession
}

export async function getCheckoutOrderRequest(sessionId, { signal } = {}) {
	if (!sessionId) {
		throw new Error('Falta el identificador de la sesión de Stripe')
	}

	const encodedSessionId = encodeURIComponent(sessionId)
	const response = await api.get(`/payments/checkout-session/${encodedSessionId}/order`, {
		params: { _: Date.now() },
		signal,
		timeout: CONFIRMATION_REQUEST_TIMEOUT_MS,
	})
	const confirmation = response.data.data ?? response.data

	return {
		confirmed: Boolean(confirmation?.confirmed),
		order: confirmation?.order ?? null,
	}
}
