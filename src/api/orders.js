import api from './axios'

function normalizeOrderList(payload) {
	if (Array.isArray(payload)) return payload
	if (Array.isArray(payload?.orders)) return payload.orders
	if (Array.isArray(payload?.data)) return payload.data
	if (Array.isArray(payload?.items)) return payload.items
	if (Array.isArray(payload?.results)) return payload.results
	return []
}

export async function fetchOrdersRequest() {
	const configuredEndpoint = import.meta.env.VITE_ORDERS_ENDPOINT
	const endpoints = [
		configuredEndpoint,
		'/orders',
		'/users/orders',
		'/profile/orders',
		'/auth/orders',
	].filter(Boolean)

	const uniqueEndpoints = [...new Set(endpoints)]

	for (const endpoint of uniqueEndpoints) {
		try {
			const response = await api.get(endpoint)
			return normalizeOrderList(response.data?.data ?? response.data)
		} catch (error) {
			if (error.response?.status === 404) {
				continue
			}
			throw error
		}
	}

	return []
}
