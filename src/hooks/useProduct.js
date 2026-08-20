import { useEffect, useState } from 'react'
import { getProductById } from '../api/products'

export function useProduct(id) {
	const [data, setData] = useState(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		if (!id) return

		let isMounted = true

		const fetchProduct = async () => {
			setLoading(true)
			setError(null)

			try {
				const product = await getProductById(id)
				if (isMounted) {
					setData(product)
				}
			} catch (fetchError) {
				if (isMounted) {
					setError(fetchError.message || 'Error cargando producto')
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		fetchProduct()

		return () => {
			isMounted = false
		}
	}, [id])

	if (!id) {
		return { data: null, loading: false, error: null }
	}

	return { data, loading, error }
}
