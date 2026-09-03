import { configureStore } from '@reduxjs/toolkit'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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

function createColorSchemeQuery(matches = false) {
	return {
		matches,
		media: '(prefers-color-scheme: dark)',
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	}
}

beforeEach(() => {
	window.localStorage.clear()
	delete document.documentElement.dataset.theme
	document.documentElement.style.colorScheme = ''
	vi.stubGlobal('matchMedia', vi.fn(() => createColorSchemeQuery()))
})

afterEach(() => {
	window.localStorage.clear()
	delete document.documentElement.dataset.theme
	document.documentElement.style.colorScheme = ''
	vi.unstubAllGlobals()
})

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
		const profileMenu = screen.getByRole('group', { name: 'Menú de usuario' })

		expect(profileButton).toHaveAttribute('aria-expanded', 'true')
		expect(within(profileMenu).getByRole('button', { name: 'Cambiar a modo oscuro' })).toBeInTheDocument()

		await user.keyboard('{Escape}')

		expect(profileButton).toHaveAttribute('aria-expanded', 'false')
		expect(profileButton).toHaveFocus()
		expect(menuButton).toHaveAttribute('aria-expanded', 'true')

		await user.keyboard('{Escape}')

		expect(menuButton).toHaveAttribute('aria-expanded', 'false')
		expect(menuButton).toHaveFocus()
	})

	it('mantiene el cambio de aspecto dentro del menú de perfil cuando hay sesión', async () => {
		const user = userEvent.setup()
		renderHeader({ authenticated: true })

		expect(screen.queryByRole('button', { name: 'Cambiar a modo oscuro' })).not.toBeInTheDocument()
		await user.click(screen.getByRole('button', { name: 'Abrir menú de usuario' }))

		const profileMenu = screen.getByRole('group', { name: 'Menú de usuario' })
		const themeButton = within(profileMenu).getByRole('button', { name: 'Cambiar a modo oscuro' })
		await user.click(themeButton)

		expect(profileMenu).toBeInTheDocument()
		expect(themeButton).toHaveAccessibleName('Cambiar a modo claro')
		expect(screen.getByRole('status')).toHaveTextContent('Modo oscuro activado')
	})

	it('respeta el tema del sistema y guarda la elección de la persona usuaria', async () => {
		const user = userEvent.setup()
		window.matchMedia.mockReturnValue(createColorSchemeQuery(true))
		const { unmount } = renderHeader()
		const themeButton = screen.getByRole('button', { name: 'Cambiar a modo claro' })

		expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
		expect(window.localStorage.getItem('neokensei-theme')).toBeNull()

		await user.click(themeButton)

		expect(document.documentElement).toHaveAttribute('data-theme', 'light')
		expect(window.localStorage.getItem('neokensei-theme')).toBe('light')
		expect(themeButton).toHaveAccessibleName('Cambiar a modo oscuro')

		unmount()
		delete document.documentElement.dataset.theme
		renderHeader()

		expect(screen.getByRole('button', { name: 'Cambiar a modo oscuro' })).toBeInTheDocument()
		expect(document.documentElement).toHaveAttribute('data-theme', 'light')
	})
})
