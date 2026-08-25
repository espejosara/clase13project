import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { addCartItemThunk } from '../../store/slices/cartSlice'
import { getProducts } from '../../api/products'
import ProductCard from '../../components/ProductCard/ProductCard'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import Button from '../../components/Button/Button'
import styles from './ProductsPage.module.css'

function ProductsPage() {
	const dispatch = useDispatch()
	const [products, setProducts] = useState([])
	const [search, setSearch] = useState('')
	const [sortBy, setSortBy] = useState('name')
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')

	useEffect(() => {
		async function loadProducts() {
			try {
				setLoading(true)
				setError('')
				const data = await getProducts()
				setProducts(Array.isArray(data) ? data : [])
			} catch {
				setError('No se pudieron cargar los productos.')
			} finally {
				setLoading(false)
			}
		}

		loadProducts()
	}, [])

	const filteredProducts = useMemo(() => {
		return products
			.filter((product) => product.name.toLowerCase().includes(search.toLowerCase()))
			.slice()
			.sort((a, b) =>
				sortBy === 'price' ? a.price - b.price : a.name.localeCompare(b.name),
			)
	}, [products, search, sortBy])

	const handleAddToCart = async (productId) => {
		await dispatch(addCartItemThunk({ productId, quantity: 1 })).unwrap()
	}

	const handleRetry = async () => {
		try {
			setLoading(true)
			setError('')
			const data = await getProducts()
			setProducts(Array.isArray(data) ? data : [])
		} catch {
			setError('No se pudieron cargar los productos.')
		} finally {
			setLoading(false)
		}
	}

	if (loading) {
		return (
			<StatusMessage
				title="Cargando productos"
				description="Consultando catálogo..."
			/>
		)
	}

	if (error) {
		return (
			<section className={styles.page} aria-label="Catálogo de productos">
				<StatusMessage title="Error" description={error} variant="warning" />
				<Button onClick={handleRetry}>Reintentar</Button>
			</section>
		)
	}

	return (
		<section className={styles.page} aria-labelledby="products-title">
			<section className={styles.hero}>
				<p className={styles.eyebrow}>Catálogo</p>
				<h1 id="products-title" className={styles.title}>Explora nuestra tienda de figuras</h1>
			</section>

			<form className={styles.toolbar} role="search" onSubmit={(event) => event.preventDefault()}>
				<label className="visually-hidden" htmlFor="product-search">Buscar productos</label>
				<input
					id="product-search"
					className={styles.input}
					type="text"
					placeholder="Buscar producto..."
					value={search}
					onChange={(event) => setSearch(event.target.value)}
				/>

				<label className="visually-hidden" htmlFor="product-sort">Ordenar productos</label>
				<select
					id="product-sort"
					className={styles.select}
					value={sortBy}
					onChange={(event) => setSortBy(event.target.value)}
				>
					<option value="name">Ordenar por nombre</option>
					<option value="price">Ordenar por precio</option>
				</select>
			</form>

			<p className="visually-hidden" aria-live="polite" aria-atomic="true">
				{filteredProducts.length} productos encontrados
			</p>

			<section className={styles.grid} aria-label="Productos encontrados">
				{filteredProducts.map((product) => (
					<ProductCard
						key={product.id}
						product={product}
						onAddToCart={handleAddToCart}
					/>
				))}
			</section>
		</section>
	)
}

export default ProductsPage
