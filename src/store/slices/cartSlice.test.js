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
	it('conserva el producto completo al añadir desde favoritos', () => {
		const addedItem = {
			id: 12,
			productId: 4,
			quantity: 1,
			product: { id: 4, name: 'Figura favorita', price: '39.99', imageUrl: '/figura.jpg', stock: 5 },
		}
		const action = addCartItemThunk.fulfilled(addedItem, 'request-id', { productId: 4, quantity: 1 })

		const state = reducer(createState({ items: [] }), action)

		expect(state.items).toEqual([addedItem])
		expect(Number(state.items[0].product.price) * state.items[0].quantity).toBe(39.99)
	})

	it('sustituye la línea existente con la cantidad y los datos del servidor', () => {
		const updatedItem = { ...cartItem, quantity: 5, product: { ...cartItem.product, price: '29.99' } }
		const action = addCartItemThunk.fulfilled(updatedItem, 'request-id', { productId: '3', quantity: 1 })

		const state = reducer(createState(), action)

		expect(state.items).toEqual([updatedItem])
	})

	it('no confunde el identificador de una línea con el del producto añadido', () => {
		const addedItem = { id: 20, productId: 7, quantity: 1, product: { id: 7, name: 'Otra figura', price: '15.00' } }
		const action = addCartItemThunk.fulfilled(addedItem, 'request-id', { productId: 7, quantity: 1 })

		const state = reducer(createState(), action)

		expect(state.items).toEqual([cartItem, addedItem])
	})

	it('completa una línea que solo tenía identificador y cantidad', () => {
		const action = addCartItemThunk.fulfilled(cartItem, 'request-id', { productId: 3, quantity: 1 })
		const state = reducer(createState({ items: [{ productId: '3', quantity: 1 }] }), action)

		expect(state.items).toEqual([cartItem])
	})

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
