import styles from './HomePage.module.css'
import { Link } from 'react-router-dom'
import FeaturedProductsRail from '../../components/FeaturedProductsRail/FeaturedProductsRail'
import Spinner from '../../components/Spinner/Spinner'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import Button from '../../components/Button/Button'
import { useProducts } from '../../hooks/useProducts'

const HERO_IMAGE_URL = 'https://res.cloudinary.com/dm1w4w1o8/image/upload/v1788436270/Gemini_Generated_Image_u5pka3u5pka3u5pk_bddoer.png'

function HomePage() {
	const { data: products, loading, error, refetch } = useProducts()
	const featuredProducts = products.filter((product) => product.isFeatured)

	return (
		<section className={styles.homePage}>
			<article className={styles.hero}>
				<div className={styles.heroMedia}>
					<img
						className={styles.heroImage}
						src={HERO_IMAGE_URL}
						alt="Universo de fantasía tecnológica de NeoKensei Chronicles"
						width="1376"
						height="768"
						fetchPriority="high"
					/>
				</div>
				<div className={styles.heroContent}>
					<div className={styles.heroText}>
						<p className={styles.eyebrow}>Colección oficial</p>
						<h1 className={styles.title}>Figuras de NeoKensei Chronicles</h1>
						<p className={styles.description}>
							Explora personajes de acción, magia y tecnología y encuentra
							la próxima pieza de tu colección.
						</p>
					</div>
					<div className={styles.heroActions}>
						<Link to="/products" className={styles.primaryAction}>
							Explorar catálogo <span aria-hidden="true">→</span>
						</Link>
						<a href="#featured-products" className={styles.secondaryAction}>
							Ver destacados
						</a>
					</div>
				</div>
			</article>

			<section id="featured-products" className={styles.featured} aria-labelledby="featured-title">
				<div className={styles.featuredHeader}>
					<div>
						<p className={styles.eyebrow}>Selección de la tienda</p>
						<h2 id="featured-title" className={styles.featuredTitle}>Productos destacados</h2>
						<p className={styles.featuredCopy}>
							Una selección para descubrir el universo NeoKensei.
						</p>
					</div>
					<Link to="/products" className={styles.catalogLink}>
						Ver todo el catálogo <span aria-hidden="true">→</span>
					</Link>
				</div>

				{loading ? <Spinner label="Cargando productos destacados..." /> : null}

				{error ? (
					<div className={styles.featuredStatus}>
						<StatusMessage
							title="No pudimos cargar los destacados"
							description="Puedes intentarlo de nuevo o entrar directamente al catálogo."
							variant="error"
						/>
						<Button type="button" onClick={refetch}>Reintentar</Button>
					</div>
				) : null}

				{!loading && !error ? <FeaturedProductsRail products={featuredProducts} /> : null}
			</section>
		</section>
	)
}

export default HomePage
