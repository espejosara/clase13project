import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getProducts } from '../../api/products'
import ProductsPage from './ProductsPage'

vi.mock('../../api/products', () => ({
	getProducts: vi.fn(),
}))

vi.mock('../../components/ProductGrid/ProductGrid', () => ({
	default: ({ products }) => (
		<ul aria-label="Productos filtrados">
			{products.map((product) => <li key={product.id}>{product.name}</li>)}
		</ul>
	),
}))

const products = [
	{ id: 1, name: 'Goku', category: 'Dragon Ball', description: 'Saiyan', price: 30 },
	{ id: 2, name: 'Naruto', category: 'Naruto', description: 'Ninja', price: 20 },
	{ id: 3, name: 'Vegeta', category: 'Dragon Ball', description: 'Príncipe', price: 40 },
]

function LocationProbe() {
	const location = useLocation()
	return <output data-testid="location-search">{location.search}</output>
}

function renderPage(initialEntry = '/products') {
	return render(
		<MemoryRouter initialEntries={[initialEntry]}>
			<ProductsPage />
			<LocationProbe />
		</MemoryRouter>,
	)
}

describe('ProductsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		getProducts.mockResolvedValue(products)
	})

	it('filtra el catálogo por categoría y permite limpiar los filtros', async () => {
		const user = userEvent.setup()
		renderPage()
		const grid = await screen.findByRole('list', { name: 'Productos filtrados' })

		await user.selectOptions(screen.getByLabelText('Categoría'), 'Dragon Ball')

		expect(within(grid).getByText('Goku')).toBeInTheDocument()
		expect(within(grid).getByText('Vegeta')).toBeInTheDocument()
		expect(within(grid).queryByText('Naruto')).not.toBeInTheDocument()
		expect(screen.getByText(/2 productos/).closest('p')).toHaveTextContent('2 productos en Dragon Ball')
		expect(new URLSearchParams(screen.getByTestId('location-search').textContent).get('category')).toBe('Dragon Ball')

		await user.click(screen.getByRole('button', { name: 'Limpiar filtros' }))

		expect(screen.getByLabelText('Categoría')).toHaveValue('')
		expect(within(grid).getByText('Naruto')).toBeInTheDocument()
		expect(screen.getByTestId('location-search')).toHaveTextContent('')
	})

	it('combina la categoría con la búsqueda', async () => {
		const user = userEvent.setup()
		renderPage()
		await screen.findByRole('list', { name: 'Productos filtrados' })

		await user.selectOptions(screen.getByLabelText('Categoría'), 'Dragon Ball')
		await user.type(screen.getByLabelText('Buscar en el catálogo'), 'vegeta')

		expect(screen.getByText(/1 producto/).closest('p')).toHaveTextContent('1 producto para “vegeta” en Dragon Ball')
		expect(screen.getByText('Vegeta')).toBeInTheDocument()
		expect(screen.queryByText('Goku')).not.toBeInTheDocument()
	})

	it('recupera búsqueda, categoría y ordenación desde la URL', async () => {
		renderPage('/products?search=goku&category=Dragon+Ball&sort=price-desc')
		await screen.findByRole('list', { name: 'Productos filtrados' })

		expect(screen.getByLabelText('Buscar en el catálogo')).toHaveValue('goku')
		expect(screen.getByLabelText('Categoría')).toHaveValue('Dragon Ball')
		expect(screen.getByLabelText('Ordenar por')).toHaveValue('price-desc')
		expect(screen.getByText('Goku')).toBeInTheDocument()
		expect(screen.queryByText('Vegeta')).not.toBeInTheDocument()
	})
})
