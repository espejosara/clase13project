import api from './axios'

export async function fetchWishlistRequest() {
	const response = await api.get('/wishlist')
	return response.data.data
}

export async function addWishlistRequest(productId) {
	const response = await api.post(`/wishlist/${productId}`)
	return response.data.data
}

export async function removeWishlistRequest(productId) {
	const routesToTry = [
		() => api.delete(`/wishlist/remove/${productId}`),
		() => api.post(`/wishlist/remove/${productId}`),
		() => api.delete(`/wishlist/${productId}`),
		() => api.post(`/wishlist/${productId}`),
	]

	let lastError

	for (const request of routesToTry) {
		try {
			const response = await request()
			return response.data.data
		} catch (error) {
			lastError = error
		}
	}

	throw lastError
}
