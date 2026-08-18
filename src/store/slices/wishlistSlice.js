import { createSlice } from '@reduxjs/toolkit'
import { normalizeId } from '../../utils/id'

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

const initialState = {
	productIds: [],
}

const wishlistSlice = createSlice({
	name: 'wishlist',
	initialState,
	reducers: {
		setLocalWishlist(state, action) {
			state.productIds = extractProductIds(action.payload)
		},
		toggleLocalWishlist(state, action) {
			const productId = normalizeId(action.payload)

			if (productId === null) {
				return
			}

			const isInWishlist = state.productIds.includes(productId)

			state.productIds = isInWishlist
				? state.productIds.filter((id) => id !== productId)
				: [...state.productIds, productId]
		},
		clearWishlist(state) {
			state.productIds = []
		},
	},
})

export const { setLocalWishlist, toggleLocalWishlist, clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer
