import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import Breadcrumbs from './Breadcrumbs'

describe('Breadcrumbs', () => {
	it('crea enlaces para los niveles anteriores y marca la página actual', () => {
		render(
			<MemoryRouter>
				<Breadcrumbs items={[
					{ label: 'Inicio', to: '/' },
					{ label: 'Catálogo', to: '/products' },
					{ label: 'Dragon Ball', to: '/products?category=Dragon+Ball' },
					{ label: 'Vegeta' },
				]} />
			</MemoryRouter>,
		)

		const navigation = screen.getByRole('navigation', { name: 'Migas de pan' })
		expect(within(navigation).getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
		expect(within(navigation).getByRole('link', { name: 'Dragon Ball' }))
			.toHaveAttribute('href', '/products?category=Dragon+Ball')
		expect(within(navigation).getByText('Vegeta')).toHaveAttribute('aria-current', 'page')
	})
})
