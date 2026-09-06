import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import FeaturedProductsRail from './FeaturedProductsRail'

vi.mock('../ProductCard/ProductCard', () => ({
	default: ({ product }) => <article>{product.name}</article>,
}))

const products = [
	{ id: 1, name: 'Samurái cibernético' },
	{ id: 2, name: 'Hechicera carmesí' },
	{ id: 3, name: 'Valkiria celestial' },
]

function createMotionQuery(matches = false) {
	return {
		matches,
		media: '(prefers-reduced-motion: reduce)',
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	}
}

beforeEach(() => {
	vi.stubGlobal('matchMedia', vi.fn(() => createMotionQuery()))
	vi.stubGlobal('requestAnimationFrame', vi.fn(() => 1))
	vi.stubGlobal('cancelAnimationFrame', vi.fn())
})

afterEach(() => {
	vi.unstubAllGlobals()
})

describe('FeaturedProductsRail', () => {
	it('muestra todos los productos sin controles de flechas', () => {
		render(<FeaturedProductsRail products={products} />)

		expect(screen.getByText('Samurái cibernético')).toBeInTheDocument()
		expect(screen.getByText('Hechicera carmesí')).toBeInTheDocument()
		expect(screen.getByText('Valkiria celestial')).toBeInTheDocument()
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
	})

	it('desactiva el movimiento automático cuando se prefiere reducir animaciones', () => {
		window.matchMedia.mockReturnValue(createMotionQuery(true))

		render(<FeaturedProductsRail products={products} />)

		expect(window.requestAnimationFrame).not.toHaveBeenCalled()
	})
})
