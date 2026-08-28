import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import AdminRoute from './AdminRoute'

function renderAdminRoute(user, sessionChecked = true) {
	const store = configureStore({
		reducer: {
			auth: () => ({ sessionChecked, user }),
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={['/admin']}>
				<Routes>
					<Route element={<AdminRoute />}>
						<Route path="/admin" element={<h1>Panel admin</h1>} />
					</Route>
					<Route path="/" element={<h1>Página de inicio</h1>} />
				</Routes>
			</MemoryRouter>
		</Provider>,
	)
}

describe('AdminRoute', () => {
	it('espera a comprobar la cookie antes de validar el rol', () => {
		renderAdminRoute(null, false)

		expect(screen.getByRole('status')).toHaveTextContent('Comprobando sesión...')
		expect(screen.queryByRole('heading', { name: 'Página de inicio' })).not.toBeInTheDocument()
	})

	it('redirige al inicio si no hay usuario', () => {
		renderAdminRoute(null)

		expect(screen.getByRole('heading', { name: 'Página de inicio' })).toBeInTheDocument()
	})

	it('redirige al inicio si el usuario tiene rol USER', () => {
		renderAdminRoute({ role: 'USER' })

		expect(screen.getByRole('heading', { name: 'Página de inicio' })).toBeInTheDocument()
	})

	it('permite acceder si el usuario tiene rol ADMIN', () => {
		renderAdminRoute({ role: 'ADMIN' })

		expect(screen.getByRole('heading', { name: 'Panel admin' })).toBeInTheDocument()
	})
})
