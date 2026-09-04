import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchOrdersRequest } from '../../api/orders'
import { logoutThunk } from './authSlice'

const initialState = {
	items: [],
	loading: false,
	error: null,
}

export const fetchOrdersThunk = createAsyncThunk(
	'orders/fetchOrders',
	async (_, { rejectWithValue }) => {
		try {
			return await fetchOrdersRequest()
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo cargar el historial de pedidos')
		}
	},
)

const ordersSlice = createSlice({
	name: 'orders',
	initialState,
	reducers: {},
	extraReducers: (builder) => {
		builder
			.addCase(logoutThunk.fulfilled, (state) => {
				state.items = []
				state.loading = false
				state.error = null
			})
			.addCase(fetchOrdersThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchOrdersThunk.fulfilled, (state, action) => {
				state.loading = false
				state.items = Array.isArray(action.payload) ? action.payload : []
			})
			.addCase(fetchOrdersThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo cargar el historial de pedidos'
			})
	},
})

export default ordersSlice.reducer
