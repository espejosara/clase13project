import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	createProduct,
	getProductById,
	updateProduct,
} from '../../api/products'
import AdminProductFormPage from './AdminProductFormPage'

vi.mock('../../api/products', () => ({
	createProduct: vi.fn(),
	getProductById: vi.fn(),
	updateProduct: vi.fn(),
}))

function renderForm(path) {
	return render(
		<MemoryRouter initialEntries={[path]}>
			<Routes>
				<Route path="/admin/products/new" element={<AdminProductFormPage />} />
				<Route path="/admin/products/:id/edit" element={<AdminProductFormPage />} />
				<Route path="/admin/products" element={<h1>Listado admin</h1>} />
			</Routes>
		</MemoryRouter>,
	)
}

async function completeForm(user) {
	await user.type(screen.getByLabelText('Nombre'), 'Nueva figura')
	await user.type(screen.getByLabelText('Categoría'), 'acción')
	await user.type(screen.getByLabelText('Precio (€)'), '29.95')
	await user.type(screen.getByLabelText('Stock'), '5')
	await user.type(screen.getByLabelText('URL de la imagen'), 'https://example.com/figura.jpg')
	await user.type(screen.getByLabelText('Descripción'), 'Descripción de la figura')
}

describe('AdminProductFormPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('valida los campos antes de crear', async () => {
		const user = userEvent.setup()
		renderForm('/admin/products/new')

		await user.click(screen.getByRole('button', { name: 'Crear producto' }))

		expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument()
		expect(screen.getByText('El precio es obligatorio')).toBeInTheDocument()
		expect(createProduct).not.toHaveBeenCalled()
	})

	it('crea un producto convirtiendo precio y stock a números', async () => {
		const user = userEvent.setup()
		createProduct.mockResolvedValue({ id: 21 })
		renderForm('/admin/products/new')

		await completeForm(user)
		await user.click(screen.getByRole('button', { name: 'Crear producto' }))

		expect(createProduct).toHaveBeenCalledWith({
			name: 'Nueva figura',
			category: 'acción',
			description: 'Descripción de la figura',
			price: 29.95,
			stock: 5,
			imageUrl: 'https://example.com/figura.jpg',
		})
		expect(await screen.findByRole('heading', { name: 'Listado admin' })).toBeInTheDocument()
	})

	it('carga un producto existente y lo actualiza con el mismo formulario', async () => {
		const user = userEvent.setup()
		getProductById.mockResolvedValue({
			id: 7,
			name: 'Figura existente',
			category: 'magia',
			description: 'Descripción existente',
			price: 19.5,
			stock: 2,
			imageUrl: 'https://example.com/existente.jpg',
		})
		updateProduct.mockResolvedValue({ id: 7 })
		renderForm('/admin/products/7/edit')

		const nameInput = await screen.findByDisplayValue('Figura existente')
		await user.clear(nameInput)
		await user.type(nameInput, 'Figura actualizada')
		await user.click(screen.getByRole('button', { name: 'Actualizar producto' }))

		expect(updateProduct).toHaveBeenCalledWith('7', {
			name: 'Figura actualizada',
			category: 'magia',
			description: 'Descripción existente',
			price: 19.5,
			stock: 2,
			imageUrl: 'https://example.com/existente.jpg',
		})
		expect(await screen.findByRole('heading', { name: 'Listado admin' })).toBeInTheDocument()
	})
})
