import { useState } from 'react'
import { useSelector } from 'react-redux'
import { createReview } from '../../api/reviews'
import Button from '../Button/Button'
import styles from './ReviewForm.module.css'

function ReviewForm({ productId, onReviewCreated }) {
	const { token } = useSelector((state) => state.auth)
	const [rating, setRating] = useState('5')
	const [comment, setComment] = useState('')
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState('')
	const [successMessage, setSuccessMessage] = useState('')

	if (!token) {
		return <p className={styles.hint}>Inicia sesión para escribir una reseña.</p>
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
		<form className={styles.reviewForm} onSubmit={handleSubmit}>
			<h3 className={styles.title}>Escribir una reseña</h3>
			<label className={styles.label} htmlFor="review-rating">
				Valoración
			</label>
			<select
				id="review-rating"
				className={styles.control}
				value={rating}
				onChange={(event) => setRating(event.target.value)}
			>
				<option value="5">5</option>
				<option value="4">4</option>
				<option value="3">3</option>
				<option value="2">2</option>
				<option value="1">1</option>
			</select>

			<label className={styles.label} htmlFor="review-comment">
				Comentario
			</label>
			<textarea
				id="review-comment"
				className={`${styles.control} ${styles.textarea}`}
				value={comment}
				onChange={(event) => setComment(event.target.value)}
				placeholder="Comparte tu opinión sobre la figura"
			/>

			<Button type="submit" disabled={loading}>
				{loading ? 'Enviando...' : 'Publicar reseña'}
			</Button>

			{error ? <p className={`${styles.message} ${styles.messageError}`} role="alert">{error}</p> : null}
			{successMessage ? <p className={`${styles.message} ${styles.messageSuccess}`} role="status">{successMessage}</p> : null}
		</form>
	)
}

export default ReviewForm
