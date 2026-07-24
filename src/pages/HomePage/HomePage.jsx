import './HomePage.css'
import { mockProducts } from '../../data/mockProducts'

function HomePage() {
	const featuredProducts = mockProducts.slice(0, 6)

	return (
		<section className="home-page">
			<div className="home-page__hero">
				<p className="home-page__eyebrow">Coleccion destacada</p>
				<h1 className="home-page__title">Figuras anime para coleccionistas</h1>
				<p className="home-page__description">
					Descubre personajes originales con estetica fantastica,
					cyberpunk y steampunk en una coleccion pensada para fans del
					detalle.
				</p>
			</div>

			<div className="home-page__featured">
				{featuredProducts.map((product) => (
					<article key={product.id} className="home-page__card">
						<img
							className="home-page__image"
							src={product.imageUrl}
							alt={product.name}
						/>
						<div className="home-page__card-content">
							<h2>{product.name}</h2>
							<p>{product.description}</p>
							<span>{product.price.toFixed(2)} EUR</span>
						</div>
					</article>
				))}
			</div>
		</section>
	)
}

export default HomePage