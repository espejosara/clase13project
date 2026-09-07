import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getProducts } from '../../api/products'
import Button from '../../components/Button/Button'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import SafeImage from '../../components/SafeImage/SafeImage'
import styles from './AdminProductsPage.module.css'

const priceFormatter = new Intl.NumberFormat('es-ES', {
	style: 'currency',
	currency: 'EUR',
})

function getStockStatus(rawStock) {
	const stock = Number(rawStock)

	if (!Number.isInteger(stock) || stock < 0) return { type: 'unknown', stock: null }
	if (stock === 0) return { type: 'out', stock }
	if (stock <= 3) return { type: 'low', stock }
	return { type: 'available', stock }
}

function getErrorMessage(error, fallback) {
	return error.response?.data?.error || fallback
}

function normalizeSearchTerm(value) {
	return String(value ?? '')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.toLocaleLowerCase('es')
		.trim()
}

function AdminProductsPage() {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [deletingId, setDeletingId] = useState(null)
	const [stockFilter, setStockFilter] = useState('all')
	const [searchTerm, setSearchTerm] = useState('')
	const stockCounts = products.reduce((counts, product) => {
		const status = getStockStatus(product.stock)
		if (status.type === 'low') counts.low += 1
		if (status.type === 'out') counts.out += 1
		return counts
	}, { low: 0, out: 0 })
	const normalizedSearch = normalizeSearchTerm(searchTerm)
	const visibleProducts = products.filter((product) => {
		const matchesStock = stockFilter === 'all'
			|| getStockStatus(product.stock).type === stockFilter
		const searchableText = normalizeSearchTerm(`${product.name ?? ''} ${product.category ?? ''}`)

		return matchesStock && searchableText.includes(normalizedSearch)
	})
	const hasActiveFilters = stockFilter !== 'all' || Boolean(normalizedSearch)

	const loadProducts = async () => {
		try {
			setLoading(true)
			setError('')
			const data = await getProducts()
			setProducts(Array.isArray(data) ? data : [])
		} catch (requestError) {
			setError(getErrorMessage(requestError, 'No se pudieron cargar los productos.'))
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => {
		let active = true

		async function loadInitialProducts() {
			try {
				const data = await getProducts()

				if (active) {
					setProducts(Array.isArray(data) ? data : [])
				}
			} catch (requestError) {
				if (active) {
					setError(getErrorMessage(requestError, 'No se pudieron cargar los productos.'))
				}
			} finally {
				if (active) setLoading(false)
			}
		}

		loadInitialProducts()

		return () => {
			active = false
		}
	}, [])

	const handleDelete = async (product) => {
		const confirmed = window.confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)

		if (!confirmed) return

		try {
			setDeletingId(product.id)
			setError('')
			await deleteProduct(product.id)
			setProducts((currentProducts) => (
				currentProducts.filter((currentProduct) => currentProduct.id !== product.id)
			))
		} catch (requestError) {
			setError(getErrorMessage(requestError, 'No se pudo eliminar el producto.'))
		} finally {
			setDeletingId(null)
		}
	}

	const clearFilters = () => {
		setSearchTerm('')
		setStockFilter('all')
	}

	return (
		<section className={styles.page} aria-labelledby="admin-products-title">
			<header className={styles.header}>
				<div>
					<p className={styles.label}>Administración</p>
					<h1 id="admin-products-title" className={styles.title}>Productos</h1>
					<p className={styles.description}>Crea, edita y elimina productos del catálogo.</p>
				</div>
				<Link className={styles.primaryLink} to="/admin/products/new">
					Crear producto
				</Link>
			</header>

			{!loading && !error && products.length ? (
				<div className={styles.controls}>
					<section className={styles.stockOverview} aria-label="Resumen de existencias">
						<button
							type="button"
							className={`${styles.stockFilter} ${stockFilter === 'all' ? styles.stockFilterActive : ''}`}
							onClick={() => setStockFilter('all')}
							aria-pressed={stockFilter === 'all'}
							aria-label={`Todos los productos: ${products.length}`}
						>
							<span>Todos</span>
							<strong>{products.length}</strong>
						</button>
						<button
							type="button"
							className={`${styles.stockFilter} ${styles.stockFilterLow} ${stockFilter === 'low' ? styles.stockFilterActive : ''}`}
							onClick={() => setStockFilter('low')}
							aria-pressed={stockFilter === 'low'}
							aria-label={`Productos con stock bajo: ${stockCounts.low}`}
						>
							<span>Stock bajo</span>
							<strong>{stockCounts.low}</strong>
						</button>
						<button
							type="button"
							className={`${styles.stockFilter} ${styles.stockFilterOut} ${stockFilter === 'out' ? styles.stockFilterActive : ''}`}
							onClick={() => setStockFilter('out')}
							aria-pressed={stockFilter === 'out'}
							aria-label={`Productos agotados: ${stockCounts.out}`}
						>
							<span>Agotados</span>
							<strong>{stockCounts.out}</strong>
						</button>
					</section>

					<div className={styles.searchRow} role="search">
						<label className={styles.searchField} htmlFor="admin-product-search">
							<span className="visually-hidden">Buscar productos por nombre o categoría</span>
							<span className={styles.searchIcon} aria-hidden="true">
								<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<circle cx="11" cy="11" r="7" />
									<path d="m20 20-4-4" />
								</svg>
							</span>
							<input
								id="admin-product-search"
								type="search"
								value={searchTerm}
								onChange={(event) => setSearchTerm(event.target.value)}
								placeholder="Buscar por nombre o categoría"
								autoComplete="off"
								aria-describedby="admin-products-results"
							/>
						</label>
						{searchTerm ? (
							<button type="button" className={styles.clearSearch} onClick={() => setSearchTerm('')}>
								Limpiar búsqueda
							</button>
						) : null}
						<p id="admin-products-results" className={styles.resultsCount} role="status" aria-live="polite">
							{visibleProducts.length} de {products.length} productos
						</p>
					</div>
				</div>
			) : null}

			{error ? (
				<div className={styles.feedback}>
					<StatusMessage title="No se pudo completar la operación" description={error} variant="error" />
					{loading ? null : <Button onClick={loadProducts}>Reintentar</Button>}
				</div>
			) : null}

			{loading ? (
				<StatusMessage title="Cargando productos" description="Consultando el catálogo..." />
			) : null}

			{!loading && !error && products.length === 0 ? (
				<StatusMessage
					title="Todavía no hay productos"
					description="Crea el primer producto para empezar a gestionar el catálogo."
				/>
			) : null}

			{!loading && products.length > 0 && visibleProducts.length === 0 ? (
				<div className={styles.filterEmpty} role="status">
					<strong>{normalizedSearch ? 'No encontramos productos' : 'No hay productos en este estado'}</strong>
					<span>{normalizedSearch
						? 'Prueba con otro nombre, categoría o estado de stock.'
						: 'Selecciona otro filtro para consultar el inventario.'}</span>
					{hasActiveFilters ? (
						<button type="button" className={styles.clearFilters} onClick={clearFilters}>
							Limpiar filtros
						</button>
					) : null}
				</div>
			) : null}

			{!loading && visibleProducts.length > 0 ? (
				<div
					className={styles.tableWrapper}
					role="region"
					aria-label="Listado de productos; desplázate horizontalmente para ver todas las columnas"
					tabIndex="0"
				>
					<table className={styles.table}>
						<caption className="visually-hidden">Listado de productos administrables</caption>
						<thead>
							<tr>
								<th scope="col">Producto</th>
								<th scope="col">Categoría</th>
								<th scope="col">Precio</th>
								<th scope="col">Stock</th>
								<th scope="col">Destacado</th>
								<th scope="col">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{visibleProducts.map((product) => {
								const stockStatus = getStockStatus(product.stock)
								const stockLabel = stockStatus.type === 'out'
									? 'Agotado'
									: stockStatus.type === 'low'
										? `Últimas ${stockStatus.stock}`
										: stockStatus.type === 'available'
											? `${stockStatus.stock} uds.`
											: 'Sin datos'

								return (
								<tr
									key={product.id}
									className={stockStatus.type === 'out'
										? styles.rowOutOfStock
										: stockStatus.type === 'low' ? styles.rowLowStock : ''}
								>
									<td>
										<div className={styles.product}>
											<SafeImage src={product.imageUrl} alt="" className={styles.thumbnail} />
											<span>{product.name}</span>
										</div>
									</td>
									<td>{product.category}</td>
									<td>{priceFormatter.format(Number(product.price) || 0)}</td>
									<td>
										<span className={`${styles.inventoryBadge} ${stockStatus.type === 'out'
											? styles.inventoryOut
											: stockStatus.type === 'low' ? styles.inventoryLow : styles.inventoryAvailable}`}
										>
											{stockLabel}
										</span>
									</td>
									<td>
										<span className={product.isFeatured ? styles.featuredBadge : styles.regularBadge}>
											{product.isFeatured ? 'Sí' : 'No'}
										</span>
									</td>
									<td>
										<div className={styles.actions}>
											<Link className="app-action-link" to={`/admin/products/${product.id}/edit`}>
												Editar
											</Link>
											<Button
												variant="danger"
												disabled={deletingId !== null}
												onClick={() => handleDelete(product)}
											>
												{deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
											</Button>
										</div>
									</td>
								</tr>
								)
							})}
						</tbody>
					</table>
				</div>
			) : null}
		</section>
	)
}

export default AdminProductsPage
