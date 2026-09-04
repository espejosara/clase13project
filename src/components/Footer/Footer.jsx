import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const BRAND_MARK_URL = 'https://res.cloudinary.com/dm1w4w1o8/image/upload/v1788527218/Gemini_Generated_Image_9p1rhd9p1rhd9p1r-removebg-preview_uqida1.png'
const INSTAGRAM_URL = 'https://www.instagram.com/neokenseichronicles/'

function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.inner}>
				<div className={styles.brandBlock}>
					<Link to="/" className={styles.brand} aria-label="NeoKensei Chronicles, ir al inicio">
						<img
							className={styles.brandMark}
							src={BRAND_MARK_URL}
							alt=""
							width="32"
							height="32"
							loading="lazy"
						/>
						<span>NeoKensei Chronicles</span>
					</Link>
					<p className={styles.description}>
						Figuras y colecciones inspiradas en un universo de acción,
						magia y tecnología.
					</p>
				</div>

				<div className={styles.linksBlock}>
					<p className={styles.linksTitle}>Explora NeoKensei</p>
					<nav className={styles.links} aria-label="Enlaces del pie de página">
						<Link to="/">Inicio</Link>
						<Link to="/products">Catálogo</Link>
						<a
							className={styles.instagramLink}
							href={INSTAGRAM_URL}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Seguir a NeoKensei Chronicles en Instagram (abre en una pestaña nueva)"
						>
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
								<rect x="3" y="3" width="18" height="18" rx="5" />
								<circle cx="12" cy="12" r="4" />
								<path d="M17.5 6.5h.01" />
							</svg>
							Instagram
							<span aria-hidden="true">↗</span>
						</a>
					</nav>
				</div>
			</div>

			<div className={styles.bottom}>
				<p>© {new Date().getFullYear()} NeoKensei Chronicles</p>
				<p>Creado para coleccionistas</p>
			</div>
		</footer>
	)
}

export default Footer
