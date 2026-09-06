const PRODUCT_FIELDS = [
	'name',
	'category',
	'description',
	'price',
	'stock',
	'isFeatured',
]

export function buildProductFormData(product, imageFile = null) {
	const formData = new FormData()

	for (const field of PRODUCT_FIELDS) {
		formData.append(field, product[field])
	}

	if (imageFile) {
		formData.append('image', imageFile)
	}

	return formData
}
