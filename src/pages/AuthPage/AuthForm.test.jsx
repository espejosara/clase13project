import { configureStore } from '@reduxjs/toolkit'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import LoginPage from '../LoginPage/LoginPage'
import RegisterPage from '../RegisterPage/RegisterPage'

function renderAuthPage(page, { serverError = null, initialEntries = ['/'] } = {}) {
	const store = configureStore({
		reducer: {
			auth: (state = { loading: false, error: serverError }) => state,
		},
	})

	return render(
		<Provider store={store}>
			<MemoryRouter initialEntries={initialEntries}>{page}</MemoryRouter>
		</Provider>,
	)
}

describe('formularios de autenticación', () => {
	beforeEach(() => {
		sessionStorage.clear()
	})

	it('muestra los campos obligatorios del login', async () => {
		const user = userEvent.setup()
		renderAuthPage(<LoginPage />)

		await user.click(screen.getByRole('button', { name: 'Entrar' }))

		expect(screen.getByText('El email es obligatorio')).toBeInTheDocument()
		expect(screen.getByText('La contraseña es obligatoria')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: 'Regístrate' })).toHaveAttribute('href', '/register')
	})

	it('permite mostrar y volver a ocultar la contraseña del login', async () => {
		const user = userEvent.setup()
		renderAuthPage(<LoginPage />)
		const passwordInput = screen.getByLabelText('Contraseña')

		expect(passwordInput).toHaveAttribute('type', 'password')

		await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }))

		expect(passwordInput).toHaveAttribute('type', 'text')
		expect(screen.getByRole('button', { name: 'Ocultar contraseña' }))
			.toHaveAttribute('aria-pressed', 'true')

		await user.click(screen.getByRole('button', { name: 'Ocultar contraseña' }))

		expect(passwordInput).toHaveAttribute('type', 'password')
	})

	it('explica por qué se necesita iniciar sesión', () => {
		renderAuthPage(<LoginPage />, {
			initialEntries: [{
				pathname: '/login',
				state: { authIntent: 'cart' },
			}],
		})

		expect(screen.getByText('Inicia sesión para añadir productos al carrito.')).toBeInTheDocument()
	})

	it('valida la longitud mínima de la contraseña de registro', async () => {
		const user = userEvent.setup()
		renderAuthPage(<RegisterPage />)

		await user.type(screen.getByLabelText('Nombre'), 'Ada Lovelace')
		await user.type(screen.getByLabelText('Email'), 'ada@example.com')
		await user.type(screen.getByLabelText('Contraseña'), '12345')
		await user.type(screen.getByLabelText('Confirmar contraseña'), '12345')
		await user.click(screen.getByRole('button', { name: 'Registrarme' }))

		expect(
			screen.getByText('La contraseña debe tener al menos 6 caracteres'),
		).toBeInTheDocument()
	})

	it('muestra los errores recibidos desde el backend', () => {
		renderAuthPage(<LoginPage />, { serverError: 'Credenciales inválidas' })

		expect(screen.getByRole('alert', { name: '' })).toHaveTextContent('Credenciales inválidas')
	})
})
