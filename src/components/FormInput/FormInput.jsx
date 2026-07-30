import { useEffect, useRef } from 'react'
import './FormInput.css'

function FormInput({ id, label, error, autoFocus = false, ...props }) {
	const inputRef = useRef(null)

	useEffect(() => {
		if (autoFocus && inputRef.current) {
			inputRef.current.focus()
		}
	}, [autoFocus])

	return (
		<div className="form-input">
			<label htmlFor={id} className="form-input__label">
				{label}
			</label>
			<input
				ref={inputRef}
				id={id}
				className={error ? 'form-input__control form-input__control--error' : 'form-input__control'}
				{...props}
			/>
			{error ? <p className="form-input__error">{error}</p> : null}
		</div>
	)
}

export default FormInput
