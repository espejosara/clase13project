import StatusMessage from '../../components/StatusMessage/StatusMessage'
import styles from './AdminPage.module.css'

function AdminPage() {
	return (
		<section className={styles.page} aria-labelledby="admin-title">
			<p className={styles.label}>Admin</p>
			<h1 id="admin-title" className={styles.title}>Ruta protegida</h1>
			<StatusMessage
				title="Acceso avanzado"
				description="Esta página depende del token y del rol del usuario."
				variant="warning"
			/>
		</section>
	)
}

export default AdminPage
