import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import ReviewForm from './ReviewForm'

vi.mock('../../api/reviews', () => ({
	createReview: vi.fn(),
}))

function renderReviewForm(route) {
	const store = configureStore({
		reducer: {
			auth: () => ({
				sessionChecked: true,
				user: { id: 3, name: 'Ana Pérez' },
			}),
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={[route]}>
				<ReviewForm productId="7" onReviewCreated={vi.fn()} />
			</MemoryRouter>
		</Provider>,
	)
}

describe('ReviewForm', () => {
	it('recibe el foco al acceder desde el historial de compras', async () => {
		renderReviewForm('/products/7#write-review')

		const form = screen.getByRole('form', { name: 'Escribir una reseña' })
		expect(form).toHaveAttribute('id', 'write-review')

		await waitFor(() => {
			expect(form).toHaveFocus()
		})
	})
})
