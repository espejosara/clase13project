import { describe, expect, it } from 'vitest'
import cartReducer from './slices/cartSlice'
import { logoutThunk } from './slices/authSlice'
import ordersReducer from './slices/ordersSlice'
import wishlistReducer from './slices/wishlistSlice'

const logoutFulfilled = { type: logoutThunk.fulfilled.type }

describe('limpieza de datos privados al cerrar sesión', () => {
	it('vacía carrito, wishlist y pedidos', () => {
		const cart = cartReducer({
			items: [{ id: 1 }],
			loading: true,
			isCheckingOut: true,
			error: 'error anterior',
		}, logoutFulfilled)
		const wishlist = wishlistReducer({
			ids: [1],
			productIds: [1],
		}, logoutFulfilled)
		const orders = ordersReducer({
			items: [{ id: 9 }],
			loading: true,
			error: 'error anterior',
		}, logoutFulfilled)

		expect(cart).toEqual({
			items: [],
			loading: false,
			isCheckingOut: false,
			error: null,
		})
		expect(wishlist).toEqual({ ids: [], productIds: [] })
		expect(orders).toEqual({ items: [], loading: false, error: null })
	})
})
