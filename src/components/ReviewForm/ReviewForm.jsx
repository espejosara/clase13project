import { useState } from 'react'
import { useSelector } from 'react-redux'
import { createReview } from '../../api/reviews'
import Button from '../Button/Button'
import './ReviewForm.css'

function ReviewForm({ productId, onReviewCreated }) {
	const { token } = useSelector((state) => state.auth)
	const [rating, setRating] = useState('5')
	const [comment, setComment] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	if (!token) {
		return <p className="review-form__hint">Inicia sesión para escribir una reseña.</p>
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setSuccessMessage('')

		if (!comment.trim()) {
			setError('El comentario es obligatorio')
			return
		}

		setLoading(true)

		try {
			const review = await createReview(productId, {
				rating: Number(rating),
				comment: comment.trim(),
			})

			onReviewCreated(review)
			setComment('')
			setRating('5')
			setSuccessMessage('Reseña enviada correctamente')
		} catch (submitError) {
			setError(submitError.response?.data?.error || 'No se pudo enviar la reseña')
		} finally {
			setLoading(false)
		}
	}

	return (
		<form className="review-form" onSubmit={handleSubmit}>
			<h3 className="review-form__title">Escribir una reseña</h3>
			<label className="review-form__label" htmlFor="review-rating">
				Valoración
			</label>
			<select
				id="review-rating"
				className="review-form__control"
				value={rating}
				onChange={(event) => setRating(event.target.value)}
			>
				<option value="5">5</option>
				<option value="4">4</option>
				<option value="3">3</option>
				<option value="2">2</option>
				<option value="1">1</option>
			</select>

			<label className="review-form__label" htmlFor="review-comment">
				Comentario
			</label>
			<textarea
				id="review-comment"
				className="review-form__control review-form__textarea"
				value={comment}
				onChange={(event) => setComment(event.target.value)}
				placeholder="Comparte tu opinión sobre la figura"
			/>

			<Button type="submit" disabled={loading}>
				{loading ? 'Enviando...' : 'Publicar reseña'}
			</Button>

			{error ? <p className="review-form__message review-form__message--error">{error}</p> : null}
			{successMessage ? <p className="review-form__message review-form__message--success">{successMessage}</p> : null}
		</form>
	)
}

export default ReviewForm