import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getProducts } from '../../api/products'
import Button from '../../components/Button/Button'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import styles from './AdminProductsPage.module.css'

const priceFormatter = new Intl.NumberFormat('es-ES', {
	style: 'currency',
	currency: 'EUR',
})

function getErrorMessage(error, fallback) {
	return error.response?.data?.error || fallback
}

function AdminProductsPage() {
	const [products, setProducts] = useState([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState('')
	const [deletingId, setDeletingId] = useState(null)

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

			{!loading && products.length > 0 ? (
				<div className={styles.tableWrapper}>
					<table className={styles.table}>
						<caption className="visually-hidden">Listado de productos administrables</caption>
						<thead>
							<tr>
								<th scope="col">Producto</th>
								<th scope="col">Categoría</th>
								<th scope="col">Precio</th>
								<th scope="col">Stock</th>
								<th scope="col">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{products.map((product) => (
								<tr key={product.id}>
									<td>
										<div className={styles.product}>
											<img src={product.imageUrl} alt="" className={styles.thumbnail} />
											<span>{product.name}</span>
										</div>
									</td>
									<td>{product.category}</td>
									<td>{priceFormatter.format(Number(product.price) || 0)}</td>
									<td>{product.stock}</td>
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
							))}
						</tbody>
					</table>
				</div>
			) : null}
		</section>
	)
}

export default AdminProductsPage
