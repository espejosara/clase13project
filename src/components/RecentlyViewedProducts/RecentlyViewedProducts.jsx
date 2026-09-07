import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SafeImage from '../SafeImage/SafeImage'
import {
	readRecentlyViewedProducts,
	rememberViewedProduct,
} from '../../utils/recentlyViewedProducts'
import styles from './RecentlyViewedProducts.module.css'

const priceFormatter = new Intl.NumberFormat('es-ES', {
	style: 'currency',
	currency: 'EUR',
})

function RecentlyViewedProducts({ currentProduct, userKey, catalogSearch = '' }) {
	const [recentProducts] = useState(() => (
		readRecentlyViewedProducts(userKey)
			.filter((product) => String(product.id) !== String(currentProduct.id))
			.slice(0, 4)
	))

	useEffect(() => {
		rememberViewedProduct(currentProduct, userKey)
	}, [currentProduct, userKey])

	if (!recentProducts.length) return null

	return (
		<section className={styles.section} aria-labelledby="recently-viewed-title">
			<header className={styles.header}>
				<div>
					<p className={styles.eyebrow}>Continúa explorando</p>
					<h2 id="recently-viewed-title" className={styles.title}>Vistos recientemente</h2>
				</div>
				<Link to={`/products${catalogSearch}`} className="app-action-link">
					Ver catálogo
				</Link>
			</header>

			<ul className={styles.rail}>
				{recentProducts.map((product) => {
					const isOutOfStock = product.stock !== null && product.stock <= 0

					return (
						<li key={product.id} className={styles.item}>
							<Link
								to={`/products/${product.id}`}
								state={{ catalogSearch }}
								className={styles.card}
							>
								<SafeImage
									className={styles.image}
									src={product.imageUrl}
									alt=""
									loading="lazy"
									decoding="async"
								/>
								<span className={styles.content}>
									<span className={styles.category}>{product.category}</span>
									<strong className={styles.name}>{product.name}</strong>
									<span className={styles.meta}>
										<span className={styles.price}>{priceFormatter.format(product.price)}</span>
										{isOutOfStock ? <span className={styles.outOfStock}>Agotado</span> : null}
									</span>
								</span>
							</Link>
						</li>
					)
				})}
			</ul>
		</section>
	)
}

export default RecentlyViewedProducts
