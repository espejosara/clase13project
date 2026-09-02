import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import CartSummary from './CartSummary'

describe('CartSummary', () => {
	it('incluye el total en la llamada final al pago', () => {
		render(
			<MemoryRouter>
				<CartSummary
					items={[{ price: 12.5, quantity: 2 }]}
					onCheckout={vi.fn()}
					checkoutLabel="Pagar con Stripe"
					showCheckoutTotal
				/>
			</MemoryRouter>,
		)

		expect(screen.getByText('Unidades: 2')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /Pagar con Stripe.*25,00/ }),
		).toBeInTheDocument()
	})
})
