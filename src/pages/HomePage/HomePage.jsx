import './HomePage.css'
import { mockProducts } from '../../data/mockProducts'
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid'

function HomePage() {
	const featuredProducts = mockProducts.slice(0, 4)

	return (
		<section className="home-page">
			<div className="home-page__hero">
				<p className="home-page__eyebrow">Coleccion oficial</p>
				<h1 className="home-page__title">Figuras para fans y coleccionistas</h1>
				<p className="home-page__description">
					Explora figuras originales inspiradas en mundos de accion,
					magia y tecnologia. Cada pieza esta pensada para vitrinas,
					regalos y colecciones personales.
				</p>
			</div>

			<ProductsGrid products={featuredProducts} />
		</section>
	)
}

export default HomePage