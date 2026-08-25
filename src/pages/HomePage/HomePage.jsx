import styles from './HomePage.module.css'
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
				<p className={styles.eyebrow}>Coleccion oficial</p>
				<h1 className={styles.title}>Figuras de NeoKensei Chronicles</h1>
				<p className={styles.description}>
					Explora figuras originales inspiradas en mundos de accion,
					magia y tecnologia. Cada pieza esta pensada para vitrinas,
					regalos y colecciones personales.
				</p>
			</div>

			<section className={`${styles.featured} ${styles.panel}`}>
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