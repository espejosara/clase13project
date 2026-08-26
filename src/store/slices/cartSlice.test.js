import { describe, expect, it } from 'vitest'
import reducer, {
	addCartItemThunk,
	removeCartItemThunk,
	updateCartItemQuantityThunk,
} from './cartSlice'

const cartItem = {
	id: 7,
	productId: 3,
	quantity: 2,
	product: {
		id: 3,
		name: 'Figura de prueba',
		price: 24.99,
	},
}

function createState(overrides = {}) {
	return {
		items: [cartItem],
		loading: false,
		isCheckingOut: false,
		error: null,
		...overrides,
	}
}

describe('cartSlice', () => {
	it('incrementa una unidad después de añadir el mismo producto', () => {
		const action = addCartItemThunk.fulfilled(
			{ message: 'Producto añadido' },
			'request-id',
			{ productId: 3, quantity: 1 },
		)

		const state = reducer(createState(), action)

		expect(state.items[0].quantity).toBe(3)
	})

	it('aplica la cantidad devuelta por PATCH', () => {
		const updatedItem = { ...cartItem, quantity: 1 }
		const action = updateCartItemQuantityThunk.fulfilled(
			updatedItem,
			'request-id',
			{ itemId: 7, quantity: 1 },
		)

		const state = reducer(createState(), action)

		expect(state.items).toEqual([updatedItem])
	})

	it('elimina toda la línea después de DELETE', () => {
		const action = removeCartItemThunk.fulfilled(
			{ message: 'Item eliminado del carrito' },
			'request-id',
			{ itemId: 7 },
		)

		const state = reducer(createState(), action)

		expect(state.items).toEqual([])
	})

	it('mantiene los artículos cuando PATCH falla', () => {
		const action = {
			type: updateCartItemQuantityThunk.rejected.type,
			payload: 'No se pudo actualizar la cantidad',
			meta: { arg: { itemId: 7, quantity: 1 } },
		}

		const state = reducer(createState({ loading: true }), action)

		expect(state.items).toEqual([cartItem])
		expect(state.loading).toBe(false)
		expect(state.error).toBe('No se pudo actualizar la cantidad')
	})
})
