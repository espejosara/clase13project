import api from './axios'

export async function fetchWishlistRequest() {
	const response = await api.get('/wishlist')
	return response.data.data
}


export async function toggleWishlistRequest(productId) {
	const response = await api.post(`/wishlist/${productId}`)
	return response.data.data
}
