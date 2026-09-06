import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toggleWishlistRequest } from '../../api/wishlist'
import notificationReducer from '../../store/slices/notificationSlice'
import wishlistReducer from '../../store/slices/wishlistSlice'
import WishlistButton from './WishlistButton'

vi.mock('../../api/wishlist', () => ({
	toggleWishlistRequest: vi.fn(),
}))

function renderWishlistButton({ authenticated = true } = {}) {
	const store = configureStore({
		reducer: {
			auth: () => ({ user: authenticated ? { id: 1, name: 'Ada' } : null }),
			notification: notificationReducer,
			wishlist: wishlistReducer,
		},
	})

	render(
		<Provider store={store}>
			<MemoryRouter initialEntries={['/products/7']}>
				<Routes>
					<Route path="/products/:productId" element={<WishlistButton productId={7} />} />
					<Route path="/login" element={<h1>Iniciar sesión</h1>} />
				</Routes>
			</MemoryRouter>
		</Provider>,
	)

	return store
}

describe('WishlistButton', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		toggleWishlistRequest.mockResolvedValue(undefined)
	})

	it('notifica al añadir a favoritos, pero no al quitar', async () => {
		const user = userEvent.setup()
		const store = renderWishlistButton()

		await user.click(screen.getByRole('button', { name: 'Añadir a favoritos' }))

		await waitFor(() => {
			expect(store.getState().notification).toEqual({
				id: 1,
				message: 'Producto añadido a favoritos',
			})
		})

		await user.click(screen.getByRole('button', { name: 'Quitar de favoritos' }))

		await waitFor(() => {
			expect(screen.getByRole('button', { name: 'Añadir a favoritos' })).toBeInTheDocument()
		})
		expect(store.getState().notification.id).toBe(1)
	})

	it('envía al login sin llamar al backend cuando no hay sesión', async () => {
		const user = userEvent.setup()
		renderWishlistButton({ authenticated: false })

		await user.click(screen.getByRole('button', { name: 'Añadir a favoritos' }))

		expect(screen.getByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
		expect(toggleWishlistRequest).not.toHaveBeenCalled()
	})
})
