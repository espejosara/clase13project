import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
	createProduct,
	getProductById,
	updateProduct,
} from '../../api/products'
import Button from '../../components/Button/Button'
import FormInput from '../../components/FormInput/FormInput'
import StatusMessage from '../../components/StatusMessage/StatusMessage'
import styles from './AdminProductFormPage.module.css'

const emptyForm = {
	name: '',
	category: '',
	description: '',
	price: '',
	stock: '',
	imageUrl: '',
}

function getErrorMessage(error, fallback) {
	return error.response?.data?.error || fallback
}

function isValidImageUrl(value) {
	try {
		const url = new URL(value)
		return url.protocol === 'http:' || url.protocol === 'https:'
	} catch {
		return false
	}
}

function validateProduct(formData) {
	const errors = {}
	const price = Number(formData.price)
	const stock = Number(formData.stock)

	if (!formData.name.trim()) errors.name = 'El nombre es obligatorio'
	if (!formData.category.trim()) errors.category = 'La categoría es obligatoria'
	if (!formData.description.trim()) errors.description = 'La descripción es obligatoria'

	if (!formData.price.trim()) {
		errors.price = 'El precio es obligatorio'
	} else if (!Number.isFinite(price) || price <= 0) {
		errors.price = 'El precio debe ser mayor que 0'
	}

	if (!formData.stock.trim()) {
		errors.stock = 'El stock es obligatorio'
	} else if (!Number.isInteger(stock) || stock < 0) {
		errors.stock = 'El stock debe ser un número entero igual o mayor que 0'
	}

	if (!formData.imageUrl.trim()) {
		errors.imageUrl = 'La URL de la imagen es obligatoria'
	} else if (!isValidImageUrl(formData.imageUrl.trim())) {
		errors.imageUrl = 'Introduce una URL de imagen válida'
	}

	return errors
}

function AdminProductFormPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const isEditing = Boolean(id)
	const [formData, setFormData] = useState(emptyForm)
	const [loading, setLoading] = useState(isEditing)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [fieldErrors, setFieldErrors] = useState({})

	useEffect(() => {
		if (!isEditing) return undefined

		let active = true

		async function loadProduct() {
			try {
				setLoading(true)
				setError('')
				const product = await getProductById(id)

				if (!active) return

				setFormData({
					name: product.name || '',
					category: product.category || '',
					description: product.description || '',
					price: String(product.price ?? ''),
					stock: String(product.stock ?? ''),
					imageUrl: product.imageUrl || '',
				})
			} catch (requestError) {
				if (active) {
					setError(getErrorMessage(requestError, 'No se pudo cargar el producto.'))
				}
			} finally {
				if (active) setLoading(false)
			}
		}

		loadProduct()

		return () => {
			active = false
		}
	}, [id, isEditing])

	const handleChange = (event) => {
		const { name, value } = event.target
		setFormData((currentData) => ({ ...currentData, [name]: value }))
		setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		const validationErrors = validateProduct(formData)

		if (Object.keys(validationErrors).length > 0) {
			setFieldErrors(validationErrors)
			return
		}

		const payload = {
			...formData,
			name: formData.name.trim(),
			category: formData.category.trim(),
			description: formData.description.trim(),
			imageUrl: formData.imageUrl.trim(),
			price: Number(formData.price),
			stock: Number(formData.stock),
		}

		try {
			setSubmitting(true)
			setError('')

			if (isEditing) {
				await updateProduct(id, payload)
			} else {
				await createProduct(payload)
			}

			navigate('/admin/products', { replace: true })
		} catch (requestError) {
			setError(getErrorMessage(
				requestError,
				isEditing ? 'No se pudo actualizar el producto.' : 'No se pudo crear el producto.',
			))
		} finally {
			setSubmitting(false)
		}
	}

	if (loading) {
		return <StatusMessage title="Cargando producto" description="Consultando sus datos..." />
	}

	return (
		<section className={styles.page} aria-labelledby="admin-product-form-title">
			<header>
				<p className={styles.label}>Administración</p>
				<h1 id="admin-product-form-title" className={styles.title}>
					{isEditing ? 'Editar producto' : 'Crear producto'}
				</h1>
			</header>

			{error ? (
				<StatusMessage title="No se pudo guardar" description={error} variant="error" />
			) : null}

			<form className={styles.form} onSubmit={handleSubmit} noValidate>
				<div className={styles.grid}>
					<FormInput
						autoFocus={!isEditing}
						id="product-name"
						name="name"
						label="Nombre"
						value={formData.name}
						onChange={handleChange}
						error={fieldErrors.name}
					/>

					<FormInput
						id="product-category"
						name="category"
						label="Categoría"
						value={formData.category}
						onChange={handleChange}
						error={fieldErrors.category}
					/>

					<FormInput
						id="product-price"
						name="price"
						type="number"
						min="0.01"
						step="0.01"
						label="Precio (€)"
						value={formData.price}
						onChange={handleChange}
						error={fieldErrors.price}
					/>

					<FormInput
						id="product-stock"
						name="stock"
						type="number"
						min="0"
						step="1"
						label="Stock"
						value={formData.stock}
						onChange={handleChange}
						error={fieldErrors.stock}
					/>

					<div className={styles.fullWidth}>
						<FormInput
							id="product-image-url"
							name="imageUrl"
							type="url"
							label="URL de la imagen"
							placeholder="https://ejemplo.com/producto.jpg"
							value={formData.imageUrl}
							onChange={handleChange}
							error={fieldErrors.imageUrl}
						/>
					</div>

					<label className={`${styles.field} ${styles.fullWidth}`}>
						<span>Descripción</span>
						<textarea
							id="product-description"
							name="description"
							rows="6"
							value={formData.description}
							onChange={handleChange}
							aria-invalid={Boolean(fieldErrors.description)}
							aria-describedby={fieldErrors.description ? 'product-description-error' : undefined}
						/>
						{fieldErrors.description ? (
							<p id="product-description-error" className={styles.fieldError} role="alert">
								{fieldErrors.description}
							</p>
						) : null}
					</label>
				</div>

				<div className={styles.actions}>
					<Button type="submit" disabled={submitting}>
						{submitting ? 'Guardando...' : isEditing ? 'Actualizar producto' : 'Crear producto'}
					</Button>
					<Link className="app-action-link" to="/admin/products">Cancelar</Link>
				</div>
			</form>
		</section>
	)
}

export default AdminProductFormPage
