import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getRecentlyViewedStorageKey } from '../../utils/recentlyViewedProducts'
import RecentlyViewedProducts from './RecentlyViewedProducts'

const currentProduct = {
	id: 3,
	name: 'Vegeta',
	category: 'Dragon Ball',
	imageUrl: '/vegeta.jpg',
	price: 40,
	stock: 2,
}
const userKey = 14
const storageKey = getRecentlyViewedStorageKey(userKey)

function renderComponent() {
	return render(
		<MemoryRouter>
			<RecentlyViewedProducts
				currentProduct={currentProduct}
				userKey={userKey}
				catalogSearch="?category=Dragon+Ball"
			/>
		</MemoryRouter>,
	)
}

describe('RecentlyViewedProducts', () => {
	beforeEach(() => {
		localStorage.clear()
	})
	afterEach(() => {
		localStorage.clear()
	})

	it('muestra productos anteriores, excluye el actual y conserva el filtro del catálogo', async () => {
		localStorage.setItem(storageKey, JSON.stringify([
			currentProduct,
			{ id: 2, name: 'Naruto', category: 'Naruto', imageUrl: '/naruto.jpg', price: 20, stock: 0 },
		]))

		renderComponent()

		expect(screen.getByRole('heading', { name: 'Vistos recientemente' })).toBeInTheDocument()
		expect(screen.queryByText('Vegeta')).not.toBeInTheDocument()
		expect(screen.getByRole('link', { name: /Naruto/ })).toBeInTheDocument()
		expect(screen.getByText('Agotado')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Ver catálogo' })).toHaveAttribute(
			'href',
			'/products?category=Dragon+Ball',
		)

		await waitFor(() => {
			const storedProducts = JSON.parse(localStorage.getItem(storageKey))
			expect(storedProducts[0].id).toBe(3)
			expect(storedProducts.filter((product) => product.id === 3)).toHaveLength(1)
		})
	})

	it('guarda la primera visita sin mostrar una sección vacía', async () => {
		renderComponent()

		expect(screen.queryByRole('heading', { name: 'Vistos recientemente' })).not.toBeInTheDocument()
		await waitFor(() => {
			const storedProducts = JSON.parse(localStorage.getItem(storageKey))
			expect(storedProducts).toHaveLength(1)
			expect(storedProducts[0].name).toBe('Vegeta')
		})
	})

	it('no guarda el producto cuando no hay un usuario autenticado', () => {
		render(
			<MemoryRouter>
				<RecentlyViewedProducts currentProduct={currentProduct} />
			</MemoryRouter>,
		)

		expect(screen.queryByRole('heading', { name: 'Vistos recientemente' })).not.toBeInTheDocument()
		expect(localStorage).toHaveLength(0)
	})
})
