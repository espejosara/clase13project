import { useState } from 'react'
import { register } from '../../api/auth'
import FormInput from '../../components/FormInput/FormInput'
import Button from '../../components/Button/Button'
import './RegisterPage.css'

function RegisterPage() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
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

		if (!formData.name.trim()) {
			nextErrors.name = 'El nombre es obligatorio'
		}
		if (!formData.email.trim()) {
			nextErrors.email = 'El email es obligatorio'
		}
		if (!formData.password.trim()) {
			nextErrors.password = 'La contraseña es obligatoria'
		} else if (formData.password.length < 6) {
			nextErrors.password = 'La contraseña debe tener al menos 6 caracteres'
		}
		if (formData.confirmPassword !== formData.password) {
			nextErrors.confirmPassword = 'Las contraseñas no coinciden'
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
			const payload = {
				name: formData.name,
				email: formData.email,
				password: formData.password,
			}
			const user = await register(payload)
			setSuccessMessage(`Cuenta creada para ${user.name}`)
		} catch (error) {
			setServerError(error.response?.data?.error || 'No se pudo crear la cuenta')
		} finally {
			setLoading(false)
		}
	}

	return (
		<section className="auth-page">
			<h1>Crear cuenta</h1>
			<form className="auth-form" onSubmit={handleSubmit} noValidate>
				<FormInput
					autoFocus
					id="register-name"
					name="name"
					type="text"
					label="Nombre"
					value={formData.name}
					onChange={handleChange}
					error={errors.name}
				/>
				<FormInput
					id="register-email"
					name="email"
					type="email"
					label="Email"
					value={formData.email}
					onChange={handleChange}
					error={errors.email}
				/>
				<FormInput
					id="register-password"
					name="password"
					type="password"
					label="Contraseña"
					value={formData.password}
					onChange={handleChange}
					error={errors.password}
				/>
				<FormInput
					id="register-confirm-password"
					name="confirmPassword"
					type="password"
					label="Confirmar contraseña"
					value={formData.confirmPassword}
					onChange={handleChange}
					error={errors.confirmPassword}
				/>
				<Button type="submit" variant="secondary" disabled={loading}>
					{loading ? 'Creando...' : 'Registrarme'}
				</Button>
				{serverError ? <p className="auth-message auth-message--error">{serverError}</p> : null}
				{successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
			</form>
		</section>
	)
}

export default RegisterPage
