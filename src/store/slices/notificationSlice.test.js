import { describe, expect, it } from 'vitest'
import { addCartItemThunk } from './cartSlice'
import reducer, { showNotification } from './notificationSlice'

describe('notificationSlice', () => {
	it('avisa cuando se añade un producto al carrito', () => {
		const action = addCartItemThunk.fulfilled(
			{ message: 'Producto añadido' },
			'request-id',
			{ productId: 3, quantity: 1 },
		)

		const state = reducer(undefined, action)

		expect(state).toEqual({
			id: 1,
			message: 'Producto añadido al carrito',
			actionLabel: 'Ver carrito',
			actionTo: '/cart',
		})
	})

	it('permite avisar cuando se añade un producto a favoritos', () => {
		const state = reducer(undefined, showNotification({
			message: 'Producto añadido a favoritos',
			actionLabel: 'Ver favoritos',
			actionTo: '/wishlist',
		}))

		expect(state).toEqual({
			id: 1,
			message: 'Producto añadido a favoritos',
			actionLabel: 'Ver favoritos',
			actionTo: '/wishlist',
		})
	})
})
