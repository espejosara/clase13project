import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import FormInput from '../../components/FormInput/FormInput'
import Button from '../../components/Button/Button'
import { loginThunk } from '../../store/slices/authSlice'

import styles from '../AuthPage/AuthPage.module.css'

const AUTH_EXPIRED_KEY = 'auth_session_expired'

function LoginPage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const location = useLocation()
	const { loading, error: serverError } = useSelector((state) => state.auth)

	const [formData, setFormData] = useState({ email: '', password: '' })
	const [errors, setErrors] = useState({})
	const [successMessage, setSuccessMessage] = useState('')
	const [sessionMessage, setSessionMessage] = useState(() => {
		const sessionExpired = sessionStorage.getItem(AUTH_EXPIRED_KEY)

		if (sessionExpired === '1') {
			sessionStorage.removeItem(AUTH_EXPIRED_KEY)
			return 'Tu sesión ha expirado. Vuelve a iniciar sesión.'
		}

		return ''
	})

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((prev) => ({ ...prev, [name]: value }))
	}

	const validate = () => {
		const nextErrors = {}

		if (!formData.email.trim()) {
			nextErrors.email = 'El email es obligatorio'
		}
		if (!formData.password.trim()) {
			nextErrors.password = 'La contraseña es obligatoria'
		}

		setErrors(nextErrors)
		return Object.keys(nextErrors).length === 0
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setSuccessMessage('')

		if (!validate()) {
			return
		}

		try {
			const authData = await dispatch(loginThunk(formData)).unwrap()
			const userName = authData?.user?.name || authData?.name || 'usuario'
			setSuccessMessage(`Sesión iniciada como ${userName}`)
			setSessionMessage('')
			const redirectTo = location.state?.from?.pathname || '/profile'
			navigate(redirectTo, { replace: true })
		} catch {
			// El error ya queda reflejado en auth.error.
		}
	}

	return (
		<section className={styles.authPage}>
			<h1>Iniciar sesión</h1>
			<form className={styles.authForm} onSubmit={handleSubmit}>
				<FormInput
					autoFocus
					id="login-email"
					name="email"
					type="email"
					autoComplete="email"
					label="Email"
					value={formData.email}
					onChange={handleChange}
					error={errors.email}
				/>
				<FormInput
					id="login-password"
					name="password"
					type="password"
					autoComplete="current-password"
					label="Contraseña"
					value={formData.password}
					onChange={handleChange}
					error={errors.password}
				/>
				<Button type="submit" variant="primary" disabled={loading}>
					{loading ? 'Enviando...' : 'Entrar'}
				</Button>
				<p className={styles.authPrompt}>
					¿No tienes cuenta? <Link to="/register">Regístrate</Link>
				</p>
				{sessionMessage ? <p className={`${styles.authMessage} ${styles.authMessageError}`} role="alert">{sessionMessage}</p> : null}
				{serverError ? <p className={`${styles.authMessage} ${styles.authMessageError}`} role="alert">{serverError}</p> : null}
				{successMessage ? <p className={`${styles.authMessage} ${styles.authMessageSuccess}`} role="status">{successMessage}</p> : null}
			</form>
		</section>
	)
}

export default LoginPage
