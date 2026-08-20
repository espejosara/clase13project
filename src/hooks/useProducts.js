import { useEffect, useState } from 'react'
import { getProducts } from '../api/products'

export function useProducts() {
	const [data, setData] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(null)
	const [reloadToken, setReloadToken] = useState(0)

	const refetch = () => {
		setReloadToken((currentToken) => currentToken + 1)
	}

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
	}, [reloadToken])

	return { data, loading, error, refetch }
}
