import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../../api/products'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import Button from '../../components/Button/Button'
import ProductListSkeleton from '../../components/ProductListSkeleton/ProductListSkeleton'
import styles from './ProductsPage.module.css'

const validSortOptions = new Set(['name-asc', 'price-asc', 'price-desc'])

function ProductsPage() {
	const [products, setProducts] = useState([])
	const [searchParams, setSearchParams] = useSearchParams()
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const search = searchParams.get('search') ?? ''
	const category = searchParams.get('category') ?? ''
	const requestedSort = searchParams.get('sort') ?? 'name-asc'
	const sortBy = validSortOptions.has(requestedSort) ? requestedSort : 'name-asc'

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

	const categories = useMemo(() => {
		return [...new Set(products.map((product) => product.category).filter(Boolean))]
			.sort((a, b) => a.localeCompare(b, 'es'))
	}, [products])

	const filteredProducts = useMemo(() => {
		const normalizedSearch = search.trim().toLocaleLowerCase('es')

		return products
			.filter((product) => {
				if (category && product.category !== category) return false
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
	}, [category, products, search, sortBy])

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
	const hasActiveFilters = hasSearch || Boolean(category)
	const resultText = `${filteredProducts.length} ${filteredProducts.length === 1 ? 'producto' : 'productos'}`
	const updateSearchParam = (key, value, options) => {
		setSearchParams((currentParams) => {
			const nextParams = new URLSearchParams(currentParams)

			if (value && !(key === 'sort' && value === 'name-asc')) {
				nextParams.set(key, value)
			} else {
				nextParams.delete(key)
			}

			return nextParams
		}, options)
	}
	const clearFilters = () => {
		setSearchParams((currentParams) => {
			const nextParams = new URLSearchParams(currentParams)
			nextParams.delete('search')
			nextParams.delete('category')
			return nextParams
		})
	}

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
					<ProductListSkeleton count={6} label="Cargando productos..." />
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
									onChange={(event) => updateSearchParam('search', event.target.value, { replace: true })}
									aria-controls="products-grid"
								/>
							</div>
						</div>

						<div className={styles.filterField}>
							<label className={styles.label} htmlFor="product-category">Categoría</label>
							<select
								id="product-category"
								className={styles.select}
								value={category}
								onChange={(event) => updateSearchParam('category', event.target.value)}
								aria-controls="products-grid"
							>
								<option value="">Todas las categorías</option>
								{categories.map((item) => (
									<option key={item} value={item}>{item}</option>
								))}
							</select>
						</div>

						<div className={styles.sortField}>
							<label className={styles.label} htmlFor="product-sort">Ordenar por</label>
							<select
								id="product-sort"
								className={styles.select}
								value={sortBy}
								onChange={(event) => updateSearchParam('sort', event.target.value)}
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
							{hasSearch ? ` para “${search.trim()}”` : ''}
							{category ? ` en ${category}` : hasSearch ? '' : ' en el catálogo'}
						</p>
						{hasActiveFilters ? (
							<Button variant="outline" className={styles.clearButton} onClick={clearFilters}>
								Limpiar filtros
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
								<p>Prueba con otra búsqueda o categoría, o vuelve a ver todo el catálogo.</p>
								<Button onClick={clearFilters}>Ver todos los productos</Button>
							</div>
						)}
					</div>
				</>
			) : null}
		</section>
	)
}

export default ProductsPage
