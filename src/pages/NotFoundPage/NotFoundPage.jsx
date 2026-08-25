import styles from './NotFoundPage.module.css'

function NotFoundPage() {
	return (
		<main className={styles.notFoundPage}>
			<p className={styles.code}>404</p>
			<h1 className={styles.title}>Pagina no encontrada</h1>
		</main>
	)
}

export default NotFoundPage