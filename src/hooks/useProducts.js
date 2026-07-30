import { useEffect, useState } from 'react'
import { getProducts } from '../api/products'

export function useProducts() {
	const [data, setData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)

	useEffect(() => {
		let isMounted = true

		const fetchProducts = async () => {
			setLoading(true)
			setError(null)

			try {
				const products = await getProducts()
				if (isMounted) {
					setData(products)
				}
			} catch (fetchError) {
				if (isMounted) {
					setError(fetchError.message || 'Error cargando productos')
				}
			} finally {
				if (isMounted) {
					setLoading(false)
				}
			}
		}

		fetchProducts()

		return () => {
			isMounted = false
		}
	}, [])

	return { data, loading, error }
}
