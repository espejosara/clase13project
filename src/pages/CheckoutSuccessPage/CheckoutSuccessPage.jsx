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
			} catch (error) {
				if (!isActive) return

				setConfirmation({
					status: 'error',
					order: null,
					message: error.response?.data?.error || error.message,
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
					<p className={`${styles.badge} ${styles.badgeConfirmed}`}>Pago confirmado</p>
					<h1 id="success-title" className={styles.title}>Pago confirmado</h1>
					<p className={styles.copy}>
						Tu pedido #{confirmation.order.id} ya está registrado correctamente.
					</p>
				</>
			)
		}

		if (confirmation.status === 'checking') {
			return (
				<>
					<p className={styles.badge}>Verificando pago</p>
					<h1 id="success-title" className={styles.title}>Confirmando tu pago</h1>
					<p className={styles.copy}>
						Stripe ha recibido el pago. Estamos esperando la confirmación segura del webhook.
					</p>
				</>
			)
		}

		if (confirmation.status === 'pending') {
			return (
				<>
					<p className={`${styles.badge} ${styles.badgeWarning}`}>Confirmación pendiente</p>
					<h1 id="success-title" className={styles.title}>El pedido aún se está procesando</h1>
					<p className={styles.copy}>
						No vuelvas a pagar. Puedes comprobar de nuevo la confirmación o consultar tu historial.
					</p>
					<Button onClick={retryConfirmation}>Comprobar de nuevo</Button>
				</>
			)
		}

		if (confirmation.status === 'error') {
			return (
				<>
					<p className={`${styles.badge} ${styles.badgeWarning}`}>No se pudo comprobar</p>
					<h1 id="success-title" className={styles.title}>No pudimos verificar el pedido</h1>
					<p className={styles.copy}>
						{confirmation.message || 'Consulta tu historial antes de volver a intentarlo.'}
					</p>
					<Button onClick={retryConfirmation}>Reintentar comprobación</Button>
				</>
			)
		}

		return (
			<>
				<p className={`${styles.badge} ${styles.badgeWarning}`}>Confirmación pendiente</p>
				<h1 id="success-title" className={styles.title}>No podemos identificar la sesión de Stripe</h1>
				<p className={styles.copy}>
					Consulta tu historial de pedidos antes de volver a intentar el pago.
				</p>
			</>
		)
	}

	return (
		<section className={styles.page} aria-labelledby="success-title">
			<CheckoutSteps currentStep="payment" />
			<section className={styles.card}>
				{renderConfirmation()}

				<div className={styles.actions}>
					<Link to="/products" className={styles.primaryAction}>Seguir comprando</Link>
					<Link to="/cart" className="app-action-link">Ver carrito</Link>
					<Link to="/profile" className="app-action-link">Ir a mi perfil</Link>
				</div>
			</section>
		</section>
	)
}

export default CheckoutSuccessPage
