import { useParams } from 'react-router-dom'
import { mockProducts } from '../../data/mockProducts'
import './ProductDetailPage.css'

function ProductDetailPage() {
	const { productId } = useParams()
	const product = mockProducts.find((item) => item.id === productId)

	if (!product) {
		return (
			<main className="product-detail-page">
				<p className="product-detail-page__error">Producto no encontrado</p>
			</main>
		)
	}

	return (
		<main className="product-detail-page">
			<p className="product-detail-page__label">Ficha del producto</p>
			<h1 className="product-detail-page__title">{product.name}</h1>
			<p className="product-detail-page__intro">
				Figura original de coleccion con acabados detallados y estilo
				inspirado en el universo {product.category}.
			</p>
			<img
				className="product-detail-page__image"
				src={product.imageUrl}
				alt={product.name}
			/>
			<p className="product-detail-page__description">{product.description}</p>
			<p className="product-detail-page__meta">Categoría: {product.category}</p>
			<p className="product-detail-page__meta">
				Precio oficial: {product.price.toFixed(2)} EUR
			</p>
			<p className="product-detail-page__meta">
				Disponibilidad: {product.stock} unidades en stock
			</p>
		</main>
	)
}

export default ProductDetailPage