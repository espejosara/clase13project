import { createSlice } from '@reduxjs/toolkit'
import { normalizeId } from '../../utils/id'

function extractProductIds(payload) {
	const extractIdsFromList = (items) => items
		.map((item) => {
			if (typeof item === 'object' && item !== null) {
				return normalizeId(item.productId ?? item.product?.id ?? item.product?._id ?? item.id ?? item._id)
			}

			return normalizeId(item)
		})
		.filter((id) => id !== null)

	if (Array.isArray(payload)) {
		return { ids: extractIdsFromList(payload), isRecognized: true }
	}

	if (Array.isArray(payload?.productIds)) {
		return { ids: extractIdsFromList(payload.productIds), isRecognized: true }
	}

	if (Array.isArray(payload?.items)) {
		return extractProductIds(payload.items)
	}

	if (Array.isArray(payload?.wishlist)) {
		return extractProductIds(payload.wishlist)
	}

	if (Array.isArray(payload?.wishlist?.productIds)) {
		return extractProductIds(payload.wishlist.productIds)
	}

	if (Array.isArray(payload?.wishlist?.items)) {
		return extractProductIds(payload.wishlist.items)
	}

	return { ids: [], isRecognized: false }
}

const initialState = {
	ids: [],
	productIds: [],
}

const wishlistSlice = createSlice({
	name: 'wishlist',
	initialState,
	reducers: {
		setLocalWishlist(state, action) {
			const { ids, isRecognized } = extractProductIds(action.payload)

			// Algunas respuestas del toggle solo contienen un mensaje de éxito.
			// En ese caso se conserva el cambio optimista, en vez de borrar la wishlist local.
			if (!isRecognized) {
				return
			}

			state.ids = ids
			state.productIds = ids
		},
		toggleLocalWishlist(state, action) {
			const productId = normalizeId(action.payload)

			if (productId === null) {
				return
			}

			const isInWishlist = state.ids.includes(productId)

			const nextIds = isInWishlist
				? state.ids.filter((id) => id !== productId)
				: [...state.ids, productId]

			state.ids = nextIds
			state.productIds = nextIds
		},
		clearWishlist(state) {
			state.ids = []
			state.productIds = []
		},
	},
})

export const { setLocalWishlist, toggleLocalWishlist, clearWishlist } = wishlistSlice.actions

export default wishlistSlice.reducer
