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
})
