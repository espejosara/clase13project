import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './axios'
import { removeCartItemRequest, updateCartItemQuantity } from './cart'

vi.mock('./axios', () => ({
	default: {
		delete: vi.fn(),
		patch: vi.fn(),
	},
}))

describe('API del carrito', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('actualiza la cantidad mediante PATCH', async () => {
		const updatedItem = { id: 7, quantity: 2 }
		api.patch.mockResolvedValue({ data: { data: updatedItem } })

		const result = await updateCartItemQuantity(7, 2)

		expect(api.patch).toHaveBeenCalledWith('/cart/items/7', { quantity: 2 })
		expect(result).toEqual(updatedItem)
	})

	it('elimina la línea completa mediante DELETE', async () => {
		const response = { message: 'Item eliminado del carrito' }
		api.delete.mockResolvedValue({ data: { data: response } })

		const result = await removeCartItemRequest(7)

		expect(api.delete).toHaveBeenCalledWith('/cart/items/7')
		expect(result).toEqual(response)
	})
})
