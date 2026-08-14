import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

const api = axios.create({
	baseURL,
})

api.interceptors.request.use((config) => {
	const token = localStorage.getItem(AUTH_TOKEN_KEY)

	if (token) {
		config.headers.Authorization = `Bearer ${token}`
	}

	return config
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem(AUTH_TOKEN_KEY)
			localStorage.removeItem(AUTH_USER_KEY)

			if (window.location.pathname !== '/login') {
				window.location.href = '/login'
			}
		}

		return Promise.reject(error)
	},
)

export default api
