import { describe, expect, it } from 'vitest'
import { formatOrderItemSummary, getOrderItemCounts } from './orderSummary'

describe('resumen de productos de un pedido', () => {
	it('muestra el total de artículos con un texto propio de una tienda', () => {
		const items = [
			{ productId: 10, quantity: 1 },
			{ productId: 20, quantity: 2 },
			{ productId: 30, quantity: 1 },
		]

		expect(getOrderItemCounts(items)).toEqual({
			totalUnits: 4,
			distinctProducts: 3,
		})
		expect(formatOrderItemSummary(items)).toBe('4 artículos')
	})

	it('suma correctamente dos líneas del mismo producto', () => {
		const items = [
			{ productId: 10, quantity: 1 },
			{ productId: 10, quantity: 2 },
		]

		expect(getOrderItemCounts(items)).toEqual({
			totalUnits: 3,
			distinctProducts: 1,
		})
		expect(formatOrderItemSummary(items)).toBe('3 artículos')
	})

	it('utiliza el singular cuando solo hay un artículo', () => {
		expect(formatOrderItemSummary([{ productId: 10, quantity: 1 }])).toBe('1 artículo')
	})
})
