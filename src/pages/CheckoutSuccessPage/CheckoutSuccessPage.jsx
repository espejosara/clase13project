import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCheckoutOrderRequest } from '../../api/payments'
import Button from '../../components/Button/Button'
import CheckoutSteps from '../../components/CheckoutSteps/CheckoutSteps'
import styles from './CheckoutSuccessPage.module.css'

const POLL_INTERVAL_MS = 1500
const MAX_CONFIRMATION_ATTEMPTS = 8

function CheckoutSuccessPage() {
	const [searchParams] = useSearchParams()
	const sessionId = searchParams.get('session_id')
	const [retryCount, setRetryCount] = useState(0)
	const [confirmation, setConfirmation] = useState(() => ({
		status: sessionId ? 'checking' : 'missing',
		order: null,
	}))

	useEffect(() => {
		if (!sessionId) return undefined

		let isActive = true
		let timeoutId
		let attempts = 0

		const checkConfirmation = async () => {
			try {
				const result = await getCheckoutOrderRequest(sessionId)

				if (!isActive) return

				if (result.confirmed && result.order) {
					setConfirmation({ status: 'confirmed', order: result.order })
					return
				}

				attempts += 1

				if (attempts >= MAX_CONFIRMATION_ATTEMPTS) {
					setConfirmation({ status: 'pending', order: null })
					return
				}

				timeoutId = window.setTimeout(checkConfirmation, POLL_INTERVAL_MS)
			} catch {
				if (!isActive) return

				setConfirmation({
					status: 'error',
					order: null,
				})
			}
		}

		checkConfirmation()

		return () => {
			isActive = false
			window.clearTimeout(timeoutId)
		}
	}, [retryCount, sessionId])

	const retryConfirmation = () => {
		setConfirmation({ status: 'checking', order: null })
		setRetryCount((currentCount) => currentCount + 1)
	}

	const renderConfirmation = () => {
		if (confirmation.status === 'confirmed') {
			return (
				<>
					<p className={`${styles.badge} ${styles.badgeConfirmed}`}>Pedido confirmado</p>
					<h1 id="success-title" className={styles.title}>¡Pago completado!</h1>
					<p className={styles.copy}>
						Gracias por tu compra. Tu pedido #{confirmation.order.id} ya aparece en tu historial.
					</p>
				</>
			)
		}

		if (confirmation.status === 'checking') {
			return (
				<>
					<p className={styles.badge}>Procesando pedido</p>
					<h1 id="success-title" className={styles.title}>Estamos confirmando tu compra</h1>
					<p className={styles.copy}>
						Solo tardaremos unos segundos. No necesitas hacer nada ni volver a pagar.
					</p>
				</>
			)
		}

		if (confirmation.status === 'pending') {
			return (
				<>
					<p className={`${styles.badge} ${styles.badgeWarning}`}>Estamos terminando</p>
					<h1 id="success-title" className={styles.title}>Tu pedido está casi listo</h1>
					<p className={styles.copy}>
						La confirmación está tardando un poco más de lo habitual. No necesitas volver a pagar.
						 Puedes comprobarlo de nuevo o revisar tus pedidos.
					</p>
					<Button onClick={retryConfirmation}>Volver a comprobar</Button>
				</>
			)
		}

		if (confirmation.status === 'error') {
			return (
				<>
					<p className={`${styles.badge} ${styles.badgeWarning}`}>No hemos podido comprobarlo</p>
					<h1 id="success-title" className={styles.title}>Tu pedido todavía no aparece</h1>
					<p className={styles.copy}>
						No realices otro pago. Espera unos segundos y vuelve a comprobarlo
						 o revisa tu historial de pedidos.
					</p>
					<Button onClick={retryConfirmation}>Volver a comprobar</Button>
				</>
			)
		}

		return (
			<>
				<p className={`${styles.badge} ${styles.badgeWarning}`}>No encontramos la compra</p>
				<h1 id="success-title" className={styles.title}>No podemos mostrar la confirmación</h1>
				<p className={styles.copy}>
					Accede a tu historial para comprobar si el pedido se ha registrado
					 antes de intentar pagar de nuevo.
				</p>
			</>
		)
	}

	const renderActions = () => {
		if (confirmation.status === 'checking') return null

		if (confirmation.status === 'confirmed') {
			return (
				<div className={styles.actions}>
					<Link to="/profile#historial-pedidos" className={styles.primaryAction}>Ver mi pedido</Link>
					<Link to="/products" className={styles.secondaryAction}>Seguir comprando</Link>
				</div>
			)
		}

		if (confirmation.status === 'pending' || confirmation.status === 'error') {
			return (
				<div className={styles.actions}>
					<Link to="/profile#historial-pedidos" className={styles.secondaryAction}>Ver mis pedidos</Link>
				</div>
			)
		}

		return (
			<div className={styles.actions}>
				<Link to="/profile#historial-pedidos" className={styles.primaryAction}>Ver mis pedidos</Link>
				<Link to="/products" className={styles.secondaryAction}>Volver al catálogo</Link>
			</div>
		)
	}

	return (
		<section className={styles.page} aria-labelledby="success-title">
			<CheckoutSteps
				currentStep="payment"
				currentStepCompleted={confirmation.status === 'confirmed'}
			/>
			<section className={styles.card}>
				{renderConfirmation()}
				{renderActions()}
			</section>
		</section>
	)
}

export default CheckoutSuccessPage
