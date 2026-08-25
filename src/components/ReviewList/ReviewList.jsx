import StarRating from '../StarRating/StarRating'
import styles from './ReviewList.module.css'

function ReviewList({ reviews = [] }) {
	if (!reviews.length) {
		return <p className={styles.empty}>Aun no hay reviews para este producto.</p>
	}

	return (
		<ul className={styles.list}>
			{reviews.map((review) => (
				<li key={review.id} className={styles.item}>
					<div className={styles.header}>
						<strong>{review.author}</strong>
						<StarRating value={review.rating} />
					</div>
					<p>{review.comment}</p>
				</li>
			))}
		</ul>
	)
}

export default ReviewList
