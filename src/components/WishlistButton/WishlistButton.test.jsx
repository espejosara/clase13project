import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { toggleWishlistRequest } from '../../api/wishlist'
import notificationReducer from '../../store/slices/notificationSlice'
import wishlistReducer from '../../store/slices/wishlistSlice'
import WishlistButton from './WishlistButton'

vi.mock('../../api/wishlist', () => ({
	toggleWishlistRequest: vi.fn(),
}))

function renderWishlistButton() {
	const store = configureStore({
		reducer: {
			notification: notificationReducer,
			wishlist: wishlistReducer,
		},
	})

	render(
		<Provider store={store}>
			<WishlistButton productId={7} />
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
})
