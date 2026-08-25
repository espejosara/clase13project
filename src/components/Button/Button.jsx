import styles from './Button.module.css'

function Button({ variant = 'primary', type = 'button', disabled = false, className = '', children, ...props }) {
	const variantClass = styles[`button--${variant}`] || styles['button--primary']
	const composedClassName = [styles.button, variantClass, className].filter(Boolean).join(' ')

	return (
		<button
			type={type}
			disabled={disabled}
			className={composedClassName}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button
