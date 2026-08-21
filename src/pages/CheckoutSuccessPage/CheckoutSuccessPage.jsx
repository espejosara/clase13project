import { Link } from 'react-router-dom'
import styles from './CheckoutSuccessPage.module.css'

function CheckoutSuccessPage() {
	return (
		<main className={styles.page}>
			<section className={styles.card}>
				<p className={styles.badge}>Pedido completado</p>
				<h1 className={styles.title}>Compra realizada con exito</h1>
				<p className={styles.copy}>
					Tu pedido se ha procesado correctamente. Gracias por comprar en NeoKensei Chronicles.
				</p>

				<div className={styles.actions}>
					<Link to="/products" className={styles.primaryAction}>Seguir comprando</Link>
					<Link to="/cart" className="app-action-link">Ver carrito</Link>
					<Link to="/checkout" className="app-action-link">Volver a checkout</Link>
					<Link to="/profile" className="app-action-link">Ir a mi perfil</Link>
				</div>
			</section>
		</main>
	)
}

export default CheckoutSuccessPage