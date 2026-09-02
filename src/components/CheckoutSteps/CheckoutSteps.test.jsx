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
})
