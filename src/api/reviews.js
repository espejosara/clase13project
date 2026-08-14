import api from './axios'

export async function getReviews(productId) {
	const response = await api.get(`/products/${productId}/reviews`)
	return response.data.data
}

export async function createReview(productId, payload) {
	const response = await api.post(`/products/${productId}/reviews`, payload)
	return response.data.data
}
