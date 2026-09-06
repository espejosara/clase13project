import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useProducts } from '../../hooks/useProducts'
import HomePage from './HomePage'

vi.mock('../../hooks/useProducts', () => ({
	useProducts: vi.fn(),
}))

vi.mock('../../components/FeaturedProductsRail/FeaturedProductsRail', () => ({
	default: ({ products }) => (
		<div data-testid="featured-products">
			{products.map((product) => <span key={product.id}>{product.name}</span>)}
		</div>
	),
}))

describe('HomePage', () => {
	beforeEach(() => {
		useProducts.mockReturnValue({
			data: [
				{ id: 1, name: 'Producto normal', isFeatured: false },
				{ id: 2, name: 'Producto destacado', isFeatured: true },
				{ id: 3, name: 'Otro destacado', isFeatured: true },
			],
			loading: false,
			error: null,
			refetch: vi.fn(),
		})
	})

	it('envía a la cinta únicamente los productos marcados como destacados', () => {
		render(
			<MemoryRouter>
				<HomePage />
			</MemoryRouter>,
		)

		const featuredProducts = screen.getByTestId('featured-products')

		expect(featuredProducts).toHaveTextContent('Producto destacado')
		expect(featuredProducts).toHaveTextContent('Otro destacado')
		expect(featuredProducts).not.toHaveTextContent('Producto normal')
	})
})
