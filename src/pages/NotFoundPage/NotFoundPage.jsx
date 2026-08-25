import styles from './NotFoundPage.module.css'

function NotFoundPage() {
	return (
		<section className={styles.notFoundPage} aria-labelledby="not-found-title">
			<p className={styles.code}>404</p>
			<h1 id="not-found-title" className={styles.title}>Página no encontrada</h1>
		</section>
	)
}

export default NotFoundPage
