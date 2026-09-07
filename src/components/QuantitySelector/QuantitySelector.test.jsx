import { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import QuantitySelector from './QuantitySelector'

function StatefulQuantitySelector({ max = 3 }) {
	const [quantity, setQuantity] = useState(1)
	return <QuantitySelector value={quantity} max={max} onChange={setQuantity} />
}

describe('QuantitySelector', () => {
	it('permite cambiar la cantidad sin superar los límites disponibles', async () => {
		const user = userEvent.setup()
		render(<StatefulQuantitySelector max={3} />)
		const decreaseButton = screen.getByRole('button', { name: 'Reducir cantidad' })
		const increaseButton = screen.getByRole('button', { name: 'Aumentar cantidad' })

		expect(decreaseButton).toBeDisabled()
		expect(screen.getByRole('status', { name: 'Cantidad: 1' })).toHaveTextContent('1')

		await user.click(increaseButton)
		await user.click(increaseButton)

		expect(screen.getByRole('status', { name: 'Cantidad: 3' })).toHaveTextContent('3')
		expect(increaseButton).toBeDisabled()
		expect(screen.getByText('Máximo disponible')).toBeInTheDocument()

		await user.click(decreaseButton)
		expect(screen.getByRole('status', { name: 'Cantidad: 2' })).toHaveTextContent('2')
	})
})
