import { describe, expect, it } from 'vitest'
import { formatOrderItemSummary, getOrderItemCounts } from './orderSummary'

describe('resumen de productos de un pedido', () => {
	it('distingue entre unidades y productos diferentes', () => {
		const items = [
			{ productId: 10, quantity: 1 },
			{ productId: 20, quantity: 2 },
			{ productId: 30, quantity: 1 },
		]

		expect(getOrderItemCounts(items)).toEqual({
			totalUnits: 4,
			distinctProducts: 3,
		})
		expect(formatOrderItemSummary(items)).toBe(
			'4 unidades · 3 productos diferentes',
		)
	})

	it('no cuenta dos líneas del mismo producto como productos diferentes', () => {
		const items = [
			{ productId: 10, quantity: 1 },
			{ productId: 10, quantity: 2 },
		]

		expect(formatOrderItemSummary(items)).toBe(
			'3 unidades · 1 producto diferente',
		)
	})

	it('utiliza el singular cuando solo hay una unidad', () => {
		expect(formatOrderItemSummary([{ productId: 10, quantity: 1 }])).toBe(
			'1 unidad · 1 producto diferente',
		)
	})
})
