import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import CheckoutSteps from './CheckoutSteps'

describe('CheckoutSteps', () => {
	it('identifica la etapa actual del proceso de compra', () => {
		render(<CheckoutSteps currentStep="review" />)

		expect(screen.getByRole('navigation', { name: 'Progreso de compra' })).toBeInTheDocument()
		expect(screen.getByText('Revisión').closest('li')).toHaveAttribute('aria-current', 'step')
		expect(screen.getByText('Carrito').closest('li')).not.toHaveAttribute('aria-current')
	})

	it('muestra en verde el número del último paso cuando el pago está completado', () => {
		render(<CheckoutSteps currentStep="payment" currentStepCompleted />)

		const paymentStep = screen.getByText('Pago').closest('li')

		expect(paymentStep).toHaveAttribute('data-state', 'completed')
		expect(paymentStep).not.toHaveAttribute('aria-current')
		expect(paymentStep).toHaveTextContent('3')
	})
})
