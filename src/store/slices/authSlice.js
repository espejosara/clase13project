import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	fetchCurrentUserRequest,
	login,
	logoutRequest,
	register,
} from '../../api/auth'

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

export const restoreSessionThunk = createAsyncThunk(
	'auth/restoreSession',
	async (_, { rejectWithValue }) => {
		try {
			return await fetchCurrentUserRequest({ suppressAuthRedirect: true })
		} catch (error) {
			return rejectWithValue(error.response?.status === 401
				? null
				: error.response?.data?.error || 'No se pudo comprobar la sesión')
		}
	},
)

export const logoutThunk = createAsyncThunk(
	'auth/logout',
	async (_, { rejectWithValue }) => {
		try {
			return await logoutRequest()
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo cerrar la sesión')
		}
	},
)

const initialState = {
	user: null,
	sessionChecked: false,
	loading: false,
	error: null,
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(loginThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(loginThunk.fulfilled, (state, action) => {
				state.loading = false
				state.error = null
				state.sessionChecked = true
				state.user = normalizeUser(action.payload?.user || action.payload)
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
				state.sessionChecked = true
				state.user = normalizeUser(action.payload?.user || action.payload)
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
			})
			.addCase(fetchCurrentUserThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo cargar el perfil del usuario'
			})
			.addCase(restoreSessionThunk.pending, (state) => {
				state.sessionChecked = false
			})
			.addCase(restoreSessionThunk.fulfilled, (state, action) => {
				state.user = normalizeUser(action.payload)
				state.sessionChecked = true
				state.error = null
			})
			.addCase(restoreSessionThunk.rejected, (state, action) => {
				state.user = null
				state.sessionChecked = true
				state.error = action.payload
			})
			.addCase(logoutThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(logoutThunk.fulfilled, (state) => {
				state.user = null
				state.sessionChecked = true
				state.loading = false
				state.error = null
			})
			.addCase(logoutThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo cerrar la sesión'
			})
	},
})

export const selectIsAdmin = (state) => (
	String(state.auth.user?.role || '').toUpperCase() === 'ADMIN'
)

export default authSlice.reducer
