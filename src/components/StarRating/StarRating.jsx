import './StarRating.css'

function StarRating({ value = 0, max = 5 }) {
	const safeValue = Math.max(0, Math.min(max, Math.round(value)))

	return (
		<div className="star-rating" aria-label={`Valoracion ${safeValue} de ${max}`}>
			{Array.from({ length: max }, (_, index) => {
				const isFilled = index < safeValue
				return (
					<span
						key={index}
						className={isFilled ? 'star-rating__star star-rating__star--filled' : 'star-rating__star'}
					>
						★
					</span>
				)
			})}
		</div>
	)
}

export default StarRating
