import axios from 'axios'

const LOCAL_API_BASE_URL = 'http://localhost:3000'
const PRODUCTION_API_BASE_URL = 'https://backend-lite-sprint13.onrender.com'
const baseURL = import.meta.env.VITE_API_BASE_URL
	|| (import.meta.env.PROD ? PRODUCTION_API_BASE_URL : LOCAL_API_BASE_URL)
const AUTH_EXPIRED_KEY = 'auth_session_expired'

const api = axios.create({
	baseURL,
	withCredentials: true,
})

api.interceptors.response.use(
	(response) => response,
	(error) => {
		const requestUrl = error.config?.url
		const isAuthRequest = ['/auth/login', '/auth/register', '/auth/logout'].includes(requestUrl)
		const shouldRedirect = !error.config?.suppressAuthRedirect && !isAuthRequest

		if (error.response?.status === 401 && shouldRedirect) {
			sessionStorage.setItem(AUTH_EXPIRED_KEY, '1')

			if (window.location.pathname !== '/login') {
				window.location.href = '/login'
			}
		}

		return Promise.reject(error)
	},
)

export default api
