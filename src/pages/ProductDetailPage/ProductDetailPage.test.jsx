import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { addCartItemRequest } from '../../api/cart'
import { useProduct } from '../../hooks/useProduct'
import { useReviews } from '../../hooks/useReviews'
import cartReducer from '../../store/slices/cartSlice'
import ProductDetailPage from './ProductDetailPage'

vi.mock('../../api/cart', () => ({
	addCartItemRequest: vi.fn(),
	fetchCartRequest: vi.fn(),
	removeCartItemRequest: vi.fn(),
	updateCartItemQuantity: vi.fn(),
}))

vi.mock('../../hooks/useProduct', () => ({ useProduct: vi.fn() }))
vi.mock('../../hooks/useReviews', () => ({ useReviews: vi.fn() }))
vi.mock('../../components/ProductImageZoom/ProductImageZoom', () => ({
	default: ({ src, alt }) => <img src={src} alt={alt} />,
}))
vi.mock('../../components/RecentlyViewedProducts/RecentlyViewedProducts', () => ({
	default: () => null,
}))
vi.mock('../../components/ReviewForm/ReviewForm', () => ({ default: () => null }))
vi.mock('../../components/ReviewList/ReviewList', () => ({ default: () => null }))
vi.mock('../../components/WishlistButton/WishlistButton', () => ({
	default: () => <button type="button">Añadir a favoritos</button>,
}))

const product = {
	id: 7,
	name: 'Figura de prueba',
	category: 'Colección',
	description: 'Descripción de prueba',
	price: 24.99,
	stock: 3,
	imageUrl: '/figure.jpg',
}

function renderPage() {
	const store = configureStore({
		reducer: {
			auth: () => ({
				user: { id: 1, email: 'sara@test.com' },
				sessionChecked: true,
			}),
			cart: cartReducer,
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[{
				pathname: '/products/7',
				state: { catalogSearch: '?search=figura&sort=price-desc' },
			}]}>
				<Routes>
					<Route path="/products/:productId" element={<ProductDetailPage />} />
				</Routes>
			</MemoryRouter>
		</Provider>,
	)
}

describe('ProductDetailPage', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		useProduct.mockReturnValue({ data: product, loading: false, error: '' })
		useReviews.mockReturnValue({ data: [], loading: false, error: '' })
		addCartItemRequest.mockResolvedValue({})
	})

	it('envía al carrito la cantidad seleccionada sin superar el stock', async () => {
		const user = userEvent.setup()
		renderPage()
		const increaseButton = screen.getByRole('button', { name: 'Aumentar cantidad' })
		expect(screen.getByText('Últimas 3 unidades')).toBeInTheDocument()
		expect(screen.getByText('¡Últimas 3!')).toBeInTheDocument()

		await user.click(increaseButton)
		await user.click(increaseButton)

		expect(increaseButton).toBeDisabled()
		await user.click(screen.getByRole('button', { name: 'Añadir 3 al carrito' }))

		await waitFor(() => {
			expect(addCartItemRequest).toHaveBeenCalledWith({ productId: 7, quantity: 3 })
		})
	})

	it('muestra una ruta navegable y conserva los filtros del catálogo', () => {
		renderPage()
		const breadcrumbs = screen.getByRole('navigation', { name: 'Migas de pan' })

		expect(within(breadcrumbs).getByRole('link', { name: 'Catálogo' }))
			.toHaveAttribute('href', '/products?search=figura&sort=price-desc')
		expect(within(breadcrumbs).getByRole('link', { name: 'Colección' }))
			.toHaveAttribute('href', '/products?sort=price-desc&category=Colecci%C3%B3n')
		expect(within(breadcrumbs).getByText('Figura de prueba')).toHaveAttribute('aria-current', 'page')
	})
})
