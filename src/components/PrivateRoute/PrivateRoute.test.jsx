import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import PrivateRoute from './PrivateRoute'

function renderAdminRoute(authState) {
	const store = configureStore({
		reducer: {
			auth: () => authState,
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={['/admin']}>
				<Routes>
					<Route
						path="/admin"
						element={(
							<PrivateRoute allowedRoles={['admin']}>
								<h1>Panel privado</h1>
							</PrivateRoute>
						)}
					/>
					<Route path="/login" element={<h1>Página de login</h1>} />
					<Route path="/profile" element={<h1>Perfil de usuario</h1>} />
				</Routes>
			</MemoryRouter>
		</Provider>,
	)
}

describe('PrivateRoute', () => {
	it('redirige a login si no hay autenticación', () => {
		renderAdminRoute({ token: null, user: null })

		expect(screen.getByRole('heading', { name: 'Página de login' })).toBeInTheDocument()
	})

	it('impide acceder al admin a un usuario con rol USER', () => {
		renderAdminRoute({ token: 'token-valido', user: { role: 'USER' } })

		expect(screen.getByRole('heading', { name: 'Perfil de usuario' })).toBeInTheDocument()
		expect(screen.queryByRole('heading', { name: 'Panel privado' })).not.toBeInTheDocument()
	})

	it('permite acceder al admin a un usuario con rol ADMIN', () => {
		renderAdminRoute({ token: 'token-valido', user: { role: 'ADMIN' } })

		expect(screen.getByRole('heading', { name: 'Panel privado' })).toBeInTheDocument()
	})
})
