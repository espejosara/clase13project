import { useEffect, useRef } from 'react'
import styles from './FormInput.module.css'

function FormInput({ id, label, error, autoFocus = false, ...props }) {
	const inputRef = useRef(null)
	const errorId = `${id}-error`

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
			<input
				ref={inputRef}
				id={id}
				className={error ? `${styles.control} ${styles.controlError}` : styles.control}
				aria-invalid={Boolean(error)}
				aria-describedby={error ? errorId : undefined}
				{...props}
			/>
			{error ? <p id={errorId} className={styles.error} role="alert">{error}</p> : null}
		</div>
	)
}

export default FormInput
