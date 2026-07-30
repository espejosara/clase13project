import api from './axios'

export async function getReviews(productId) {
	const response = await api.get(`/products/${productId}/reviews`)
	return response.data.data
}
