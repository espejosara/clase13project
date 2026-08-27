import { Link } from 'react-router-dom'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import styles from './AdminPage.module.css'

function AdminPage() {
	return (
		<section className={styles.page} aria-labelledby="admin-title">
			<p className={styles.label}>Admin</p>
			<h1 id="admin-title" className={styles.title}>Panel de administración</h1>
			<StatusMessage
				title="Bienvenido al panel de administración"
				description="Desde aquí podrás gestionar los productos de la tienda."
			/>
			<Link className="app-action-link" to="/admin/products">
				Gestionar productos
			</Link>
		</section>
	)
}

export default AdminPage
