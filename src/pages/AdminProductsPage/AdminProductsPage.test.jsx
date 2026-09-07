import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { deleteProduct, getProducts } from '../../api/products'
import AdminProductsPage from './AdminProductsPage'

vi.mock('../../api/products', () => ({
	deleteProduct: vi.fn(),
	getProducts: vi.fn(),
}))

const product = {
	id: 7,
	name: 'Figura de prueba',
	category: 'acción',
	price: 24.99,
	stock: 3,
	isFeatured: true,
	imageUrl: 'https://example.com/figura.jpg',
}

describe('AdminProductsPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		getProducts.mockResolvedValue([product])
		deleteProduct.mockResolvedValue({ message: 'Producto eliminado' })
		vi.spyOn(window, 'confirm').mockReturnValue(true)
	})

	it('lista productos y permite eliminarlos después de confirmar', async () => {
		const user = userEvent.setup()

		render(
			<MemoryRouter>
				<AdminProductsPage />
			</MemoryRouter>,
		)

		expect(await screen.findByText('Figura de prueba')).toBeInTheDocument()
		expect(screen.getByText('Sí')).toBeInTheDocument()
		const tableRegion = screen.getByRole('region', { name: /listado de productos/i })
		expect(tableRegion).toHaveAttribute('tabindex', '0')
		tableRegion.focus()
		expect(tableRegion).toHaveFocus()

		await user.click(screen.getByRole('button', { name: 'Eliminar' }))

		expect(window.confirm).toHaveBeenCalled()
		expect(deleteProduct).toHaveBeenCalledWith(7)
		await waitFor(() => {
			expect(screen.queryByText('Figura de prueba')).not.toBeInTheDocument()
		})
	})

	it('resume el inventario y permite filtrar productos con stock bajo o agotado', async () => {
		const user = userEvent.setup()
		getProducts.mockResolvedValue([
			{ ...product, id: 1, name: 'Figura disponible', stock: 8 },
			{ ...product, id: 2, name: 'Figura limitada', stock: 2 },
			{ ...product, id: 3, name: 'Figura agotada', stock: 0 },
		])

		render(
			<MemoryRouter>
				<AdminProductsPage />
			</MemoryRouter>,
		)

		expect(await screen.findByRole('button', { name: 'Productos con stock bajo: 1' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Productos agotados: 1' })).toBeInTheDocument()
		expect(screen.getByText('Últimas 2')).toBeInTheDocument()
		expect(screen.getByText('Agotado')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Productos con stock bajo: 1' }))
		expect(screen.getByText('Figura limitada')).toBeInTheDocument()
		expect(screen.queryByText('Figura disponible')).not.toBeInTheDocument()
		expect(screen.queryByText('Figura agotada')).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Productos agotados: 1' }))
		expect(screen.getByText('Figura agotada')).toBeInTheDocument()
		expect(screen.queryByText('Figura limitada')).not.toBeInTheDocument()
	})

	it('busca por nombre o categoría y permite combinar la búsqueda con el stock', async () => {
		const user = userEvent.setup()
		getProducts.mockResolvedValue([
			{ ...product, id: 1, name: 'Héroe clásico', category: 'Acción', stock: 8 },
			{ ...product, id: 2, name: 'Ninja limitado', category: 'Colección', stock: 2 },
			{ ...product, id: 3, name: 'Ninja agotado', category: 'Colección', stock: 0 },
		])

		render(
			<MemoryRouter>
				<AdminProductsPage />
			</MemoryRouter>,
		)

		const searchInput = await screen.findByRole('searchbox', {
			name: 'Buscar productos por nombre o categoría',
		})
		await user.type(searchInput, 'coleccion')

		expect(screen.getByText('2 de 3 productos')).toBeInTheDocument()
		expect(screen.getByText('Ninja limitado')).toBeInTheDocument()
		expect(screen.getByText('Ninja agotado')).toBeInTheDocument()
		expect(screen.queryByText('Héroe clásico')).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Productos agotados: 1' }))
		expect(screen.getByText('1 de 3 productos')).toBeInTheDocument()
		expect(screen.getByText('Ninja agotado')).toBeInTheDocument()
		expect(screen.queryByText('Ninja limitado')).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }))
		expect(searchInput).toHaveValue('')
		expect(screen.getByText('Ninja agotado')).toBeInTheDocument()
		expect(screen.queryByText('Héroe clásico')).not.toBeInTheDocument()
	})
})
