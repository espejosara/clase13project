import { Link } from 'react-router-dom'

function CheckoutSuccessPage() {
	return (
		<section>
			<h1>Compra completada</h1>
			<p>Tu pedido se ha procesado correctamente. Gracias por comprar en NeoKensei Chronicles.</p>
			<p>
				<Link to="/products">Seguir comprando</Link>
			</p>
			<p>
				<Link to="/cart">Ver carrito</Link>
			</p>
			<p>
				<Link to="/checkout">Volver a checkout</Link>
			</p>
			<p>
				<Link to="/profile">Ir a mi perfil</Link>
			</p>
		</section>
	)
}

export default CheckoutSuccessPage