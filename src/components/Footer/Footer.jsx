import styles from './Footer.module.css'

function Footer() {
	return (
		<footer className={styles.footer}>
			<p className={styles.text}>
				Colecciones originales, piezas de autor y ediciones para fans y
				coleccionistas.
			</p>
			<p className={styles.copy}>Envíos y novedades de temporada</p>
		</footer>
	)
}

export default Footer
