import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './axios'
import {
	createProduct,
	deleteProduct,
	getProductById,
	getProducts,
	updateProduct,
} from './products'

vi.mock('./axios', () => ({
	default: {
		get: vi.fn(),
		post: vi.fn(),
		put: vi.fn(),
		delete: vi.fn(),
	},
}))

describe('API de productos', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('lista y obtiene productos', async () => {
		api.get
			.mockResolvedValueOnce({ data: { data: [{ id: 1 }] } })
			.mockResolvedValueOnce({ data: { data: { id: 1 } } })

		await expect(getProducts()).resolves.toEqual([{ id: 1 }])
		await expect(getProductById(1)).resolves.toEqual({ id: 1 })
		expect(api.get).toHaveBeenNthCalledWith(1, '/products')
		expect(api.get).toHaveBeenNthCalledWith(2, '/products/1')
	})

	it('crea, actualiza y elimina productos', async () => {
		const product = { id: 1, name: 'Figura' }
		const multipartPayload = new FormData()
		multipartPayload.append('name', product.name)
		api.post.mockResolvedValue({ data: { data: product } })
		api.put.mockResolvedValue({ data: { data: product } })
		api.delete.mockResolvedValue({ data: { data: { message: 'Producto eliminado' } } })

		await expect(createProduct(multipartPayload)).resolves.toEqual(product)
		await expect(updateProduct(1, multipartPayload)).resolves.toEqual(product)
		await expect(deleteProduct(1)).resolves.toEqual({ message: 'Producto eliminado' })
		expect(api.post).toHaveBeenCalledWith('/products', multipartPayload)
		expect(api.put).toHaveBeenCalledWith('/products/1', multipartPayload)
		expect(api.delete).toHaveBeenCalledWith('/products/1')
	})
})
