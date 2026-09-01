import { Link, useSearchParams } from 'react-router-dom'
import styles from './CheckoutSuccessPage.module.css'

function CheckoutSuccessPage() {
	const [searchParams] = useSearchParams()
	const sessionId = searchParams.get('session_id')

	return (
		<section className={styles.page} aria-labelledby="success-title">
			<section className={styles.card}>
				{sessionId ? (
					<>
						<p className={styles.badge}>Pago enviado</p>
						<h1 id="success-title" className={styles.title}>Stripe ha recibido tu pago</h1>
						<p className={styles.copy}>
							Estamos esperando la confirmación segura del pago para registrar definitivamente el pedido.
						</p>
					</>
				) : (
					<>
						<p className={`${styles.badge} ${styles.badgeWarning}`}>Confirmación pendiente</p>
						<h1 id="success-title" className={styles.title}>No podemos identificar la sesión de Stripe</h1>
						<p className={styles.copy}>
							Consulta tu historial de pedidos antes de volver a intentar el pago.
						</p>
					</>
				)}

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
