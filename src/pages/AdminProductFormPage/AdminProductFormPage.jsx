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
import { buildProductFormData } from '../../utils/productFormData'
import styles from './AdminProductFormPage.module.css'

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set([
	'image/avif',
	'image/gif',
	'image/jpeg',
	'image/png',
	'image/webp',
])

const emptyForm = {
	name: '',
	category: '',
	description: '',
	price: '',
	stock: '',
	isFeatured: false,
}

function getErrorMessage(error, fallback) {
	return error.response?.data?.error || fallback
}

function validateProduct(formData, imageFile, isEditing) {
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

	if (!imageFile && !isEditing) {
		errors.image = 'Selecciona una imagen para el producto'
	} else if (imageFile && !ALLOWED_IMAGE_TYPES.has(imageFile.type)) {
		errors.image = 'Usa una imagen JPG, PNG, WebP, GIF o AVIF'
	} else if (imageFile && imageFile.size > MAX_IMAGE_SIZE_BYTES) {
		errors.image = 'La imagen no puede superar los 5 MB'
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
	const [imageFile, setImageFile] = useState(null)
	const [existingImageUrl, setExistingImageUrl] = useState('')

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
					isFeatured: Boolean(product.isFeatured),
				})
				setExistingImageUrl(product.imageUrl || '')
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
		const { checked, name, type, value } = event.target
		setFormData((currentData) => ({
			...currentData,
			[name]: type === 'checkbox' ? checked : value,
		}))
		setFieldErrors((currentErrors) => ({ ...currentErrors, [name]: '' }))
	}

	const handleFileChange = (event) => {
		const selectedFile = event.target.files?.[0] || null
		setImageFile(selectedFile)
		setFieldErrors((currentErrors) => ({ ...currentErrors, image: '' }))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		const validationErrors = validateProduct(formData, imageFile, isEditing)

		if (Object.keys(validationErrors).length > 0) {
			setFieldErrors(validationErrors)
			return
		}

		const normalizedProduct = {
			name: formData.name.trim(),
			category: formData.category.trim(),
			description: formData.description.trim(),
			price: formData.price,
			stock: formData.stock,
			isFeatured: formData.isFeatured,
		}
		const payload = buildProductFormData(normalizedProduct, imageFile)

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

					<label className={`${styles.featuredField} ${styles.fullWidth}`}>
						<input
							type="checkbox"
							name="isFeatured"
							aria-label="Mostrar en productos destacados"
							checked={formData.isFeatured}
							onChange={handleChange}
						/>
						<span className={styles.featuredCopy}>
							<strong>Mostrar en productos destacados</strong>
							<small>Aparecerá en la cinta de la página principal.</small>
						</span>
					</label>

					<div className={`${styles.field} ${styles.fullWidth}`}>
						<label htmlFor="product-image">
							{isEditing ? 'Nueva imagen (opcional)' : 'Imagen'}
						</label>
						<input
							id="product-image"
							className={styles.fileInput}
							type="file"
							name="image"
							accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
							onChange={handleFileChange}
							aria-invalid={Boolean(fieldErrors.image)}
							aria-describedby={fieldErrors.image ? 'product-image-error' : 'product-image-help'}
						/>
						<p id="product-image-help" className={styles.helpText}>
							JPG, PNG, WebP, GIF o AVIF. Tamaño máximo: 5 MB.
						</p>
						{imageFile ? (
							<p className={styles.selectedFile}>Archivo seleccionado: {imageFile.name}</p>
						) : null}
						{fieldErrors.image ? (
							<p id="product-image-error" className={styles.fieldError} role="alert">
								{fieldErrors.image}
							</p>
						) : null}
					</div>

					{isEditing && existingImageUrl ? (
						<figure className={`${styles.currentImage} ${styles.fullWidth}`}>
							<img src={existingImageUrl} alt={`Imagen actual de ${formData.name || 'producto'}`} />
							<figcaption>Imagen actual; se conservará si no seleccionas otra.</figcaption>
						</figure>
					) : null}

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
