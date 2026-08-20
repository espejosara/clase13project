import StatusMessage from '../../components/StatusMessage/StatusMessage'
import styles from './AdminPage.module.css'

function AdminPage() {
	return (
		<main className={styles.page}>
			<p className={styles.label}>Admin</p>
			<h1 className={styles.title}>Ruta protegida</h1>
			<StatusMessage
				title="Acceso avanzado"
				description="Esta pagina depende del token y del rol del usuario."
				variant="warning"
			/>
		</main>
	)
}

export default AdminPage