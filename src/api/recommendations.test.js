import { beforeEach, describe, expect, it, vi } from 'vitest'
import api from './axios'
import { fetchRecommendationsRequest } from './recommendations'

vi.mock('./axios', () => ({
	default: {
		get: vi.fn(),
	},
}))

describe('API de recomendaciones', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('obtiene las recomendaciones calculadas para el usuario autenticado', async () => {
		const recommendations = {
			strategy: 'category_affinity',
			categories: ['Libros'],
			items: [{ id: 3, name: 'Libro recomendado' }],
		}
		api.get.mockResolvedValue({ data: { data: recommendations } })

		await expect(fetchRecommendationsRequest()).resolves.toEqual(recommendations)
		expect(api.get).toHaveBeenCalledWith('/products/recommendations')
	})

	it('normaliza una respuesta sin recomendaciones', async () => {
		api.get.mockResolvedValue({ data: { data: null } })

		await expect(fetchRecommendationsRequest()).resolves.toEqual({
			strategy: 'featured',
			categories: [],
			items: [],
		})
	})
})
