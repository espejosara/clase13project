import { useEffect, useMemo, useState } from 'react'
import { getProducts } from '../../api/products'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import Button from '../../components/Button/Button'
import Spinner from '../../components/Spinner/Spinner'
import styles from './ProductsPage.module.css'

function ProductsPage() {
	const [products, setProducts] = useState([])
	const [search, setSearch] = useState('')
	const [sortBy, setSortBy] = useState('name-asc')
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
		const normalizedSearch = search.trim().toLocaleLowerCase('es')

		return products
			.filter((product) => {
				if (!normalizedSearch) return true

				return [product.name, product.category, product.description]
					.some((field) => String(field ?? '').toLocaleLowerCase('es').includes(normalizedSearch))
			})
			.slice()
			.sort((a, b) => {
				if (sortBy === 'price-asc') return a.price - b.price
				if (sortBy === 'price-desc') return b.price - a.price
				return a.name.localeCompare(b.name, 'es')
			})
	}, [products, search, sortBy])

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

	const hasSearch = Boolean(search.trim())
	const resultText = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'producto' : 'productos'}`

	return (
		<section className={styles.page} aria-labelledby="products-title">
			<section className={styles.hero}>
				<div>
					<p className={styles.eyebrow}>Catálogo NeoKensei</p>
					<h1 id="products-title" className={styles.title}>Encuentra tu próxima figura</h1>
					<p className={styles.heroCopy}>
						Busca por nombre, categoría o descripción y ordena la colección a tu manera.
					</p>
				</div>
				<p className={styles.catalogCount} aria-live="polite">
					{loading ? 'Cargando catálogo…' : `${products.length} ${products.length === 1 ? 'figura disponible' : 'figuras disponibles'}`}
				</p>
			</section>

			{loading ? (
				<div className={styles.statePanel}>
					<Spinner label="Cargando productos..." />
				</div>
			) : null}

			{error ? (
				<div className={styles.statePanel}>
					<StatusMessage
						title="No pudimos cargar el catálogo"
						description="Comprueba tu conexión e inténtalo de nuevo."
						variant="warning"
					/>
					<Button onClick={handleRetry}>Reintentar</Button>
				</div>
			) : null}

			{!loading && !error ? (
				<>
					<form className={styles.toolbar} role="search" onSubmit={(event) => event.preventDefault()}>
						<div className={styles.searchField}>
							<label className={styles.label} htmlFor="product-search">Buscar en el catálogo</label>
							<div className={styles.searchControl}>
								<span className={styles.searchIcon} aria-hidden="true">⌕</span>
								<input
									id="product-search"
									className={styles.input}
									type="search"
									placeholder="Nombre, categoría o descripción"
									value={search}
									onChange={(event) => setSearch(event.target.value)}
									aria-controls="products-grid"
								/>
							</div>
						</div>

						<div className={styles.sortField}>
							<label className={styles.label} htmlFor="product-sort">Ordenar por</label>
							<select
								id="product-sort"
								className={styles.select}
								value={sortBy}
								onChange={(event) => setSortBy(event.target.value)}
								aria-controls="products-grid"
							>
								<option value="name-asc">Nombre: A–Z</option>
								<option value="price-asc">Precio: menor a mayor</option>
								<option value="price-desc">Precio: mayor a menor</option>
							</select>
						</div>
					</form>

					<div className={styles.resultsHeader}>
						<p className={styles.resultsText} aria-live="polite" aria-atomic="true">
							<strong>{resultText}</strong>
							{hasSearch ? ` para “${search.trim()}”` : ' en el catálogo'}
						</p>
						{hasSearch ? (
							<Button variant="outline" className={styles.clearButton} onClick={() => setSearch('')}>
								Limpiar búsqueda
							</Button>
						) : null}
					</div>

					<div id="products-grid">
						{filteredProducts.length ? (
							<ProductGrid products={filteredProducts} />
						) : (
							<div className={styles.emptyState}>
								<p className={styles.emptyIcon} aria-hidden="true">⌕</p>
								<h2>No encontramos coincidencias</h2>
								<p>Prueba con otra palabra o vuelve a ver todo el catálogo.</p>
								<Button onClick={() => setSearch('')}>Ver todos los productos</Button>
							</div>
						)}
					</div>
				</>
			) : null}
		</section>
	)
}

export default ProductsPage
