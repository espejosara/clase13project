function getProductKey(item, index) {
	if (typeof item === 'string') return `name:${item}`

	const productId = item?.productId
		?? item?.product?.id
		?? item?.productDetails?.id

	if (productId !== null && productId !== undefined) {
		return `id:${String(productId)}`
	}

	const productName = item?.name ?? item?.productName ?? item?.product?.name
	return productName ? `name:${productName}` : `line:${index}`
}

function getSafeQuantity(item) {
	const quantity = Number(item?.quantity ?? item?.qty ?? 1)
	return Number.isInteger(quantity) && quantity > 0 ? quantity : 1
}

export function getOrderItemCounts(items = []) {
	if (!Array.isArray(items)) {
		return { totalUnits: 0, distinctProducts: 0 }
	}

	const productKeys = new Set()
	let totalUnits = 0

	items.forEach((item, index) => {
		productKeys.add(getProductKey(item, index))
		totalUnits += getSafeQuantity(item)
	})

	return {
		totalUnits,
		distinctProducts: productKeys.size,
	}
}

export function formatOrderItemSummary(items = []) {
	const { totalUnits, distinctProducts } = getOrderItemCounts(items)
	const unitsLabel = totalUnits === 1 ? 'unidad' : 'unidades'
	const productsLabel = distinctProducts === 1
		? 'producto diferente'
		: 'productos diferentes'

	return `${totalUnits} ${unitsLabel} · ${distinctProducts} ${productsLabel}`
}
