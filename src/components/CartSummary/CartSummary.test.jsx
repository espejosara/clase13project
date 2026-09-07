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

		expect(screen.getByText('Artículos')).toBeInTheDocument()
		expect(screen.getByText('2')).toBeInTheDocument()
		expect(
			screen.getByRole('button', { name: /Pagar con Stripe.*25,00/ }),
		).toBeInTheDocument()
	})

	it('permite bloquear el checkout sin mostrar un estado de carga', () => {
		render(
			<MemoryRouter>
				<CartSummary
					items={[{ id: 1, quantity: 1, price: 25 }]}
					onCheckout={vi.fn()}
					checkoutDisabled
					checkoutLabel="Revisar pedido"
				/>
			</MemoryRouter>,
		)

		expect(screen.getByRole('button', { name: 'Revisar pedido' })).toBeDisabled()
	})
})
