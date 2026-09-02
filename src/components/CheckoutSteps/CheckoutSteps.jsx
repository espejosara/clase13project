import styles from './CheckoutSteps.module.css'

const CHECKOUT_STEPS = [
	{ id: 'cart', label: 'Carrito' },
	{ id: 'review', label: 'Revisión' },
	{ id: 'payment', label: 'Pago' },
]

function CheckoutSteps({ currentStep }) {
	const currentIndex = CHECKOUT_STEPS.findIndex((step) => step.id === currentStep)

	return (
		<nav className={styles.checkoutSteps} aria-label="Progreso de compra">
			<ol className={styles.list}>
				{CHECKOUT_STEPS.map((step, index) => {
					const isCurrent = index === currentIndex
					const isCompleted = currentIndex > index
					const stateClass = isCurrent
						? styles.current
						: isCompleted ? styles.completed : styles.pending

					return (
						<li
							key={step.id}
							className={`${styles.step} ${stateClass}`}
							aria-current={isCurrent ? 'step' : undefined}
						>
							<span className={styles.marker} aria-hidden="true">
								{isCompleted ? '✓' : index + 1}
							</span>
							<span className={styles.label}>{step.label}</span>
						</li>
					)
				})}
			</ol>
		</nav>
	)
}

export default CheckoutSteps
