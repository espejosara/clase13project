import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchCurrentUserRequest, login, register } from '../../api/auth'

const AUTH_TOKEN_KEY = 'auth_token'
const AUTH_USER_KEY = 'auth_user'

function getStoredUser() {
	const rawUser = localStorage.getItem(AUTH_USER_KEY)
	if (!rawUser) return null

	try {
		return JSON.parse(rawUser)
	} catch {
		localStorage.removeItem(AUTH_USER_KEY)
		return null
	}
}

function persistAuth({ token, user }) {
	if (token) {
		localStorage.setItem(AUTH_TOKEN_KEY, token)
	} else {
		localStorage.removeItem(AUTH_TOKEN_KEY)
	}

	if (user) {
		localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
	} else {
		localStorage.removeItem(AUTH_USER_KEY)
	}
}

function normalizeUser(inputUser) {
	if (!inputUser || typeof inputUser !== 'object') return null

	const user = inputUser.user || inputUser
	const wishlist = inputUser.wishlist || user?.wishlist || {}
	const checkout = inputUser.checkout || user?.checkout || {}

	const normalizedWishlistCount = Number(
		wishlist.count ?? user?.wishlistCount ?? wishlist.items?.length ?? user?.wishlistItems?.length ?? 0,
	)

	const normalizedOrdersCount = Number(
		checkout.ordersCount ?? user?.checkoutOrdersCount ?? 0,
	)

	return {
		id: user.id ?? user._id ?? inputUser.id ?? inputUser._id ?? null,
		name: user.name || user.fullName || user.username || 'Sin nombre',
		email: user.email || 'Sin email',
		role: user.role || 'user',
		phone: user.phone || user.telephone || null,
		address: user.address || user.location || null,
		createdAt: user.createdAt || user.registeredAt || user.memberSince || null,
		memberSince: user.memberSince || user.createdAt || user.registeredAt || null,
		wishlist: {
			count: Number.isFinite(normalizedWishlistCount) ? normalizedWishlistCount : 0,
			items: Array.isArray(wishlist.items) ? wishlist.items : Array.isArray(user?.wishlistItems) ? user.wishlistItems : [],
		},
		checkout: {
			ordersCount: Number.isFinite(normalizedOrdersCount) ? normalizedOrdersCount : 0,
			lastOrder: checkout.lastOrder ?? user?.lastOrder ?? null,
		},
		wishlistCount: Number.isFinite(normalizedWishlistCount) ? normalizedWishlistCount : 0,
		checkoutOrdersCount: Number.isFinite(normalizedOrdersCount) ? normalizedOrdersCount : 0,
		lastOrder: checkout.lastOrder ?? user?.lastOrder ?? null,
	}
}

export const loginThunk = createAsyncThunk(
	'auth/login',
	async (formData, { rejectWithValue }) => {
		try {
			const authData = await login(formData)
			return authData
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo iniciar sesión')
		}
	},
)

export const registerThunk = createAsyncThunk(
	'auth/register',
	async (formData, { rejectWithValue }) => {
		try {
			const authData = await register(formData)
			return authData
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo crear la cuenta')
		}
	},
)

export const fetchCurrentUserThunk = createAsyncThunk(
	'auth/fetchCurrentUser',
	async (_, { rejectWithValue }) => {
		try {
			return await fetchCurrentUserRequest()
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo cargar el perfil del usuario')
		}
	},
)

const initialState = {
	token: localStorage.getItem(AUTH_TOKEN_KEY),
	user: normalizeUser(getStoredUser()),
	loading: false,
	error: null,
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		logout(state) {
			state.token = null
			state.user = null
			state.error = null
			persistAuth({ token: null, user: null })
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(loginThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(loginThunk.fulfilled, (state, action) => {
				state.loading = false
				state.error = null

				state.token = action.payload?.token || state.token
				state.user = normalizeUser(action.payload?.user || action.payload)

				persistAuth({ token: state.token, user: state.user })
			})
			.addCase(loginThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo iniciar sesión'
			})
			.addCase(registerThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(registerThunk.fulfilled, (state, action) => {
				state.loading = false
				state.error = null

				state.token = action.payload?.token || state.token
				state.user = normalizeUser(action.payload?.user || action.payload)

				persistAuth({ token: state.token, user: state.user })
			})
			.addCase(registerThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo crear la cuenta'
			})
			.addCase(fetchCurrentUserThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchCurrentUserThunk.fulfilled, (state, action) => {
				state.loading = false
				state.error = null

				state.user = normalizeUser(action.payload)
				persistAuth({ token: state.token, user: state.user })
			})
			.addCase(fetchCurrentUserThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo cargar el perfil del usuario'
			})
	},
})

export const { logout } = authSlice.actions

export default authSlice.reducer
