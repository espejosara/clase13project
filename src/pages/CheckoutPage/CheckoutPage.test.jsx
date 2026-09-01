import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import CheckoutPage from './CheckoutPage'

function renderCheckoutPage(route = '/checkout') {
	const cartState = {
		items: [{
			id: 1,
			productId: 10,
			name: 'Figura de prueba',
			price: 25,
			quantity: 1,
		}],
		loading: false,
		isCheckingOut: false,
		error: null,
	}
	const store = configureStore({ reducer: { cart: () => cartState } })

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[route]}>
				<CheckoutPage />
			</MemoryRouter>
		</Provider>,
	)
}

describe('CheckoutPage', () => {
	it('informa de que Stripe canceló el pago sin vaciar el carrito', () => {
		renderCheckoutPage('/checkout?canceled=true')

		expect(screen.getByText('Pago cancelado')).toBeInTheDocument()
		expect(screen.getByText(/no se ha realizado ningún cargo/i)).toBeInTheDocument()
		expect(screen.getByText('Figura de prueba')).toBeInTheDocument()
	})
})
