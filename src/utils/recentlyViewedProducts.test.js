import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
	getRecentlyViewedStorageKey,
	readRecentlyViewedProducts,
	rememberViewedProduct,
} from './recentlyViewedProducts'

const userKey = 'sara@test.com'
const storageKey = getRecentlyViewedStorageKey(userKey)

describe('recentlyViewedProducts', () => {
	beforeEach(() => {
		localStorage.clear()
	})
	afterEach(() => {
		localStorage.clear()
	})

	it('tolera datos dañados y limita el historial a cinco productos únicos', () => {
		localStorage.setItem(storageKey, '{invalid')
		expect(readRecentlyViewedProducts(userKey)).toEqual([])

		for (let id = 1; id <= 6; id += 1) {
			rememberViewedProduct({ id, name: `Producto ${id}`, price: id }, userKey)
		}
		rememberViewedProduct({ id: 4, name: 'Producto 4 actualizado', price: 40 }, userKey)

		const products = readRecentlyViewedProducts(userKey)
		expect(products).toHaveLength(5)
		expect(products.map((product) => product.id)).toEqual([4, 6, 5, 3, 2])
		expect(products[0].name).toBe('Producto 4 actualizado')
	})

	it('mantiene historiales separados para cada usuario', () => {
		rememberViewedProduct({ id: 1, name: 'Producto de Sara' }, 'sara@test.com')
		rememberViewedProduct({ id: 2, name: 'Producto de Julio' }, 'julio@test.com')

		expect(readRecentlyViewedProducts('sara@test.com').map((product) => product.id)).toEqual([1])
		expect(readRecentlyViewedProducts('julio@test.com').map((product) => product.id)).toEqual([2])
		expect(readRecentlyViewedProducts()).toEqual([])
	})
})
