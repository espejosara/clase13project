import { useEffect, useRef, useState } from 'react'
import styles from './FormInput.module.css'

function FormInput({ id, label, error, autoFocus = false, type = 'text', ...props }) {
	const inputRef = useRef(null)
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)
	const errorId = `${id}-error`
	const isPassword = type === 'password'
	const inputType = isPassword && isPasswordVisible ? 'text' : type
	const toggleLabel = isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'

	useEffect(() => {
		if (autoFocus && inputRef.current) {
			inputRef.current.focus()
		}
	}, [autoFocus])

	return (
		<div className={styles.formInput}>
			<label htmlFor={id} className={styles.label}>
				{label}
			</label>
			<div className={styles.controlWrapper}>
				<input
					ref={inputRef}
					id={id}
					type={inputType}
					className={[
						styles.control,
						error ? styles.controlError : '',
						isPassword ? styles.controlWithToggle : '',
					].filter(Boolean).join(' ')}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? errorId : undefined}
					{...props}
				/>
				{isPassword ? (
					<button
						type="button"
						className={styles.passwordToggle}
						aria-label={toggleLabel}
						aria-controls={id}
						aria-pressed={isPasswordVisible}
						title={toggleLabel}
						onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
					>
						<svg viewBox="0 0 24 24" aria-hidden="true">
							<path d="M2.25 12s3.5-6 9.75-6 9.75 6 9.75 6-3.5 6-9.75 6S2.25 12 2.25 12Z" />
							<circle cx="12" cy="12" r="2.75" />
							{isPasswordVisible ? <path d="m4 4 16 16" /> : null}
						</svg>
					</button>
				) : null}
			</div>
			{error ? <p id={errorId} className={styles.error} role="alert">{error}</p> : null}
		</div>
	)
}

export default FormInput
