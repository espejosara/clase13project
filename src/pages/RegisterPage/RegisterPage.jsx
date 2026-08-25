import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import FormInput from '../../components/FormInput/FormInput'
import Button from '../../components/Button/Button'
import { registerThunk } from '../../store/slices/authSlice'
import styles from '../AuthPage/AuthPage.module.css'

function RegisterPage() {
	const dispatch = useDispatch()
	const navigate = useNavigate()
	const { loading, error: serverError } = useSelector((state) => state.auth)

	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	})
	const [errors, setErrors] = useState({})
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
		setSuccessMessage('')

		if (!validate()) {
			return
		}

		try {
			const payload = {
				name: formData.name,
				email: formData.email,
				password: formData.password,
			}
			const authData = await dispatch(registerThunk(payload)).unwrap()
			const userName = authData?.user?.name || authData?.name || 'usuario'
			setSuccessMessage(`Cuenta creada para ${userName}`)
			navigate('/profile', { replace: true })
		} catch {
			// El error ya queda reflejado en auth.error.
		}
	}

	return (
		<section className={styles.authPage}>
			<h1>Crear cuenta</h1>
			<form className={styles.authForm} onSubmit={handleSubmit}>
				<FormInput
					autoFocus
					id="register-name"
					name="name"
					type="text"
					autoComplete="name"
					label="Nombre"
					value={formData.name}
					onChange={handleChange}
					error={errors.name}
				/>
				<FormInput
					id="register-email"
					name="email"
					type="email"
					autoComplete="email"
					label="Email"
					value={formData.email}
					onChange={handleChange}
					error={errors.email}
				/>
				<FormInput
					id="register-password"
					name="password"
					type="password"
					autoComplete="new-password"
					label="Contraseña"
					value={formData.password}
					onChange={handleChange}
					error={errors.password}
				/>
				<FormInput
					id="register-confirm-password"
					name="confirmPassword"
					type="password"
					autoComplete="new-password"
					label="Confirmar contraseña"
					value={formData.confirmPassword}
					onChange={handleChange}
					error={errors.confirmPassword}
				/>
				<Button type="submit" variant="secondary" disabled={loading}>
					{loading ? 'Creando...' : 'Registrarme'}
				</Button>
				{serverError ? <p className={`${styles.authMessage} ${styles.authMessageError}`} role="alert">{serverError}</p> : null}
				{successMessage ? <p className={`${styles.authMessage} ${styles.authMessageSuccess}`} role="status">{successMessage}</p> : null}
			</form>
		</section>
	)
}

export default RegisterPage
