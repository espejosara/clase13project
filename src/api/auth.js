import api from './axios'

export async function login(payload) {
	const response = await api.post('/auth/login', payload)
	return response.data.data
}

export async function register(payload) {
	const response = await api.post('/auth/register', payload)
	return response.data.data
}

export async function logoutRequest() {
	const response = await api.post('/auth/logout')
	return response.data.data ?? response.data
}

export async function fetchCurrentUserRequest({ suppressAuthRedirect = false } = {}) {
	const response = await api.get('/auth/me', { suppressAuthRedirect })
	return response.data.data ?? response.data
}
