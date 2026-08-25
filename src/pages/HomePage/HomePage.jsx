import styles from './HomePage.module.css'
import { Link } from 'react-router-dom'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import Spinner from '../../components/Spinner/Spinner'
import { useProducts } from '../../hooks/useProducts'

function HomePage() {
	const { data: products, loading, error } = useProducts()
	const featuredProducts = products.slice(0, 4)

	if (loading) {
		return <Spinner label="Cargando productos destacados..." />
	}

	if (error) {
		return <p>Error al cargar productos: {error}</p>
	}

	return (
		<section className={styles.homePage}>
			<div className={`${styles.hero} ${styles.panel}`}>
				<p className={styles.eyebrow}>Colección oficial</p>
				<h1 className={styles.title}>Figuras de NeoKensei Chronicles</h1>
				<p className={styles.description}>
					Explora figuras originales inspiradas en mundos de acción,
					magia y tecnología. Cada pieza está pensada para vitrinas,
					regalos y colecciones personales.
				</p>
				<div className={styles.heroActions}>
					<Link to="/products" className={styles.primaryAction}>
						Explorar catálogo <span aria-hidden="true">→</span>
					</Link>
					<a href="#featured-products" className={styles.secondaryAction}>
						Ver destacados
					</a>
				</div>
			</div>

			<section id="featured-products" className={`${styles.featured} ${styles.panel}`}>
				<div className={styles.featuredHeader}>
					<h2 className={styles.featuredTitle}>Destacados de temporada</h2>
					<p className={styles.featuredCopy}>
						Selección recomendada para empezar tu colección.
					</p>
				</div>
				<ProductGrid products={featuredProducts} />
			</section>
		</section>
	)
}

export default HomePage
