import { useMemo, useState } from 'react'
import { mockProducts } from '../../data/mockProducts'
import ProductsGrid from '../../components/ProductsGrid/ProductsGrid'
import './ProductsPage.css'

function ProductsPage() {
	const [selectedCategory, setSelectedCategory] = useState('todas')
	const [searchTerm, setSearchTerm] = useState('')

	const categories = useMemo(() => {
		const uniqueCategories = new Set(mockProducts.map((product) => product.category))
		return ['todas', ...Array.from(uniqueCategories)]
	}, [])

	const visibleProducts = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase()

		return mockProducts.filter((product) => {
			const matchesCategory =
				selectedCategory === 'todas' || product.category === selectedCategory
			const matchesSearch =
				product.name.toLowerCase().includes(normalizedSearch) ||
				product.category.toLowerCase().includes(normalizedSearch)

			return matchesCategory && matchesSearch
		})
	}, [selectedCategory, searchTerm])

	return (
		<section className="products-page">
			<header className="products-page__header">
				<p className="products-page__eyebrow">Catalogo oficial</p>
				<h1 className="products-page__title">Descubre todas las figuras</h1>
				<p className="products-page__intro">
					Busca por nombre o filtra por categoria para encontrar la pieza que
					mejor encaja con tu coleccion.
				</p>
			</header>

			<section className="products-page__toolbar">
				<div className="products-page__field">
					<label className="products-page__filter-label" htmlFor="search-filter">
						Buscar producto
					</label>
					<input
						id="search-filter"
						className="products-page__input"
						type="text"
						placeholder="Escribe para filtrar por nombre o categoria..."
						value={searchTerm}
						onChange={(event) => setSearchTerm(event.target.value)}
					/>
				</div>

				<div className="products-page__field">
					<label className="products-page__filter-label" htmlFor="category-filter">
						Filtrar por categoria
					</label>
					<select
						id="category-filter"
						className="products-page__select"
						value={selectedCategory}
						onChange={(event) => setSelectedCategory(event.target.value)}
					>
						{categories.map((category) => (
							<option key={category} value={category}>
								{category}
							</option>
						))}
					</select>
				</div>
			</section>

			<p className="products-page__count">
				Mostrando {visibleProducts.length} producto(s)
			</p>

			<ProductsGrid products={visibleProducts} />
		</section>
	)
}

export default ProductsPage