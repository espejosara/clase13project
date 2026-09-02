import styles from './CheckoutSteps.module.css'

const CHECKOUT_STEPS = [
	{ id: 'cart', label: 'Carrito' },
	{ id: 'review', label: 'Revisión' },
	{ id: 'payment', label: 'Pago' },
]

function CheckoutSteps({ currentStep, currentStepCompleted = false }) {
	const currentIndex = CHECKOUT_STEPS.findIndex((step) => step.id === currentStep)

	return (
		<nav className={styles.checkoutSteps} aria-label="Progreso de compra">
			<ol className={styles.list}>
				{CHECKOUT_STEPS.map((step, index) => {
					const isCurrentStep = index === currentIndex
					const isCompleted = currentIndex > index
						|| (isCurrentStep && currentStepCompleted)
					const isCurrent = isCurrentStep && !currentStepCompleted
					const state = isCompleted ? 'completed' : isCurrent ? 'current' : 'pending'
					const stateClass = styles[state]

					return (
						<li
							key={step.id}
							className={`${styles.step} ${stateClass}`}
							data-state={state}
							aria-current={isCurrent ? 'step' : undefined}
						>
							<span className={styles.marker} aria-hidden="true">
								{isCompleted && !isCurrentStep ? '✓' : index + 1}
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
