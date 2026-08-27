import axios from 'axios'

const LOCAL_API_BASE_URL = 'http://localhost:3000'
const PRODUCTION_API_BASE_URL = 'https://backend-lite-sprint13.onrender.com'
const baseURL = import.meta.env.VITE_API_BASE_URL
	|| (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL)
const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'
const AUTH_EXPIRED_KEY = 'auth_session_expired'

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
			sessionStorage.setItem(AUTH_EXPIRED_KEY, '1')

			if (window.location.pathname !== '/login') {
				window.location.href = '/login'
			}
		}

		return Promise.reject(error)
	},
)

export default api
