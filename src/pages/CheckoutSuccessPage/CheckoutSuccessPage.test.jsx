import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import CheckoutSuccessPage from './CheckoutSuccessPage'

function renderSuccessPage(route) {
	return render(
		<MemoryRouter initialEntries={[route]}>
			<CheckoutSuccessPage />
		</MemoryRouter>,
	)
}

describe('CheckoutSuccessPage', () => {
	it('reconoce el retorno de Stripe cuando recibe session_id', () => {
		renderSuccessPage('/checkout/success?session_id=cs_test_123')

		expect(
			screen.getByRole('heading', { name: 'Stripe ha recibido tu pago' }),
		).toBeInTheDocument()
		expect(screen.getByText(/esperando la confirmación segura/i)).toBeInTheDocument()
	})

	it('no presenta el pago como confirmado si falta session_id', () => {
		renderSuccessPage('/checkout/success')

		expect(
			screen.getByRole('heading', { name: 'No podemos identificar la sesión de Stripe' }),
		).toBeInTheDocument()
		expect(screen.queryByText('Stripe ha recibido tu pago')).not.toBeInTheDocument()
	})
})
