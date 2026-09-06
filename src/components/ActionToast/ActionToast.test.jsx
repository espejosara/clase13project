import { configureStore } from '@reduxjs/toolkit'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import notificationReducer, { showNotification } from '../../store/slices/notificationSlice'
import ActionToast from './ActionToast'

function renderActionToast() {
	const store = configureStore({
		reducer: { notification: notificationReducer },
	})

	render(
		<Provider store={store}>
			<MemoryRouter>
				<ActionToast />
			</MemoryRouter>
		</Provider>,
	)

	return store
}

afterEach(() => {
	vi.useRealTimers()
})

describe('ActionToast', () => {
	it('muestra el último aviso y permite cerrarlo', async () => {
		const user = userEvent.setup()
		const store = renderActionToast()

		act(() => store.dispatch(showNotification({
			message: 'Producto añadido a favoritos',
			actionLabel: 'Ver favoritos',
			actionTo: '/wishlist',
		})))

		expect(screen.getByRole('status')).toHaveTextContent('Producto añadido a favoritos')
		expect(screen.getByRole('link', { name: 'Ver favoritos' })).toHaveAttribute('href', '/wishlist')

		await user.click(screen.getByRole('button', { name: 'Cerrar notificación' }))

		expect(screen.queryByRole('status')).not.toBeInTheDocument()
	})

	it('oculta automáticamente el aviso', () => {
		vi.useFakeTimers()
		const store = renderActionToast()

		act(() => store.dispatch(showNotification('Producto añadido al carrito')))
		expect(screen.getByRole('status')).toBeInTheDocument()

		act(() => vi.advanceTimersByTime(2800))

		expect(screen.queryByRole('status')).not.toBeInTheDocument()
	})

	it('cierra el aviso al elegir su acción', async () => {
		const user = userEvent.setup()
		const store = renderActionToast()

		act(() => store.dispatch(showNotification({
			message: 'Producto añadido al carrito',
			actionLabel: 'Ver carrito',
			actionTo: '/cart',
		})))

		await user.click(screen.getByRole('link', { name: 'Ver carrito' }))

		expect(screen.queryByRole('status')).not.toBeInTheDocument()
	})
})
