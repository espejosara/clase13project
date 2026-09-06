import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import FloatingCartButton from './FloatingCartButton'

function renderFloatingCart({ authenticated = true, route = '/products', items = [] } = {}) {
	const store = configureStore({
		reducer: {
			auth: () => ({ user: authenticated ? { id: 1, name: 'Ada' } : null }),
			cart: () => ({ items }),
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[route]}>
				<FloatingCartButton />
			</MemoryRouter>
		</Provider>,
	)
}

describe('FloatingCartButton', () => {
	it('prepara el total y el enlace del acceso flotante para móvil', () => {
		renderFloatingCart({
			items: [{ productId: 2, quantity: 2 }, { productId: 5, quantity: 1 }],
		})

		const cartLink = screen.getByRole('link', { name: 'Abrir carrito, 3 unidades' })

		expect(cartLink).toHaveAttribute('href', '/cart')
		expect(cartLink).toHaveTextContent('3')
	})

	it('no aparece sin sesión ni dentro de la página del carrito', () => {
		const { unmount } = renderFloatingCart({ authenticated: false })

		expect(screen.queryByRole('link', { name: /abrir carrito/i })).not.toBeInTheDocument()

		unmount()
		renderFloatingCart({ route: '/cart' })

		expect(screen.queryByRole('link', { name: /abrir carrito/i })).not.toBeInTheDocument()
	})
})
