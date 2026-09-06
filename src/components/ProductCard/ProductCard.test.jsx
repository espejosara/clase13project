import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import ProductCard from './ProductCard'

const product = {
	id: 7,
	name: 'Figura de prueba',
	category: 'Colección',
	description: 'Descripción de prueba',
	price: 24.99,
	stock: 3,
	imageUrl: 'https://example.com/figura.jpg',
}

function LoginDestination() {
	const location = useLocation()
	return <h1>Iniciar sesión para {location.state?.authIntent}</h1>
}

function ProductDestination() {
	const location = useLocation()
	return <p>Volver con {location.state?.catalogSearch}</p>
}

function renderProductCard(productData = product, initialEntry = '/products') {
	const store = configureStore({
		reducer: {
			auth: () => ({ user: null }),
			wishlist: () => ({ ids: [] }),
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[initialEntry]}>
				<Routes>
					<Route path="/products" element={<ProductCard product={productData} />} />
					<Route path="/products/:productId" element={<ProductDestination />} />
					<Route path="/login" element={<LoginDestination />} />
				</Routes>
			</MemoryRouter>
		</Provider>,
	)
}

describe('ProductCard', () => {
	it('envía al login al intentar añadir al carrito sin sesión', async () => {
		const user = userEvent.setup()
		renderProductCard()

		await user.click(screen.getByRole('button', { name: 'Añadir al carrito' }))

		expect(screen.getByRole('heading', { name: 'Iniciar sesión para cart' })).toBeInTheDocument()
	})

	it('mantiene una etiqueta clara cuando todavía no hay datos de stock', () => {
		renderProductCard({ ...product, stock: null })

		expect(screen.getByText('Stock por confirmar')).toBeInTheDocument()
	})

	it('conserva los filtros del catálogo al abrir el detalle', async () => {
		const user = userEvent.setup()
		renderProductCard(product, '/products?category=Colecci%C3%B3n&sort=price-asc')

		await user.click(screen.getByRole('link'))

		expect(screen.getByText('Volver con ?category=Colecci%C3%B3n&sort=price-asc')).toBeInTheDocument()
	})
})
