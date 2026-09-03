import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ProfilePage from './ProfilePage'

vi.mock('../../api/recommendations', () => ({
	fetchRecommendationsRequest: vi.fn(() => Promise.resolve({
		strategy: 'category_affinity',
		categories: ['Figuras'],
		items: [{
			id: 9,
			name: 'Figura recomendada',
			category: 'Figuras',
			price: 24.99,
			imageUrl: 'https://example.com/figura.jpg',
		}],
	})),
}))

vi.mock('../../store/slices/authSlice', () => ({
	fetchCurrentUserThunk: () => ({ type: 'auth/fetchCurrentUser' }),
}))

vi.mock('../../store/slices/ordersSlice', () => ({
	fetchOrdersThunk: () => ({ type: 'orders/fetchOrders' }),
}))

const profileState = {
	auth: {
		user: {
			id: 3,
			name: 'Ana Pérez',
			email: 'ana@example.com',
			role: 'USER',
			createdAt: '2025-03-01T10:00:00.000Z',
			wishlistCount: 2,
			checkoutOrdersCount: 1,
		},
	},
	orders: {
		items: [{
			id: 55,
			status: 'Pagado',
			total: 42,
			createdAt: '2026-09-02T12:00:00.000Z',
			items: [{
				productId: 7,
				name: 'Figura de prueba',
				quantity: 2,
				unitPrice: 21,
			}],
		}],
		loading: false,
		error: null,
	},
	wishlist: {
		ids: [7, 8],
	},
}

function renderProfile() {
	const store = configureStore({
		reducer: {
			auth: () => profileState.auth,
			orders: () => profileState.orders,
			wishlist: () => profileState.wishlist,
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter>
				<ProfilePage />
			</MemoryRouter>
		</Provider>,
	)
}

describe('ProfilePage', () => {
	it('separa el catálogo, las recomendaciones y los favoritos sin duplicar contenidos', async () => {
		const user = userEvent.setup()
		renderProfile()

		expect(screen.getByRole('heading', { name: 'Hola, Ana' })).toBeInTheDocument()
		expect(screen.getByText('2 productos guardados')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: /explorar catálogo/i })).toHaveAttribute('href', '/products')
		expect(screen.getByRole('link', { name: /mis favoritos/i })).toHaveAttribute('href', '/wishlist')
		const ordersSection = screen.getByRole('button', { name: /historial de pedidos/i }).closest('section')
		const recommendationsSection = screen
			.getByRole('heading', { name: 'Productos recomendados' })
			.closest('section')
		expect(ordersSection.nextElementSibling).toBe(recommendationsSection)
		expect(await screen.findByRole('link', { name: /figura recomendada/i })).toHaveAttribute('href', '/products/9')
		expect(screen.getByText(/basadas en tu interés por figuras/i)).toBeInTheDocument()
		expect(screen.queryByText('Pedido #55')).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: /cerrar sesión/i })).not.toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: /historial de pedidos/i }))

		expect(screen.getByText('Pedido #55')).toBeInTheDocument()
		expect(screen.getByText('2 artículos')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: /historial de pedidos/i })).toHaveAttribute('aria-expanded', 'true')
	})
})
