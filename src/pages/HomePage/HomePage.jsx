import './HomePage.css'
import { mockProducts } from '../../data/mockProducts'
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid'

function HomePage() {
	const featuredProducts = mockProducts.slice(0, 4)

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
				<ProductsGrid products={featuredProducts} />
			</section>
		</section>
	)
}

export default HomePage