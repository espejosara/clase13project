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
	const image = new File(['imagen'], 'figura.png', { type: 'image/png' })

	await user.type(screen.getByLabelText('Nombre'), 'Nueva figura')
	await user.type(screen.getByLabelText('Categoría'), 'acción')
	await user.type(screen.getByLabelText('Precio (€)'), '29.95')
	await user.type(screen.getByLabelText('Stock'), '5')
	await user.click(screen.getByLabelText('Mostrar en productos destacados'))
	await user.upload(screen.getByLabelText('Imagen'), image)
	await user.type(screen.getByLabelText('Descripción'), 'Descripción de la figura')

	return image
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
		expect(screen.getByText('Selecciona una imagen para el producto')).toBeInTheDocument()
		expect(createProduct).not.toHaveBeenCalled()
	})

	it('crea un producto enviando sus campos y la imagen como FormData', async () => {
		const user = userEvent.setup()
		createProduct.mockResolvedValue({ id: 21 })
		renderForm('/admin/products/new')

		const image = await completeForm(user)
		await user.click(screen.getByRole('button', { name: 'Crear producto' }))

		expect(createProduct).toHaveBeenCalledOnce()
		const payload = createProduct.mock.calls[0][0]
		expect(payload).toBeInstanceOf(FormData)
		expect(Object.fromEntries(payload.entries())).toEqual({
			name: 'Nueva figura',
			category: 'acción',
			description: 'Descripción de la figura',
			price: '29.95',
			stock: '5',
			isFeatured: 'true',
			image,
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
			isFeatured: true,
			imageUrl: 'https://example.com/existente.jpg',
		})
		updateProduct.mockResolvedValue({ id: 7 })
		renderForm('/admin/products/7/edit')

		const nameInput = await screen.findByDisplayValue('Figura existente')
		const featuredInput = screen.getByLabelText('Mostrar en productos destacados')
		expect(featuredInput).toBeChecked()
		await user.clear(nameInput)
		await user.type(nameInput, 'Figura actualizada')
		await user.click(featuredInput)
		await user.click(screen.getByRole('button', { name: 'Actualizar producto' }))

		expect(updateProduct).toHaveBeenCalledOnce()
		const [productId, payload] = updateProduct.mock.calls[0]
		expect(productId).toBe('7')
		expect(payload).toBeInstanceOf(FormData)
		expect(Object.fromEntries(payload.entries())).toEqual({
			name: 'Figura actualizada',
			category: 'magia',
			description: 'Descripción existente',
			price: '19.5',
			stock: '2',
			isFeatured: 'false',
		})
		expect(payload.has('image')).toBe(false)
		expect(await screen.findByRole('heading', { name: 'Listado admin' })).toBeInTheDocument()
	})
})
