import ProductCard from '../ProductCard/ProductCard'
import './ProductsGrid.css'

function ProductsGrid({ products }) {
	if (!products.length) {
		return (
			<section className="products-grid products-grid--empty">
				<p>No hay productos para mostrar con este filtro.</p>
			</section>
		)
	}

	return (
		<section className="products-grid">
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</section>
	)
}

export default ProductsGrid