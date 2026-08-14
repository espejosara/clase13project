import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { fetchWishlistRequest, toggleWishlistRequest } from '../../api/wishlist'

function extractProductIds(payload) {
	if (Array.isArray(payload)) {
		if (!payload.length) return []

		if (typeof payload[0] === 'number') {
			return payload
		}

		if (typeof payload[0] === 'object' && payload[0] !== null) {
			return payload
				.map((item) => item.productId ?? item.product?.id ?? item.id)
				.filter((id) => typeof id === 'number')
		}
	}

	if (Array.isArray(payload?.productIds)) {
		return payload.productIds
	}

	if (Array.isArray(payload?.items)) {
		return extractProductIds(payload.items)
	}

	return []
}

export const fetchWishlistThunk = createAsyncThunk(
	'wishlist/fetchWishlist',
	async (_, { rejectWithValue }) => {
		try {
			return await fetchWishlistRequest()
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo cargar la wishlist')
		}
	},
)

export const toggleWishlistThunk = createAsyncThunk(
	'wishlist/toggleWishlist',
	async (productId, { rejectWithValue }) => {
		try {
			return await toggleWishlistRequest(productId)
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo actualizar la wishlist')
		}
	},
)

const initialState = {
	productIds: [],
	loading: false,
	error: null,
}

const wishlistSlice = createSlice({
	name: 'wishlist',
	initialState,
	reducers: {
		clearWishlist(state) {
			state.productIds = []
			state.error = null
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchWishlistThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(fetchWishlistThunk.fulfilled, (state, action) => {
				state.loading = false
				state.productIds = extractProductIds(action.payload)
			})
			.addCase(fetchWishlistThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo cargar la wishlist'
			})
			.addCase(toggleWishlistThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(toggleWishlistThunk.fulfilled, (state, action) => {
				state.loading = false
				state.productIds = extractProductIds(action.payload)
			})
			.addCase(toggleWishlistThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo actualizar la wishlist'
			})
	},
})

export const { clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer
