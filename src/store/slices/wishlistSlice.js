import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	addWishlistRequest,
	fetchWishlistRequest,
	removeWishlistRequest,
} from '../../api/wishlist'
import { idsAreEqual, normalizeId } from '../../utils/id'

function extractProductIds(payload) {
	if (Array.isArray(payload)) {
		if (!payload.length) return []

		if (typeof payload[0] === 'number') {
			return payload.map(normalizeId).filter((id) => id !== null)
		}

		if (typeof payload[0] === 'object' && payload[0] !== null) {
			return payload
				.map((item) => normalizeId(item.productId ?? item.product?.id ?? item.id))
				.filter((id) => id !== null)
		}
	}

	if (Array.isArray(payload?.productIds)) {
		return payload.productIds.map(normalizeId).filter((id) => id !== null)
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

export const addWishlistThunk = createAsyncThunk(
	'wishlist/addWishlist',
	async (productId, { rejectWithValue }) => {
		try {
			await addWishlistRequest(productId)
			return await fetchWishlistRequest()
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo actualizar la wishlist')
		}
	},
)

export const removeWishlistThunk = createAsyncThunk(
	'wishlist/removeWishlist',
	async (productId, { rejectWithValue }) => {
		try {
			await removeWishlistRequest(productId)
			return await fetchWishlistRequest()
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo actualizar la wishlist')
		}
	},
)

export const toggleWishlistThunk = createAsyncThunk(
	'wishlist/toggleWishlist',
	async (productId, { getState, rejectWithValue }) => {
		try {
			const { wishlist } = getState()
			const isInWishlist = wishlist.productIds.some((id) => idsAreEqual(id, productId))

			if (isInWishlist) {
				await removeWishlistRequest(productId)
			} else {
				await addWishlistRequest(productId)
			}

			return await fetchWishlistRequest()
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
			.addCase(addWishlistThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(addWishlistThunk.fulfilled, (state, action) => {
				state.loading = false
				state.productIds = extractProductIds(action.payload)
			})
			.addCase(addWishlistThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo actualizar la wishlist'
			})
			.addCase(removeWishlistThunk.pending, (state) => {
				state.loading = true
				state.error = null
			})
			.addCase(removeWishlistThunk.fulfilled, (state, action) => {
				state.loading = false
				state.productIds = extractProductIds(action.payload)
			})
			.addCase(removeWishlistThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo actualizar la wishlist'
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
