import StarRating from '../StarRating/StarRating'
import './ReviewList.css'

function ReviewList({ reviews = [] }) {
	if (!reviews.length) {
		return <p className="review-list__empty">Aun no hay reviews para este producto.</p>
	}

	return (
		<ul className="review-list">
			{reviews.map((review) => (
				<li key={review.id} className="review-list__item">
					<div className="review-list__header">
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
