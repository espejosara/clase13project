import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
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

function renderProductCard() {
	const store = configureStore({
		reducer: {
			auth: () => ({ user: null }),
			wishlist: () => ({ ids: [] }),
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={['/products']}>
				<Routes>
					<Route path="/products" element={<ProductCard product={product} />} />
					<Route path="/login" element={<h1>Iniciar sesión</h1>} />
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

		expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
	})
})
