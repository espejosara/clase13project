import { useMemo, useState } from 'react'
import ProductGrid from '../../components/ProductGrid/ProductGrid'
import Spinner from '../../components/Spinner/Spinner'
import { useProducts } from '../../hooks/useProducts'
import './ProductsPage.css'

function ProductsPage() {
	const [selectedCategory, setSelectedCategory] = useState('todas')
	const [searchTerm, setSearchTerm] = useState('')
	const [sortBy, setSortBy] = useState('name-asc')
	const { data: products, loading, error } = useProducts()

	const categories = useMemo(() => {
		const uniqueCategories = new Set(products.map((product) => product.category))
		return ['todas', ...Array.from(uniqueCategories)]
	}, [products])

	const visibleProducts = useMemo(() => {
		const normalizedSearch = searchTerm.trim().toLowerCase()
		const filteredProducts = products.filter((product) => {
			const matchesCategory =
				selectedCategory === 'todas' || product.category === selectedCategory
			const matchesSearch =
				product.name.toLowerCase().includes(normalizedSearch) ||
				product.category.toLowerCase().includes(normalizedSearch)

			return matchesCategory && matchesSearch
		})

		return filteredProducts.slice().sort((firstProduct, secondProduct) => {
			switch (sortBy) {
				case 'price-asc':
					return firstProduct.price - secondProduct.price
				case 'price-desc':
					return secondProduct.price - firstProduct.price
				case 'name-desc':
					return secondProduct.name.localeCompare(firstProduct.name)
				case 'name-asc':
				default:
					return firstProduct.name.localeCompare(secondProduct.name)
			}
		})
	}, [products, selectedCategory, searchTerm, sortBy])

	if (loading) {
		return <Spinner label="Cargando catálogo..." />
	}

	if (error) {
		return <p>Error al cargar productos: {error}</p>
	}

	return (
		<section className="products-page">
			<header className="products-page__panel products-page__hero">
				<div className="products-page__hero-copy">
					<p className="products-page__eyebrow">Catalogo oficial</p>
					<h1 className="products-page__title">Catalogo NeoKensei Chronicles</h1>
					<p className="products-page__intro">
						Busca por nombre o filtra por categoria para encontrar la pieza que
						mejor encaja con tu coleccion.
					</p>
				</div>

				<div className="products-page__toolbar">
					<div className="products-page__field products-page__field--search">
						<label className="products-page__filter-label" htmlFor="search-filter">
							Buscar producto
						</label>
						<input
							id="search-filter"
							className="products-page__input"
							type="text"
							placeholder="Escribe para buscar por nombre o categoria"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
						/>
					</div>

					<div className="products-page__field products-page__field--category">
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

					<div className="products-page__field products-page__field--sort">
						<label className="products-page__filter-label" htmlFor="sort-filter">
							Ordenar por
						</label>
						<select
							id="sort-filter"
							className="products-page__select"
							value={sortBy}
							onChange={(event) => setSortBy(event.target.value)}
						>
							<option value="name-asc">Nombre A-Z</option>
							<option value="name-desc">Nombre Z-A</option>
							<option value="price-asc">Precio menor a mayor</option>
							<option value="price-desc">Precio mayor a menor</option>
						</select>
					</div>
				</div>

				<div className="products-page__results-bar">
					<p className="products-page__count">
						Mostrando {visibleProducts.length} producto(s)
					</p>
				</div>
			</header>

			<ProductGrid products={visibleProducts} />
		</section>
	)
}

export default ProductsPage