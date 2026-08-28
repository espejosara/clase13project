import api from './axios'

export async function fetchCartRequest() {
	const response = await api.get('/cart')
	return response.data.data ?? response.data
}

export async function addCartItemRequest(payload) {
	const response = await api.post('/cart/items', payload)
	return response.data.data ?? response.data
}

export async function updateCartItemQuantity(itemId, quantity) {
	const response = await api.patch(`/cart/items/${itemId}`, { quantity })
	return response.data.data ?? response.data
}

export async function removeCartItemRequest(itemId) {
	const response = await api.delete(`/cart/items/${itemId}`)
	return response.data.data ?? response.data
}
