import { useEffect, useState } from 'react'
import { getReviews } from '../api/reviews'

export function useReviews(productId) {
	const [data, setData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (!productId) {
			setData([])
			setLoading(false)
			return
		}

		let isMounted = true

		const fetchReviews = async () => {
			setLoading(true)
			setError(null)

			try {
				const reviews = await getReviews(productId)
				if (isMounted) {
					setData(reviews)
				}
			} catch (fetchError) {
				if (isMounted) {
					setError(fetchError.message || 'Error cargando reviews')
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		fetchReviews()

		return () => {
			isMounted = false
		}
	}, [productId])

	return { data, loading, error }
}
