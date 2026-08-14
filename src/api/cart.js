import api from './axios'

export async function fetchCartRequest() {
	const response = await api.get('/cart')
	return response.data.data
}

export async function addCartItemRequest(payload) {
	const response = await api.post('/cart/items', payload)
	return response.data.data
}

export async function removeCartItemRequest(itemId) {
	const response = await api.delete(`/cart/items/${itemId}`)
	return response.data.data
}

export async function checkoutRequest() {
	const response = await api.post('/cart/checkout')
	return response.data.data
}
