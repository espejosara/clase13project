import { configureStore } from '@reduxjs/toolkit'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import MobileBottomNav from './MobileBottomNav'

function createColorSchemeQuery() {
	return {
		matches: false,
		media: '(prefers-color-scheme: dark)',
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
	}
}

function renderBottomNav({ authenticated = true, route = '/products' } = {}) {
	const store = configureStore({
		reducer: {
			auth: () => ({
				user: authenticated ? { id: 1, name: 'Ada', role: 'USER' } : null,
			}),
			cart: () => ({ items: [{ productId: 2, quantity: 2 }] }),
			wishlist: () => ({ ids: [3] }),
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[route]}>
				<MobileBottomNav />
			</MemoryRouter>
		</Provider>,
	)
}

beforeEach(() => {
	window.localStorage.clear()
	vi.stubGlobal('matchMedia', vi.fn(() => createColorSchemeQuery()))
})

afterEach(() => {
	window.localStorage.clear()
	vi.unstubAllGlobals()
})

describe('MobileBottomNav', () => {
	it('ofrece los cinco accesos y muestra los contadores', () => {
		renderBottomNav()

		expect(screen.getByRole('navigation', { name: 'Navegación móvil' })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/')
		expect(screen.getByRole('link', { name: 'Catálogo' })).toHaveAttribute('href', '/products')
		expect(screen.getByRole('link', { name: 'Favoritos, 1 productos guardados' })).toHaveAttribute('href', '/wishlist')
		expect(screen.getByRole('link', { name: 'Carrito, 2 unidades' })).toHaveAttribute('href', '/cart')
		expect(screen.getByRole('button', { name: 'Cuenta' })).toBeInTheDocument()
	})

	it('abre las opciones de la cuenta iniciada', async () => {
		const user = userEvent.setup()
		renderBottomNav()

		await user.click(screen.getByRole('button', { name: 'Cuenta' }))
		const accountMenu = screen.getByRole('group', { name: 'Opciones de cuenta' })

		expect(within(accountMenu).getByRole('link', { name: 'Mi cuenta' })).toHaveAttribute('href', '/profile')
		expect(within(accountMenu).getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
	})

	it('ofrece entrar o crear una cuenta cuando no hay sesión', async () => {
		const user = userEvent.setup()
		renderBottomNav({ authenticated: false })

		await user.click(screen.getByRole('button', { name: 'Cuenta' }))
		const accountMenu = screen.getByRole('group', { name: 'Opciones de cuenta' })

		expect(within(accountMenu).getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
		expect(within(accountMenu).getByRole('link', { name: 'Crear cuenta' })).toHaveAttribute('href', '/register')
	})
})
