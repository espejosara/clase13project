import api from './axios'

export async function login(payload) {
	const response = await api.post('/auth/login', payload)
	return response.data.data
}

export async function register(payload) {
	const response = await api.post('/auth/register', payload)
	return response.data.data
}

export async function fetchCurrentUserRequest() {
	const response = await api.get('/auth/me')
	return response.data.data ?? response.data
}
