import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ProductListSkeleton from './ProductListSkeleton'

describe('ProductListSkeleton', () => {
	it('anuncia la carga sin exponer los elementos decorativos', () => {
		const { container } = render(
			<ProductListSkeleton count={3} label="Cargando el catálogo..." />,
		)

		expect(screen.getByRole('status')).toHaveTextContent('Cargando el catálogo...')
		expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3)
	})
})
