import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Header from './Header'

vi.mock('../../store/slices/cartSlice', () => ({
	fetchCartThunk: () => ({ type: 'cart/fetch' }),
	clearCart: () => ({ type: 'cart/clear' }),
}))

vi.mock('../../store/slices/authSlice', () => ({
	logoutThunk: () => ({ type: 'auth/logout' }),
	selectIsAdmin: (state) => String(state.auth.user?.role || '').toUpperCase() === 'ADMIN',
}))

vi.mock('../../store/slices/wishlistSlice', () => ({
	clearWishlist: () => ({ type: 'wishlist/clear' }),
	setLocalWishlist: (payload) => ({ type: 'wishlist/setLocal', payload }),
}))

vi.mock('../../api/wishlist', () => ({
	fetchWishlistRequest: vi.fn(() => Promise.resolve([])),
}))

function renderHeader({ authenticated = false, route = '/products' } = {}) {
	const store = configureStore({
		reducer: {
			auth: () => ({
				user: authenticated
					? { id: 1, name: 'Ana', role: 'USER' }
					: null,
			}),
			cart: () => ({ items: [] }),
			wishlist: () => ({ ids: [] }),
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[route]}>
				<Header />
				<button type="button">Contenido exterior</button>
			</MemoryRouter>
		</Provider>,
	)
}

describe('Header', () => {
	it('permite abrir el menú móvil con teclado y cerrarlo con Escape devolviendo el foco', async () => {
		const user = userEvent.setup()
		renderHeader()
		const menuButton = screen.getByRole('button', { name: 'Abrir menú de navegación' })

		menuButton.focus()
		await user.keyboard('{Enter}')

		expect(menuButton).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()

		await user.keyboard('{Escape}')

		expect(menuButton).toHaveAttribute('aria-expanded', 'false')
		expect(menuButton).toHaveFocus()
	})

	it('cierra el menú al elegir la ruta actual o al pulsar fuera', async () => {
		const user = userEvent.setup()
		renderHeader()
		const menuButton = screen.getByRole('button', { name: 'Abrir menú de navegación' })

		await user.click(menuButton)
		await user.click(screen.getByRole('link', { name: 'Catálogo' }))
		expect(menuButton).toHaveAttribute('aria-expanded', 'false')

		await user.click(menuButton)
		await user.click(screen.getByRole('button', { name: 'Contenido exterior' }))
		expect(menuButton).toHaveAttribute('aria-expanded', 'false')
	})

	it('cierra primero el menú de usuario con Escape y devuelve el foco a su botón', async () => {
		const user = userEvent.setup()
		renderHeader({ authenticated: true })
		const menuButton = screen.getByRole('button', { name: 'Abrir menú de navegación' })

		await user.click(menuButton)
		const profileButton = screen.getByRole('button', { name: 'Abrir menú de usuario' })
		await user.click(profileButton)

		expect(profileButton).toHaveAttribute('aria-expanded', 'true')
		expect(screen.getByRole('group', { name: 'Menú de usuario' })).toBeInTheDocument()

		await user.keyboard('{Escape}')

		expect(profileButton).toHaveAttribute('aria-expanded', 'false')
		expect(profileButton).toHaveFocus()
		expect(menuButton).toHaveAttribute('aria-expanded', 'true')

		await user.keyboard('{Escape}')

		expect(menuButton).toHaveAttribute('aria-expanded', 'false')
		expect(menuButton).toHaveFocus()
	})
})
