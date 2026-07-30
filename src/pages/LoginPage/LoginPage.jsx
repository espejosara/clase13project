import { useState } from 'react'
import { login } from '../../api/auth'
import FormInput from '../../components/FormInput/FormInput'
import Button from '../../components/Button/Button'
import './LoginPage.css'

function LoginPage() {
	const [formData, setFormData] = useState({ email: '', password: '' })
	const [errors, setErrors] = useState({})
	const [loading, setLoading] = useState(false)
	const [serverError, setServerError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

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
		setServerError('')
		setSuccessMessage('')

		if (!validate()) {
			return
		}

		setLoading(true)
		try {
			const user = await login(formData)
			setSuccessMessage(`Sesión iniciada como ${user.name}`)
		} catch (error) {
			setServerError(error.response?.data?.error || 'No se pudo iniciar sesión')
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="auth-page">
			<h1>Iniciar sesión</h1>
			<form className="auth-form" onSubmit={handleSubmit} noValidate>
				<FormInput
					autoFocus
					id="login-email"
					name="email"
					type="email"
					label="Email"
					value={formData.email}
					onChange={handleChange}
					error={errors.email}
				/>
				<FormInput
					id="login-password"
					name="password"
					type="password"
					label="Contraseña"
					value={formData.password}
					onChange={handleChange}
					error={errors.password}
				/>
				<Button type="submit" variant="primary" disabled={loading}>
					{loading ? 'Enviando...' : 'Entrar'}
				</Button>
				{serverError ? <p className="auth-message auth-message--error">{serverError}</p> : null}
				{successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
			</form>
		</section>
	)
}

export default LoginPage
