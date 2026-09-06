import styles from './ProductListSkeleton.module.css'

function ProductListSkeleton({ count = 4, variant = 'grid', label = 'Cargando productos...' }) {
	const itemCount = Math.max(1, Math.min(Number(count) || 4, 8))
	const variantClass = styles[variant] || styles.grid

	return (
		<div className={`${styles.skeletonList} ${variantClass}`} role="status" aria-live="polite">
			<span className="visually-hidden">{label}</span>
			{Array.from({ length: itemCount }, (_, index) => (
				<div key={index} className={styles.card} aria-hidden="true">
					<div className={`${styles.block} ${styles.image}`} />
					<div className={styles.content}>
						<div className={`${styles.block} ${styles.eyebrow}`} />
						<div className={`${styles.block} ${styles.title}`} />
						<div className={`${styles.block} ${styles.copy}`} />
						<div className={`${styles.block} ${styles.action}`} />
					</div>
				</div>
			))}
		</div>
	)
}

export default ProductListSkeleton
