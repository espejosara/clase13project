import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { login, register } from '../../api/auth'

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

const initialState = {
	token: localStorage.getItem(AUTH_TOKEN_KEY),
	user: getStoredUser(),
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
				state.user = action.payload?.user || action.payload

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
				state.user = action.payload?.user || action.payload

				persistAuth({ token: state.token, user: state.user })
			})
			.addCase(registerThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo crear la cuenta'
			})
	},
})

export const { logout } = authSlice.actions

export default authSlice.reducer
