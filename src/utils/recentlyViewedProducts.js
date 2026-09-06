export const RECENTLY_VIEWED_STORAGE_KEY = 'neokensei:recently-viewed-products'

const MAX_STORED_PRODUCTS = 5

export function getRecentlyViewedStorageKey(userKey) {
	if (userKey === null || userKey === undefined || userKey === '') return null
	return `${RECENTLY_VIEWED_STORAGE_KEY}:${String(userKey)}`
}

function normalizeProduct(product) {
	if (!product || product.id === null || product.id === undefined || !product.name) {
		return null
	}

	return {
		id: product.id,
		name: String(product.name),
		category: String(product.category ?? ''),
		imageUrl: String(product.imageUrl ?? ''),
		price: Number(product.price) || 0,
		stock: product.stock === null || product.stock === undefined
			? null
			: Number(product.stock),
	}
}

export function readRecentlyViewedProducts(userKey) {
	const storageKey = getRecentlyViewedStorageKey(userKey)
	if (!storageKey) return []

	try {
		const storedProducts = JSON.parse(localStorage.getItem(storageKey) || '[]')
		if (!Array.isArray(storedProducts)) return []

		return storedProducts
			.map(normalizeProduct)
			.filter(Boolean)
			.slice(0, MAX_STORED_PRODUCTS)
	} catch {
		return []
	}
}

export function rememberViewedProduct(product, userKey) {
	const normalizedProduct = normalizeProduct(product)
	const storageKey = getRecentlyViewedStorageKey(userKey)
	if (!normalizedProduct || !storageKey) return

	const previousProducts = readRecentlyViewedProducts(userKey)
	const nextProducts = [
		normalizedProduct,
		...previousProducts.filter((item) => String(item.id) !== String(normalizedProduct.id)),
	].slice(0, MAX_STORED_PRODUCTS)

	try {
		localStorage.setItem(storageKey, JSON.stringify(nextProducts))
	} catch {
		// La navegación debe seguir funcionando aunque el navegador bloquee localStorage.
	}
}
