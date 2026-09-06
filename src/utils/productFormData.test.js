import { describe, expect, it } from 'vitest'
import { buildProductFormData } from './productFormData'

const product = {
	name: 'Figura',
	category: 'Acción',
	description: 'Figura de prueba',
	price: '24.99',
	stock: '5',
	isFeatured: true,
}

describe('buildProductFormData', () => {
	it('crea el multipart con los campos y la imagen esperados', () => {
		const image = new File(['imagen'], 'figura.png', { type: 'image/png' })
		const formData = buildProductFormData(product, image)

		expect(formData.get('name')).toBe('Figura')
		expect(formData.get('category')).toBe('Acción')
		expect(formData.get('description')).toBe('Figura de prueba')
		expect(formData.get('price')).toBe('24.99')
		expect(formData.get('stock')).toBe('5')
		expect(formData.get('isFeatured')).toBe('true')
		expect(formData.get('image')).toBe(image)
	})

	it('permite editar sin reemplazar la imagen', () => {
		const formData = buildProductFormData(product)

		expect(formData.has('image')).toBe(false)
	})
})
