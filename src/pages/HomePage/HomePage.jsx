import './HomePage.css'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import { useProducts } from '../../hooks/useProducts'

function HomePage() {
	const { data: products, loading, error } = useProducts()
	const featuredProducts = products.slice(0, 4)

	if (loading) {
		return <p>Cargando productos destacados...</p>
	}

	if (error) {
		return <p>Error al cargar productos: {error}</p>
	}

	return (
		<section className="home-page">
			<div className="home-page__hero home-page__panel">
				<p className="home-page__eyebrow">Coleccion oficial</p>
				<h1 className="home-page__title">Figuras de NeoKensei Chronicles</h1>
				<p className="home-page__description">
					Explora figuras originales inspiradas en mundos de accion,
					magia y tecnologia. Cada pieza esta pensada para vitrinas,
					regalos y colecciones personales.
				</p>
			</div>

			<section className="home-page__featured home-page__panel">
				<div className="home-page__featured-header">
					<h2 className="home-page__featured-title">Destacados de temporada</h2>
					<p className="home-page__featured-copy">
						Selección recomendada para empezar tu colección.
					</p>
				</div>
				<ProductGrid products={featuredProducts} />
			</section>
		</section>
	)
}

export default HomePage