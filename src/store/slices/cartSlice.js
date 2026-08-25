import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
	addCartItemRequest,
	checkoutRequest,
	fetchCartRequest,
	removeCartItemRequest,
} from '../../api/cart'

function extractItems(payload) {
	if (Array.isArray(payload)) return payload
	if (Array.isArray(payload?.items)) return payload.items
	if (Array.isArray(payload?.cart?.items)) return payload.cart.items
	return []
}

function normalizeComparableId(value) {
	if (value === null || value === undefined) return null
	return String(value)
}

function itemMatchesById(item, rawId) {
	const comparableRawId = normalizeComparableId(rawId)
	if (!comparableRawId) return false

	const candidateIds = [item?.itemId, item?.id, item?.productId, item?.product?.id]
	return candidateIds.some((candidateId) => normalizeComparableId(candidateId) === comparableRawId)
}

function decrementOrRemoveItem(items, payload) {
	const removeTargetId = payload?.itemId ?? payload?.productId ?? payload
	const shouldRemoveAll = payload?.removeAll === true
	const nextItems = []
	let hasChanged = false

	for (const item of items) {
		if (!hasChanged && itemMatchesById(item, removeTargetId)) {
			if (shouldRemoveAll) {
				hasChanged = true
				continue
			}

			const quantity = Number(item.quantity ?? 1)
			if (Number.isFinite(quantity) && quantity > 1) {
				nextItems.push({ ...item, quantity: quantity - 1 })
			} else {
				// Remove complete line item when quantity reaches zero.
			}
			hasChanged = true
			continue
		}

		nextItems.push(item)
	}

	return hasChanged ? nextItems : items
}

function incrementOrAppendItem(items, payload) {
	const productId = payload?.productId ?? payload
	const requestedQuantity = Number(payload?.quantity ?? 1)
	const quantityToAdd = Number.isFinite(requestedQuantity) && requestedQuantity > 0 ? requestedQuantity : 1
	const comparableProductId = normalizeComparableId(productId)

	if (!comparableProductId) {
		return items
	}

	let hasChanged = false
	const nextItems = items.map((item) => {
		if (!hasChanged && itemMatchesById(item, comparableProductId)) {
			hasChanged = true
			const currentQuantity = Number(item.quantity ?? 1)
			const safeCurrentQuantity = Number.isFinite(currentQuantity) && currentQuantity > 0 ? currentQuantity : 1
			return {
				...item,
				quantity: safeCurrentQuantity + quantityToAdd,
			}
		}

		return item
	})

	if (hasChanged) {
		return nextItems
	}

	return [
		...items,
		{
			productId,
			quantity: quantityToAdd,
		},
	]
}

export const fetchCartThunk = createAsyncThunk(
	'cart/fetchCart',
	async (_, { rejectWithValue }) => {
		try {
			return await fetchCartRequest()
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo cargar el carrito')
		}
	},
)

export const addCartItemThunk = createAsyncThunk(
	'cart/addCartItem',
	async (payload, { rejectWithValue }) => {
		try {
			return await addCartItemRequest(payload)
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo añadir al carrito')
		}
	},
)

export const removeCartItemThunk = createAsyncThunk(
	'cart/removeCartItem',
	async (payload, { rejectWithValue }) => {
		try {
			const itemId = payload?.itemId ?? payload
			return await removeCartItemRequest(itemId)
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo eliminar el item')
		}
	},
)

export const checkoutThunk = createAsyncThunk(
	'cart/checkout',
	async (_, { rejectWithValue }) => {
		try {
			return await checkoutRequest()
		} catch (error) {
			return rejectWithValue(error.response?.data?.error || 'No se pudo completar el checkout')
		}
	},
)

const initialState = {
	items: [],
	loading: false,
	isCheckingOut: false,
	error: null,
}

const cartSlice = createSlice({
	name: 'cart',
	initialState,
	reducers: {
		clearCart(state) {
			state.items = []
				state.isCheckingOut = false
			state.error = null
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(fetchCartThunk.pending, (state) => {
				state.loading = true
					state.isCheckingOut = false
				state.error = null
			})
			.addCase(fetchCartThunk.fulfilled, (state, action) => {
				state.loading = false
				state.items = extractItems(action.payload)
			})
			.addCase(fetchCartThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo cargar el carrito'
			})
			.addCase(addCartItemThunk.pending, (state) => {
				state.loading = true
					state.isCheckingOut = false
				state.error = null
			})
			.addCase(addCartItemThunk.fulfilled, (state, action) => {
				state.loading = false

				const backendItems = extractItems(action.payload)
				if (backendItems.length) {
					state.items = backendItems
					return
				}

				state.items = incrementOrAppendItem(state.items, action.meta.arg)
			})
			.addCase(addCartItemThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo añadir al carrito'
			})
			.addCase(removeCartItemThunk.pending, (state) => {
				state.loading = true
					state.isCheckingOut = false
				state.error = null
			})
			.addCase(removeCartItemThunk.fulfilled, (state, action) => {
				state.loading = false

				const backendItems = extractItems(action.payload)
				if (backendItems.length) {
					state.items = backendItems
					return
				}

				state.items = decrementOrRemoveItem(state.items, action.meta.arg)
			})
			.addCase(removeCartItemThunk.rejected, (state, action) => {
				state.loading = false
				state.error = action.payload || 'No se pudo eliminar el item'
			})
			.addCase(checkoutThunk.pending, (state) => {
					state.isCheckingOut = true
				state.error = null
			})
			.addCase(checkoutThunk.fulfilled, (state, action) => {
					state.isCheckingOut = false
				state.items = extractItems(action.payload)
			})
			.addCase(checkoutThunk.rejected, (state, action) => {
					state.isCheckingOut = false
				state.error = action.payload || 'No se pudo completar el checkout'
			})
	},
})

export const { clearCart } = cartSlice.actions

export default cartSlice.reducer
