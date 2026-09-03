import api from './axios'

export async function fetchRecommendationsRequest() {
	const response = await api.get('/products/recommendations')
	const recommendations = response.data.data ?? response.data

	return {
		strategy: recommendations?.strategy || 'featured',
		categories: Array.isArray(recommendations?.categories) ? recommendations.categories : [],
		items: Array.isArray(recommendations?.items) ? recommendations.items : [],
	}
}
