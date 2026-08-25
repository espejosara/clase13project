import styles from './StarRating.module.css'

function StarRating({ value = 0, max = 5 }) {
	const safeValue = Math.max(0, Math.min(max, Math.round(value)))

	return (
		<div className={styles.starRating} role="img" aria-label={`Valoracion ${safeValue} de ${max}`}>
			{Array.from({ length: max }, (_, index) => {
				const isFilled = index < safeValue
				return (
					<span
						key={index}
						className={isFilled ? `${styles.star} ${styles.starFilled}` : styles.star}
					>
						★
					</span>
				)
			})}
		</div>
	)
}

export default StarRating
