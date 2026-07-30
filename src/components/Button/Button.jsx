import './Button.css'

function Button({ variant = 'primary', type = 'button', disabled = false, children, ...props }) {
	return (
		<button
			type={type}
			disabled={disabled}
			className={`button button--${variant}`}
			{...props}
		>
			{children}
		</button>
	)
}

export default Button
