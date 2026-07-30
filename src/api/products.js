import api from './axios'

export async function getProducts() {
	const response = await api.get('/products')
	return response.data.data
}

export async function getProductById(id) {
	const response = await api.get(`/products/${id}`)
	return response.data.data
}
