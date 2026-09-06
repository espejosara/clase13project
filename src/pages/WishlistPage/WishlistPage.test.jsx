import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchWishlistRequest, toggleWishlistRequest } from '../../api/wishlist'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import wishlistReducer from '../../store/slices/wishlistSlice'
import WishlistPage from './WishlistPage'

vi.mock('../../api/wishlist', () => ({
	fetchWishlistRequest: vi.fn(),
	toggleWishlistRequest: vi.fn(),
}))

vi.mock('../../hooks/useProducts', () => ({
	useProducts: () => ({
		data: [{
			id: 7,
			name: 'Figura favorita',
			category: 'Figuras',
			description: 'Producto guardado para la prueba.',
			price: 24.99,
			stock: 3,
			imageUrl: 'https://example.com/figura.jpg',
		}],
		loading: false,
		error: null,
		refetch: vi.fn(),
	}),
}))

vi.mock('../../store/slices/cartSlice', () => ({
	addCartItemThunk: vi.fn(() => () => ({
		unwrap: () => Promise.resolve(),
	})),
}))

function renderWishlist() {
	const store = configureStore({
		reducer: {
			wishlist: wishlistReducer,
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter>
				<WishlistPage />
			</MemoryRouter>
		</Provider>,
	)
}

describe('WishlistPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		fetchWishlistRequest.mockResolvedValue([7])
		toggleWishlistRequest.mockResolvedValue([])
	})

	it('añade al carrito sin eliminar el favorito y permite quitarlo con el corazón', async () => {
		const user = userEvent.setup()
		renderWishlist()

		expect(await screen.findByRole('heading', { name: 'Figura favorita' })).toBeInTheDocument()
		expect(screen.getByText(/24,99/)).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: 'Añadir al carrito' }))

		expect(screen.getByRole('heading', { name: 'Figura favorita' })).toBeInTheDocument()
		expect(addCartItemThunk).toHaveBeenCalledWith({ productId: 7, quantity: 1 })
		expect(toggleWishlistRequest).not.toHaveBeenCalled()

		await user.click(screen.getByRole('button', { name: 'Quitar Figura favorita de favoritos' }))

		await waitFor(() => {
			expect(screen.queryByRole('heading', { name: 'Figura favorita' })).not.toBeInTheDocument()
		})
		expect(toggleWishlistRequest).toHaveBeenCalledWith(7)
	})
})
