import ProductCard from '../ProductCard/ProductCard'
import styles from './ProductGrid.module.css'

function ProductGrid({ products }) {
	if (!products.length) {
		return (
			<section className={`${styles.productsGrid} ${styles.empty}`}>
				<p>No hay productos para mostrar con este filtro.</p>
			</section>
		)
	}

	return (
		<section className={styles.productsGrid}>
			{products.map((product) => (
				<ProductCard key={product.id} product={product} />
			))}
		</section>
	)
}

export default ProductGrid
